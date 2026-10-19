#!/usr/bin/env python3
"""Dispatch gate: caps, snapshots, namespace checks, and the dispatch record.

Every piece of work sent to an agent (fresh spawn or continuation) is bracketed by:

    round_gate.py <out> dispatch --role <role> --loop <loop[:key]> --writes <ns> [--writes …]
                                 [--exclude <glob>]… --label <label> [--pivot]
    … write run/handoffs/NN-<role>.prompt.md, run the agent, save NN-<role>.report.md …
    round_gate.py <out> receive NN [--abandon "reason"]

Other commands:
    round_gate.py <out> ack NN --note "…"            acknowledge a namespace violation after handling it
    round_gate.py <out> extend --decision d-NN [--spawns N] [--minutes M] [--loop name=N]
    round_gate.py <out> stage <stage>                 record the pipeline stage
    round_gate.py <out> status                        caps, usage, open dispatches (exit 1 if any open)

Exit codes for dispatch: 0 authorised · 2 cap reached (escalate) · 3 no progress (pivot, then
re-run with --pivot) · 4 no progress after a pivot (escalate) · 5 bookkeeping incomplete.
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import (  # noqa: E402
    ORCHESTRATOR_NS, die, file_manifest, log_append, now, parse_time, resolve_run, save_state,
    load_state, under, write_atomic, blocks,
)

STAGES = ["intake", "research", "plan", "checkpoint", "build", "review", "deliver", "done"]


def agent_minutes(state: dict) -> float:
    """Wall-clock minutes during which at least one agent was running (union of intervals)."""
    spans = []
    t_now = parse_time(now())
    for d in state["dispatches"]:
        a = parse_time(d["opened"])
        b = parse_time(d["closed"]) if d.get("closed") else t_now
        spans.append((a, b))
    spans.sort()
    total, cur_a, cur_b = 0.0, None, None
    for a, b in spans:
        if cur_b is None or a > cur_b:
            if cur_b is not None:
                total += (cur_b - cur_a).total_seconds()
            cur_a, cur_b = a, b
        else:
            cur_b = max(cur_b, b)
    if cur_b is not None:
        total += (cur_b - cur_a).total_seconds()
    return total / 60


def refuse(code: int, msg: str, run: Path, label: str):
    log_append(run, "round_gate", "refused", f"Dispatch `{label}` refused (exit {code}): {msg}")
    print(f"REFUSED: {msg}", file=sys.stderr)
    sys.exit(code)


def checkpoint_notes_repeat(run: Path) -> bool:
    p = run / "decisions.md"
    if not p.exists():
        return False
    answers = [f.get("answer", "").strip().lower()
               for _, _, f in blocks(p.read_text(), r"d-\d+")
               if f.get("decision", "").strip() == "revise"]
    return len(answers) >= 2 and answers[-1] == answers[-2] and answers[-1] != ""


def cmd_dispatch(a, out: Path, run: Path):
    state = load_state(run)
    label = f"{a.role}/{a.label}"
    loop_name = a.loop.split(":")[0]

    # 1. bookkeeping from earlier dispatches
    for d in state["dispatches"]:
        if not d.get("closed") and d["loop"] == a.loop:
            refuse(5, f"dispatch {d['nn']:02d} in loop {a.loop} was never received; "
                      f"run `round_gate.py receive {d['nn']}` first", run, label)
        if d.get("closed") and d.get("ns_ok") is False and not d.get("ack"):
            refuse(5, f"dispatch {d['nn']:02d} wrote outside its namespace and hasn't been "
                      f"acknowledged; inspect, restore if needed, then `round_gate.py ack {d['nn']} --note …`",
                   run, label)

    # 2. run-level caps
    caps = state["caps"]
    if len(state["dispatches"]) >= caps["spawns"]:
        refuse(2, f"dispatch cap reached ({caps['spawns']}). Escalate to the user with options; "
                  f"extend only on their decision.", run, label)
    used = agent_minutes(state)
    if used >= caps["agent_minutes"]:
        refuse(2, f"agent-time cap reached ({used:.0f}/{caps['agent_minutes']} min). Escalate.", run, label)

    # 3. loop caps
    if loop_name != "none":
        cap = caps["loops"].get(a.loop, caps["loops"].get(loop_name))
        if cap is None:
            die(f"unknown loop '{loop_name}' (known: {', '.join(caps['loops'])}, none)")
        n = state["loops"].get(a.loop, 0)
        if n >= cap:
            refuse(2, f"loop {a.loop} cap reached ({n}/{cap}). Escalate with what's still open.", run, label)

    # 4. no-progress
    if loop_name == "gate":
        hist = state["gate_history"].get(a.loop, [])
        np = state["noprogress"].get(a.loop, {})
        if len(hist) >= 2 and hist[-1] and hist[-1] == hist[-2]:
            if np.get("pivot_at") is not None and len(hist) > np["pivot_at"]:
                refuse(4, f"same gate failures persist after a pivot in {a.loop}: {hist[-1]}. "
                          f"Have the builder return `blocked` with evidence, or escalate.", run, label)
            if not a.pivot:
                refuse(3, f"identical gate failures twice in {a.loop}: {hist[-1]}. Tell the builder to try "
                          f"a structurally different approach (say so in the handoff), then re-run with --pivot.",
                       run, label)
            state["noprogress"][a.loop] = {"pivot_at": len(hist)}
    if loop_name == "checkpoint" and checkpoint_notes_repeat(run) and not a.pivot:
        refuse(3, "the user's last two revise notes are identical; the revision isn't landing. "
                  "Show the user what changed and ask what's still wrong (escalate) rather than looping.",
               run, label)

    # authorised
    state["seq"] += 1
    nn = state["seq"]
    role_tag = re.sub(r"[^a-z0-9-]+", "-", a.role.lower())
    snap = run / "history" / f"{nn:02d}-{role_tag}"
    snapped = []
    for ns in a.writes:
        src = out / ns
        if src.exists():
            dst = snap / ns
            if src.is_dir():
                shutil.copytree(src, dst, dirs_exist_ok=True)
            else:
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
            snapped.append(ns)
    man_dir = run / "history" / ".manifests"
    man_dir.mkdir(parents=True, exist_ok=True)
    write_atomic(man_dir / f"{nn:02d}.json", json.dumps(file_manifest(out)))

    state["loops"][a.loop] = state["loops"].get(a.loop, 0) + (0 if loop_name == "none" else 1)
    state["dispatches"].append({
        "nn": nn, "role": a.role, "loop": a.loop, "label": a.label,
        "writes": a.writes, "exclude": a.exclude, "opened": now(), "closed": None,
        "status": None, "ns_ok": None, "pivot": bool(a.pivot),
    })
    save_state(run, state)

    prompt = f"handoffs/{nn:02d}-{role_tag}.prompt.md"
    loop_info = "" if loop_name == "none" else \
        f", loop {a.loop} round {state['loops'][a.loop]}/{caps['loops'].get(a.loop, caps['loops'].get(loop_name))}"
    log_append(
        run, "orchestrator", "dispatch",
        f"Dispatch {nn:02d} → **{a.role}** ({a.label}){loop_info}{' — PIVOT' if a.pivot else ''}. "
        f"May write: {', '.join(f'`{w}`' for w in a.writes)}"
        + (f" except {', '.join(f'`{e}`' for e in a.exclude)}" if a.exclude else "") + ". "
        f"Usage: {len(state['dispatches'])}/{caps['spawns']} dispatches, {agent_minutes(state):.0f}/{caps['agent_minutes']} agent-min.",
        links=[prompt] + ([f"history/{nn:02d}-{role_tag}"] if snapped else []),
    )
    print(f"NN={nn:02d}")
    print(f"handoff: {run / prompt}")
    print(f"report:  {run / prompt.replace('.prompt.md', '.report.md')}")


def cmd_receive(a, out: Path, run: Path):
    state = load_state(run)
    nn = int(a.nn)
    d = next((x for x in state["dispatches"] if x["nn"] == nn), None)
    if not d:
        die(f"no dispatch {nn:02d}")
    if d.get("closed"):
        die(f"dispatch {nn:02d} already received")
    role_tag = re.sub(r"[^a-z0-9-]+", "-", d["role"].lower())
    prompt = run / "handoffs" / f"{nn:02d}-{role_tag}.prompt.md"
    report = run / "handoffs" / f"{nn:02d}-{role_tag}.report.md"

    if a.abandon:
        d.update(closed=now(), status="abandoned", ns_ok=True)
        save_state(run, state)
        log_append(run, "orchestrator", "receive", f"Dispatch {nn:02d} ({d['role']}) abandoned: {a.abandon}")
        print(f"abandoned {nn:02d}")
        return

    missing = [str(p.relative_to(run)) for p in (prompt, report) if not p.exists()]
    if missing:
        die(f"bookkeeping incomplete for {nn:02d}: missing {', '.join(missing)}. Save the handoff and "
            f"the agent's final report verbatim, then receive again.", 5)
    rep = report.read_text()
    m = re.search(r"^\s*status:\s*(done_with_concerns|done|blocked)\b", rep, flags=re.M)
    if not m:
        die(f"report {report.name} has no `status:` line (done | done_with_concerns | blocked). Ask the "
            f"agent to restate its report in the templates/report.md format.", 1)
    status = m.group(1)
    reason = re.search(r"^\s*reason:\s*(\S+)", rep, flags=re.M)

    # namespace check: compare against this dispatch's pre-manifest; allow writes from every dispatch
    # whose interval overlapped this one (parallel batches), plus the orchestrator's namespaces.
    before = json.loads((run / "history" / ".manifests" / f"{nn:02d}.json").read_text())
    after = file_manifest(out)
    changed = sorted({p for p in set(before) | set(after) if before.get(p) != after.get(p)})
    t_open = parse_time(d["opened"])
    allowed, excluded = [], []
    for x in state["dispatches"]:
        x_close = parse_time(x["closed"]) if x.get("closed") else None
        if x is d or (parse_time(x["opened"]) <= parse_time(now()) and (x_close is None or x_close >= t_open)):
            allowed += x["writes"]
            if x is d:
                excluded += x.get("exclude", [])
    violations = []
    for p in changed:
        if under(p, ORCHESTRATOR_NS):
            continue
        own_ok = under(p, d["writes"]) and not any(fnmatch.fnmatch(p, e) for e in excluded)
        other_ok = under(p, [w for w in allowed if w not in d["writes"]])
        if not (own_ok or other_ok):
            violations.append(p)

    d.update(closed=now(), status=status, reason=reason.group(1) if reason else None,
             ns_ok=not violations, changed=len(changed))
    save_state(run, state)
    msg = f"Received {nn:02d} ← **{d['role']}**: `{status}`" + (f" ({d['reason']})" if d.get("reason") else "") + \
          f". {len(changed)} file(s) changed."
    if violations:
        msg += f" **Namespace violation** ({len(violations)}): " + ", ".join(f"`{v}`" for v in violations[:10])
    log_append(run, "orchestrator", "receive", msg, links=[str(report.relative_to(run))])
    print(f"status: {status}" + (f" ({d['reason']})" if d.get("reason") else ""))
    print(f"changed files: {len(changed)}")
    if violations:
        print("NAMESPACE VIOLATION (writes outside allowed namespaces):", file=sys.stderr)
        for v in violations:
            print(f"  {v}", file=sys.stderr)
        print(f"Snapshot of the allowed namespaces: {run / 'history' / f'{nn:02d}-{role_tag}'}", file=sys.stderr)
        print(f"Inspect, restore if harmful, then: round_gate.py {out} ack {nn} --note '…'", file=sys.stderr)
        sys.exit(5)


def cmd_ack(a, out: Path, run: Path):
    state = load_state(run)
    d = next((x for x in state["dispatches"] if x["nn"] == int(a.nn)), None)
    if not d:
        die(f"no dispatch {a.nn}")
    d["ack"] = a.note
    save_state(run, state)
    log_append(run, "orchestrator", "ack", f"Namespace violation in {int(a.nn):02d} acknowledged: {a.note}")


def cmd_extend(a, out: Path, run: Path):
    state = load_state(run)
    dec = run / "decisions.md"
    if not dec.exists() or not re.search(rf"^###\s+{re.escape(a.decision)}\b", dec.read_text(), flags=re.M):
        die(f"{a.decision} not found in decisions.md; caps are extended only on a recorded user decision")
    c = state["caps"]
    changes = []
    if a.spawns:
        c["spawns"] += a.spawns
        changes.append(f"+{a.spawns} dispatches")
    if a.minutes:
        c["agent_minutes"] += a.minutes
        changes.append(f"+{a.minutes} agent-min")
    for spec in a.loop or []:
        k, v = spec.split("=")
        c["loops"][k] = int(v)
        changes.append(f"loop {k}={v}")
    save_state(run, state)
    log_append(run, "orchestrator", "extend", f"Caps extended per {a.decision}: {', '.join(changes)}.",
               links=["decisions.md"])
    print(json.dumps(c))


def cmd_stage(a, out: Path, run: Path):
    if a.stage not in STAGES:
        die(f"stage must be one of {STAGES}")
    state = load_state(run)
    prev = state["stage"]
    state["stage"] = a.stage
    save_state(run, state)
    log_append(run, "orchestrator", "stage", f"Stage: {prev} → **{a.stage}**")


def cmd_status(a, out: Path, run: Path):
    state = load_state(run)
    c = state["caps"]
    print(f"stage: {state['stage']}")
    print(f"dispatches: {len(state['dispatches'])}/{c['spawns']}  agent-min: {agent_minutes(state):.0f}/{c['agent_minutes']}")
    print("loops: " + ", ".join(f"{k}={v}" for k, v in state["loops"].items()))
    open_d = [d for d in state["dispatches"] if not d.get("closed")]
    for d in state["dispatches"]:
        flag = "OPEN" if not d.get("closed") else (d.get("status") or "")
        ns = "" if d.get("ns_ok") in (None, True) else (" NS-VIOLATION" + (" (acked)" if d.get("ack") else ""))
        print(f"  {d['nn']:02d} {d['role']:<24} {d['loop']:<20} {flag}{ns}")
    sys.exit(1 if open_d else 0)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("out")
    sub = ap.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("dispatch")
    d.add_argument("--role", required=True)
    d.add_argument("--loop", required=True, help="research | checkpoint | gate:<page|widget-id> | review:<reviewer> | none")
    d.add_argument("--writes", action="append", required=True, help="namespace relative to <out>, e.g. site or run/plan")
    d.add_argument("--exclude", action="append", default=[], help="glob (relative to <out>) carved out of --writes")
    d.add_argument("--label", required=True)
    d.add_argument("--pivot", action="store_true")
    r = sub.add_parser("receive")
    r.add_argument("nn")
    r.add_argument("--abandon")
    k = sub.add_parser("ack")
    k.add_argument("nn")
    k.add_argument("--note", required=True)
    e = sub.add_parser("extend")
    e.add_argument("--decision", required=True)
    e.add_argument("--spawns", type=int)
    e.add_argument("--minutes", type=int)
    e.add_argument("--loop", action="append")
    s = sub.add_parser("stage")
    s.add_argument("stage")
    sub.add_parser("status")
    a = ap.parse_args()
    out, run = resolve_run(a.out)
    {"dispatch": cmd_dispatch, "receive": cmd_receive, "ack": cmd_ack, "extend": cmd_extend,
     "stage": cmd_stage, "status": cmd_status}[a.cmd](a, out, run)


if __name__ == "__main__":
    main()
