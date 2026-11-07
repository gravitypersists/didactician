#!/usr/bin/env python3
"""Write run/cost.md (for people) and run/cost.json (for evals) from the run's token usage.

    cost_report.py <out|run> [--origin <path>] [--transcripts <dir>]

Two steps:
1. Refresh run/usage/ from Claude Code's transcripts (via _transcripts.py, the only code that reads
   them). A usage file is never replaced by one with fewer turns, so a run keeps its numbers after
   Claude Code cleans up old transcripts (cleanupPeriodDays, 30 days by default).
2. Build the report from run/usage/ alone.

--origin       where the run lived when it ran, if it has moved since (transcripts name that path)
--transcripts  a Claude Code projects/<dir> to search instead of the one derived from the path

round_gate.py runs this after every receive. Exit codes: 0 written · 3 transcript or usage format
not recognised (nothing written).
"""

from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import load_state, now, resolve_run, write_atomic  # noqa: E402
from _transcripts import FORMAT_VERSION, TranscriptFormatError, collect  # noqa: E402

WEIGHTS = {"input": 1, "cache_write_5m": 1.25, "cache_write_1h": 2, "cache_read": 0.1, "output": 5}
COLD_WRITE = 50_000      # a continuation whose first turn writes more than this started cold
BIG_FILE = 20_000        # bytes; whole reads of files at least this big count as a cause
BYTES_PER_TOKEN = 4


# ── step 1: refresh run/usage/ ───────────────────────────────────────────────

def _usage_name(header: dict) -> str:
    if header["role"] == "orchestrator":
        return "orchestrator.jsonl"
    tag = re.sub(r"[^a-z0-9-]+", "-", header["role"].lower())
    return f"{header['dispatch']:02d}-{tag}.jsonl"


def _turns_in(lines) -> int:
    return sum(1 for e in lines if e.get("t") == "turn")


def _log_span(run: Path, state: dict) -> tuple[str, str]:
    stamps = re.findall(r"^### (\S+) · ", (run / "log.md").read_text(), flags=re.M) if (run / "log.md").exists() else []
    return state["created"], (stamps[-1] if stamps else now())


def refresh_usage(out: Path, run: Path, origin: Path, override: str | None) -> list[str]:
    state = load_state(run)
    roles = {d["nn"]: d["role"] for d in state["dispatches"]}
    since, until = _log_span(run, state)
    subs, orch, dirs = collect(out, run, origin, since, until, roles, override)
    files: dict[str, list[dict]] = defaultdict(list)
    for seg in subs + orch:
        files[_usage_name(seg["header"])] += [seg["header"], *seg["events"]]
    notes = []
    if not dirs:
        notes.append("no Claude Code transcript folder found for this run's path")
    udir = run / "usage"
    for name, lines in files.items():
        p = udir / name
        if p.exists():
            old = [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
            if _turns_in(old) > _turns_in(lines):
                notes.append(f"kept {name}: transcripts now show fewer turns than recorded (cleaned up?)")
                continue
        write_atomic(p, "".join(json.dumps(x, separators=(",", ":")) + "\n" for x in lines))
    return notes


# ── step 2: report ───────────────────────────────────────────────────────────

def ieq(t: dict) -> float:
    return sum(t.get(k, 0) * w for k, w in WEIGHTS.items())


def ctx(t: dict) -> int:
    return t["input"] + t["cache_write_5m"] + t["cache_write_1h"] + t["cache_read"]


def load_usage(run: Path) -> list[dict]:
    segs = []
    for p in sorted((run / "usage").glob("*.jsonl")):
        cur = None
        for line in p.read_text().splitlines():
            if not line.strip():
                continue
            e = json.loads(line)
            if e.get("v") != FORMAT_VERSION:
                raise TranscriptFormatError(f"{p.name}: usage format v{e.get('v')} (this script reads v{FORMAT_VERSION})")
            if e["t"] == "segment":
                cur = {"h": e, "turns": [], "after": []}  # after: (turn index the event arrived before, event)
                segs.append(cur)
            elif cur is not None:
                if e["t"] == "turn":
                    cur["turns"].append(e)
                else:
                    cur["after"].append((len(cur["turns"]), e))
    return segs


def stage_timeline(run: Path) -> list[tuple[str, str]]:
    text = (run / "log.md").read_text() if (run / "log.md").exists() else ""
    return re.findall(r"^### (\S+) · [^\n]*· stage\nStage: \S+ → \*\*([a-z-]+)\*\*", text, flags=re.M)


def stage_of(seg: dict, dispatch: dict | None, first_in_loop: bool, timeline) -> str:
    role = seg["h"]["role"]
    if role == "orchestrator":
        return "Orchestrator"
    at = "intake"
    opened = (dispatch or {}).get("opened") or seg["h"]["ts"]
    for ts, st in timeline:
        if ts <= opened:
            at = st
    if role == "researcher":
        return "Research"
    if role == "instructional-designer":
        return "Plan" if at in ("intake", "research", "plan", "checkpoint") else "Replan"
    if role.endswith("reviewer"):
        return "Review"
    if role.endswith("builder"):
        if first_in_loop:
            return "Build"
        if at == "human-review":
            return "Fixes (your review)"
        return "Fixes (review)" if at in ("review", "deliver", "done") else "Fixes (gate)"
    return "Other"


def plural(n: int, word: str) -> str:
    return f"{n} {word}{'' if n == 1 else 's'}"


def fmt(n: float) -> str:
    if n >= 1e6:
        return f"{n / 1e6:.1f}M"
    if n >= 1e3:
        return f"{n / 1e3:.0f}k"
    return f"{n:.0f}"


def bars(rows: list[tuple[str, float, str]], total: float, width: int = 32, label_w: int = 21) -> str:
    top = max((v for _, v, _ in rows), default=0) or 1
    out = []
    for label, v, extra in rows:
        n = round(width * v / top)
        pct = f"{100 * v / total:3.0f}%" if total else ""
        out.append(f"    {label:<{label_w}}{'█' * n}{'░' * (width - n)}  {fmt(v):>5}  {pct}{('  ' + extra) if extra else ''}")
    return "\n".join(out)


def analyse(run: Path) -> dict:
    state = load_state(run)
    dispatches = {d["nn"]: d for d in state["dispatches"]}
    segs = load_usage(run)
    timeline = stage_timeline(run)

    seen_loops = set()
    for d in sorted(state["dispatches"], key=lambda d: d["nn"]):
        d["_first_in_loop"] = d["loop"] not in seen_loops
        seen_loops.add(d["loop"])

    def label(nn, role):
        d = dispatches.get(nn) or {}
        key = d.get("loop", "").split(":", 1)[1] if role == "widget-builder" and ":" in d.get("loop", "") else ""
        return f"{nn:02d} {role}" + (f" {key}" if key else "")

    # per segment
    rows = []
    for s in segs:
        h, turns = s["h"], s["turns"]
        if not turns:
            continue
        d = dispatches.get(h["dispatch"])
        first_write = turns[0]["cache_write_5m"] + turns[0]["cache_write_1h"]
        tok = {k: sum(t[k] for t in turns) for k in WEIGHTS}
        reads = defaultdict(lambda: [0, 0])
        for _, e in s["after"]:
            if e["t"] == "tool" and e.get("op") == "read" and e.get("whole") and e.get("path"):
                reads[e["path"]][0] += 1
                reads[e["path"]][1] = max(reads[e["path"]][1], e["result_bytes"])
        rows.append({
            "seg": s,
            "dispatch": h["dispatch"], "role": h["role"], "agent": h["agent"], "kind": h["kind"], "seq": h["seq"],
            "label": "orchestrator (main session)" if h["role"] == "orchestrator" else label(h["dispatch"], h["role"]),
            "stage": stage_of(s, d, (d or {}).get("_first_in_loop", True) and h["kind"] == "spawn", timeline),
            "turns": len(turns), "ts": h["ts"],
            "ctx": {"first": ctx(turns[0]), "peak": max(ctx(t) for t in turns), "last": ctx(turns[-1])},
            "cold_start": h["kind"] == "continue" and first_write > COLD_WRITE,
            "tokens": tok, "ieq": ieq(tok),
            "images": sum(1 for _, e in s["after"] if e["t"] == "image"),
            "whole_reads": [{"path": p, "count": c, "bytes": b} for p, (c, b) in sorted(reads.items())],
        })

    total = sum(r["ieq"] for r in rows)
    by_stage = defaultdict(float)
    for r in rows:
        by_stage[r["stage"]] += r["ieq"]

    # per agent (a continued agent spans several dispatches)
    agents = defaultdict(list)
    for r in rows:
        agents[r["agent"]].append(r)
    for a in agents.values():
        a.sort(key=lambda r: r["seq"])

    # causes (estimates; they overlap, e.g. a screenshot is also part of carried history)
    carried, carried_n, carried_cold, carried_ctx, carried_who = 0.0, 0, 0, [], defaultdict(float)
    img_cost, img_n, img_who = 0.0, 0, defaultdict(int)
    read_cost, read_n, read_files = 0.0, 0, defaultdict(lambda: {"count": 0, "bytes": 0, "agents": set()})
    for agent, rs in agents.items():
        base = ctx(rs[0]["seg"]["turns"][0])
        n_total = sum(r["turns"] for r in rs)
        colds, offset, arrivals = [], 0, []
        for r in rs:
            if r["cold_start"]:
                colds.append(offset)
            for i, e in r["seg"]["after"]:
                arrivals.append((offset + i, e, r))
            if r["kind"] == "continue":
                excess = max(0, r["ctx"]["first"] - base)
                c = excess * (WEIGHTS["cache_write_5m"] + 0.1 * (r["turns"] - 1) if r["cold_start"] else 0.1 * r["turns"])
                carried += c
                carried_n += 1
                carried_cold += r["cold_start"]
                carried_ctx.append(r["ctx"]["first"])
                carried_who[rs[0]["label"]] += c
            offset += r["turns"]

        def held(tokens: float, at: int) -> float:
            later = max(0, n_total - at - 1)
            rewrites = sum(1 for c in colds if c > at)
            return tokens * (WEIGHTS["cache_write_5m"] + 0.1 * later + (WEIGHTS["cache_write_5m"] - 0.1) * rewrites)

        for at, e, r in arrivals:
            if e["t"] == "image":
                img_cost += held(e["est_tokens"], at)
                img_n += 1
                img_who[rs[0]["label"]] += 1
            elif e["t"] == "tool" and e.get("op") == "read" and e.get("whole") and e.get("result_bytes", 0) >= BIG_FILE:
                read_cost += held(e["result_bytes"] / BYTES_PER_TOKEN, at)
                read_n += 1
                f = read_files[e["path"]]
                f["count"] += 1
                f["bytes"] = max(f["bytes"], e["result_bytes"])
                f["agents"].add(agent)

    causes = []
    if carried:
        who = sorted(carried_who.items(), key=lambda x: -x[1])
        causes.append({"key": "carried_history", "ieq": carried, "continuations": carried_n, "cold": carried_cold,
                       "median_ctx": statistics.median(carried_ctx), "agents": [w for w, _ in who]})
    if img_cost:
        causes.append({"key": "images", "ieq": img_cost, "count": img_n,
                       "top": sorted(img_who.items(), key=lambda x: -x[1])[:2]})
    if read_cost:
        files = sorted(read_files.items(), key=lambda x: -x[1]["count"] * x[1]["bytes"])
        causes.append({"key": "whole_reads", "ieq": read_cost, "count": read_n,
                       "files": [{"path": p, "count": f["count"], "bytes": f["bytes"], "agents": len(f["agents"])}
                                 for p, f in files[:3]]})
    causes.sort(key=lambda c: -c["ieq"])

    missing = [nn for nn, d in sorted(dispatches.items())
               if d.get("status") != "abandoned" and not any(r["dispatch"] == nn for r in rows)]
    return {"state": state, "rows": rows, "total": total, "by_stage": dict(by_stage),
            "agents": agents, "causes": causes, "missing": missing}


def per_agent(a: dict) -> list[tuple[str, float, str]]:
    """(label, cost, note) per agent, most expensive first; the orchestrator's sessions count as one."""
    out, orch = [], 0.0
    for rs in a["agents"].values():
        v = sum(r["ieq"] for r in rs)
        if rs[0]["role"] == "orchestrator":
            orch += v
            continue
        n = len(rs) - 1
        out.append((rs[0]["label"], v, f"+ {n} continuation{'s' if n > 1 else ''}" if n else ""))
    if orch:
        out.append(("orchestrator (main session)", orch, ""))
    return sorted(out, key=lambda x: -x[1])


def headline(a: dict) -> str:
    total, st = a["total"], a["by_stage"]
    fixes = sum(v for k, v in st.items() if k.startswith("Fixes"))
    build = st.get("Build", 0)
    if build and fixes > build:
        return (f"Fixing things after the first build cost more than building it: "
                f"{fmt(fixes)} for fixes against {fmt(build)} for the first build.")
    agents = per_agent(a)
    if agents and agents[0][1] >= 0.3 * total:
        return f"One agent took {100 * agents[0][1] / total:.0f}% of it: {agents[0][0]}."
    top = max(st.items(), key=lambda x: x[1])
    return f"The biggest share went to {top[0].lower()} ({100 * top[1] / total:.0f}%)."


def cause_text(c: dict, total: float) -> str:
    share = f"≈{fmt(c['ieq'])} ({100 * c['ieq'] / total:.0f}%)"
    if c["key"] == "carried_history":
        who = " and ".join(c["agents"][:2])
        s = (f"**Agents continued for more rounds, carrying their earlier work: {share}**\n"
             f"{plural(c['continuations'], 'continuation')}, mostly {who}, started with a median of "
             f"{fmt(c['median_ctx'])} of context already loaded, and every turn re-read it.")
        if c["cold"]:
            s += (f" {c['cold']} of them started after the cache had expired, so that context was "
                  f"written again from scratch first.")
        return s
    if c["key"] == "images":
        top = ", ".join(f"{w} took in {n}" for w, n in c["top"])
        return (f"**Screenshots: {share}**\n{c['count']} images went into agent contexts ({top}). "
                f"Each one stays in context and is re-read on every later turn.")
    files = "; ".join(f"{f['path']} ({f['bytes'] // 1024} KB) {f['count']}× by {plural(f['agents'], 'agent')}"
                      for f in c["files"][:2])
    return (f"**Reading big files whole: {share}**\n{c['count']} whole reads of files over "
            f"{BIG_FILE // 1000} KB. Most read: {files}.")


def render_md(a: dict, notes: list[str]) -> str:
    state, total = a["state"], a["total"]
    title = f"# Cost: {state['slug']}\n"
    if not a["rows"]:
        return title + "\nNo usage recorded yet. " + " ".join(notes) + "\n"
    progress = "" if state["stage"] == "done" else f" (run in progress, stage: {state['stage']})"
    md = [title, f"**This run cost {fmt(total)} tokens{progress}.** {headline(a)}\n"]

    md.append("## Where it went\n")
    stages = sorted(a["by_stage"].items(), key=lambda x: -x[1])
    md.append(bars([(k, v, "") for k, v in stages], total) + "\n")

    if a["causes"]:
        md.append(f"## The {'three ' if len(a['causes']) == 3 else ''}biggest costs\n")
        for i, c in enumerate(a["causes"][:3], 1):
            md.append(f"{i}. {cause_text(c, total)}\n")

    md.append("## Most expensive agents\n")
    per = per_agent(a)
    chart = bars(per[:8], total, width=24, label_w=36)
    if len(per) > 8:
        rest = sum(v for _, v, _ in per[8:])
        chart += f"\n    {f'+ {len(per) - 8} more':<36}{'':24}  {fmt(rest):>5}  {100 * rest / total:3.0f}%"
    md.append(chart + "\n")

    if a["missing"] or notes:
        md.append("**Gaps:** " + " ".join(
            ([f"No usage found for dispatch {', '.join(f'{n:02d}' for n in a['missing'])}; "
              f"their transcripts may be gone, or they ran outside Claude Code."] if a["missing"] else [])
            + notes) + "\n")

    md.append("---\n")
    md.append(f"<details>\n<summary>Every dispatch and round ({len(a['rows'])} rows)</summary>\n")
    md.append("| who | round | stage | turns | context first → peak | started cold | cost | images |")
    md.append("|---|---|---|---:|---|:-:|---:|---:|")
    for r in sorted(a["rows"], key=lambda r: r["ts"] or ""):
        md.append(f"| {r['label']} | {r['kind']} | {r['stage']} | {r['turns']} | "
                  f"{fmt(r['ctx']['first'])} → {fmt(r['ctx']['peak'])} | {'yes' if r['cold_start'] else ''} | "
                  f"{fmt(r['ieq'])} | {r['images'] or ''} |")
    md.append("\n</details>\n")
    md.append("<details>\n<summary>How cost is counted</summary>\n")
    md.append(
        "Cost is in input-equivalent tokens: each kind of token is weighted by its price relative to "
        "normal input, so cache reads count 0.1, cache writes 1.25 (2 for 1-hour writes) and output 5. "
        "That keeps runs comparable when prices or models change. Raw counts are in `cost.json`, and "
        "per-turn data is in `usage/`.\n\n"
        "The biggest costs are estimates (≈) and overlap, so they don't add up to the total:\n\n"
        "- **Carried earlier work:** for each continuation, the context it started with beyond what the "
        "agent started with when first spawned, times the turns it was re-read, plus the re-write when the "
        "cache had expired. It doesn't count the turns a fresh agent would spend getting its bearings.\n"
        "- **Screenshots:** each image's estimated tokens (pixels / 750 after the API's downscaling), "
        "written once and re-read on every later turn of the same agent.\n"
        f"- **Big files read whole:** files of {BIG_FILE // 1000} KB or more read with no line range, "
        f"at about {BYTES_PER_TOKEN} bytes per token, held the same way.\n\n"
        "Orchestrator turns are those between its first and last command touching this run, so a session "
        "that did other work in between is counted in full.\n")
    md.append("</details>\n")
    return "\n".join(md)


def render_json(a: dict, notes: list[str]) -> dict:
    return {
        "v": 1, "generated": now(), "slug": a["state"]["slug"], "stage": a["state"]["stage"],
        "weights": WEIGHTS, "total_ieq": round(a["total"]),
        "by_stage": {k: round(v) for k, v in a["by_stage"].items()},
        "causes": [{**{k: v for k, v in c.items()}, "ieq": round(c["ieq"])} for c in a["causes"]],
        "segments": [{k: (round(v) if k == "ieq" else v) for k, v in r.items() if k != "seg"}
                     for r in sorted(a["rows"], key=lambda r: r["ts"] or "")],
        "missing_dispatches": a["missing"], "notes": notes,
    }


def run_report(out: Path, run: Path, origin: Path | None = None, transcripts: str | None = None) -> str:
    """Refresh usage and write the report. Returns the headline line. Raises TranscriptFormatError."""
    notes = refresh_usage(out, run, origin or out, transcripts)
    a = analyse(run)
    write_atomic(run / "cost.md", render_md(a, notes))
    write_atomic(run / "cost.json", json.dumps(render_json(a, notes), indent=2, default=list) + "\n")
    if not a["rows"]:
        return "no usage recorded yet"
    return f"{fmt(a['total'])} tokens (input-equivalent). {headline(a)}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("run")
    ap.add_argument("--origin", help="the run's <out> path when it ran, if it has moved since")
    ap.add_argument("--transcripts", help="a Claude Code projects/<dir> to search")
    a = ap.parse_args()
    out, run = resolve_run(a.run)
    try:
        line = run_report(out, run, Path(a.origin).resolve() if a.origin else None, a.transcripts)
    except TranscriptFormatError as e:
        print(f"unrecognized transcript format, report not written: {e}", file=sys.stderr)
        sys.exit(3)
    print(line)
    print(f"report: {run / 'cost.md'}")


if __name__ == "__main__":
    main()
