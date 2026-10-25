#!/usr/bin/env python3
"""Stable finding IDs across review rounds.

    findings.py <out|run> ingest <round>    assign IDs to `### new` findings, apply closure statuses,
                                            write run/review/round-<N>/findings.md
    findings.py <out|run> ingest-human <target-N> --decision d-NN
                                            turn a human review round (e.g. site-1) into H- findings
    findings.py <out|run> close <H-NN>… --decision d-NN
                                            close human findings on the user's word
    findings.py <out|run> status            open findings by severity; exit 1 if any blocking is open

Reviewers write `### new` for a new finding and `### <ID>` + `status:` when verifying an earlier
one. Prefix: A- for accuracy, P- for pedagogy/UX (a merged reviewer's findings with `verdict:` are A-).
In rounds ≥ 2, new findings below `blocking` are recorded as late nits and not routed.

H- findings are the user's own comments from human_review.mjs. "Send feedback" in the browser only
ends the session: a round is ingested only on a recorded decision (`applies_to: human-review site-1`,
`decision: approved`) that the user has finished with it. Every open comment is `blocking`, and only
the user closes one; reviewers can't, and their `### H-NN` blocks are ignored.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import blocks, die, log_append, now, resolve_run, section, strip_comments, write_atomic  # noqa: E402

FIELDS = ["severity", "criterion", "location", "evidence", "expected_fix", "verdict", "status"]


def parse_findings(text: str):
    body = section(text, "Findings") or strip_comments(text)
    heads = list(re.finditer(r"^###\s+(new|[AP]-\d+)\s*$", body, flags=re.M | re.I))
    out = []
    for i, m in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(body)
        chunk = body[m.end():end]
        f, cur = {}, None
        for line in chunk.splitlines():
            mm = re.match(r"^([a-z_]+):\s*(.*)$", line)
            if mm and mm.group(1) in FIELDS:
                cur = mm.group(1)
                f[cur] = mm.group(2).strip()
            elif cur and line.strip() and not line.startswith("#"):
                f[cur] += " " + line.strip()
        out.append((m.group(1), f))
    return out


def load_registry(run: Path):
    p = run / "review" / "registry.json"
    reg = json.loads(p.read_text()) if p.exists() else {"next": {"A": 1, "P": 1}, "findings": {}}
    reg["next"].setdefault("H", 1)
    return reg


def user_decision(run: Path, did: str, applies_to: str | None = None) -> dict:
    """The fields of decision `did` in decisions.md; dies unless it exists (and applies to `applies_to`)."""
    p = run / "decisions.md"
    found = {i: f for i, _, f in blocks(p.read_text(), r"d-\d+")} if p.exists() else {}
    f = found.get(did)
    if f is None:
        die(f"{did} not found in decisions.md. Ask the user, record their answer verbatim, then re-run.")
    if applies_to and (f.get("applies_to", "").strip() != applies_to or f.get("decision", "").strip() != "approved"):
        die(f"{did} must have `applies_to: {applies_to}` and `decision: approved` (the user said they are "
            f"finished with this round); it has applies_to: {f.get('applies_to')!r}, decision: {f.get('decision')!r}")
    return f


def cmd_ingest(run: Path, rnd: int):
    rdir = run / "review" / f"round-{rnd}"
    files = sorted(rdir.glob("*.md"))
    files = [f for f in files if f.name != "findings.md"]
    if not files:
        print(f"no review files in {rdir}", file=sys.stderr)
        sys.exit(1)
    reg = load_registry(run)
    touched, late = [], []
    for fp in files:
        default_prefix = "A" if fp.name.startswith("accuracy") else "P"
        for fid, f in parse_findings(fp.read_text()):
            sev = f.get("severity", "should").split()[0].lower()
            if fid.lower() == "new":
                prefix = "A" if (default_prefix == "A" or f.get("verdict")) else "P"
                fid = f"{prefix}-{reg['next'][prefix]:02d}"
                reg["next"][prefix] += 1
                status = "open"
                if rnd >= 2 and sev != "blocking":
                    sev, status = "nit", "late-nit"
                    late.append(fid)
                reg["findings"][fid] = {**f, "severity": sev, "status": status, "round_opened": rnd,
                                        "source": fp.name, "history": [[rnd, status]]}
            else:
                fid = fid.upper()
                if fid not in reg["findings"]:
                    print(f"warning: {fp.name} refers to unknown finding {fid}; ignored", file=sys.stderr)
                    continue
                st = (f.get("status") or "still-open").split()[0].lower()
                st = {"still-open": "open", "closed": "closed", "dispute-upheld": "dispute-upheld"}.get(st, "open")
                rec = reg["findings"][fid]
                rec["status"] = st
                rec["history"].append([rnd, st])
                if f.get("evidence"):
                    rec["closure_evidence"] = f["evidence"]
            touched.append(fid)
    write_atomic(run / "review" / "registry.json", json.dumps(reg, indent=2) + "\n")

    lines = [f"# Findings: round {rnd}", "", f"_Ingested {now()} from {', '.join(f.name for f in files)}._", ""]
    lines += finding_lines(reg)
    write_atomic(rdir / "findings.md", "\n".join(lines))
    opened = {s: sum(1 for r in reg["findings"].values() if r["status"] == "open" and r["severity"] == s)
              for s in ("blocking", "should", "nit")}
    log_append(run, "orchestrator", "findings",
               f"Round {rnd} ingested: {len(touched)} finding(s) touched; open: {opened['blocking']} blocking, "
               f"{opened['should']} should, {opened['nit']} nit" + (f"; late nits (not routed): {', '.join(late)}" if late else "") + ".",
               links=[str((rdir / 'findings.md').relative_to(run))])
    print(f"wrote {rdir / 'findings.md'}")
    print(f"open: {opened}")


def finding_lines(reg: dict) -> list[str]:
    lines = []
    for fid in sorted(reg["findings"], key=lambda x: (x[0], int(x.split('-')[1]))):
        r = reg["findings"][fid]
        lines.append(f"### {fid} · {r['severity']} · {r['status']}")
        for k in ["criterion", "location", "verdict", "evidence", "expected_fix", "closure_evidence"]:
            if r.get(k):
                lines.append(f"{k}: {r[k]}")
        lines.append("")
    return lines


def human_location(c: dict, extra: dict, rdir: str) -> str:
    one = lambda s: " ".join(str(s or "").split())
    if c.get("anchor"):
        return f'text "{one(c["anchor"].get("exact"))}"'
    g = c.get("geom") or {}
    on = extra.get("targets", {}).get(c["id"])
    where = f'on "{one(on)}"' if on else "on an element not found in build/"
    shot = extra.get("shots", {}).get(c["id"])
    return f"{c.get('type')} {where} (selector `{g.get('selector')}`" + (f"; shot {rdir}/{shot}" if shot else "") + ")"


def cmd_ingest_human(run: Path, name: str, did: str):
    hdir = run / "review" / f"human-{name}"
    if not name.startswith("site-"):
        die("only site rounds become findings; a plan round's comments are revise notes at the checkpoint")
    if not (hdir / "comments.json").exists():
        die(f"no {hdir.relative_to(run)}/comments.json")
    user_decision(run, did, f"human-review {name}")
    exp = json.loads((hdir / "comments.json").read_text())
    extra = exp.get("didactician", {})
    reg = load_registry(run)
    by_comment = {r.get("comment_id"): k for k, r in reg["findings"].items() if r.get("comment_id")}
    new, updated, closed = [], [], []
    for n, c in enumerate(exp.get("comments", []), 1):
        text = (c.get("text") or "").strip() or "(no text; ask the user what this mark means)"
        for r in c.get("replies") or []:
            text += f" — reply: {(r.get('text') or '').strip()}"
        fields = {"criterion": f"human review ({name}, comment #{n})", "location": human_location(c, extra, str(hdir.relative_to(run))),
                  "evidence": f'The user wrote: "{" ".join(text.split())}"',
                  "expected_fix": "What the user asks for in their comment. If the intent is unclear, ask the user; don't guess."}
        fid = by_comment.get(c["id"])
        status = "closed" if c.get("resolved") else "open"
        if fid:
            rec = reg["findings"][fid]
            rec.update(fields)
            if status == "closed" and rec["status"] != "closed":
                rec["status"] = "closed"
                rec["history"].append([name, "closed (resolved by the user in review)"])
                closed.append(fid)
            else:
                updated.append(fid)
        elif status == "open":
            fid = f"H-{reg['next']['H']:02d}"
            reg["next"]["H"] += 1
            reg["findings"][fid] = {**fields, "severity": "blocking", "status": "open", "round_opened": name,
                                    "source": f"human-{name}", "comment_id": c["id"], "decision": did,
                                    "history": [[name, "open"]]}
            new.append(fid)
    write_atomic(run / "review" / "registry.json", json.dumps(reg, indent=2) + "\n")
    lines = [f"# Findings: human review {name}", "",
             f"_Ingested {now()} from comments.json on {did}. H- findings are closed only by the user._", ""]
    write_atomic(hdir / "findings.md", "\n".join(lines + finding_lines(reg)))
    log_append(run, "orchestrator", "findings",
               f"Human review {name} ingested on {did}: {len(new)} new H- finding(s)"
               + (f" ({new[0]}–{new[-1]})" if new else "") + f", {len(updated)} updated, {len(closed)} closed by the user.",
               links=[str((hdir / 'findings.md').relative_to(run))])
    print(f"wrote {hdir / 'findings.md'}")
    print(f"new: {', '.join(new) or 'none'}")


def cmd_close(run: Path, ids: list[str], did: str):
    user_decision(run, did)
    reg = load_registry(run)
    for fid in (i.upper() for i in ids):
        if not fid.startswith("H-") or fid not in reg["findings"]:
            die(f"{fid}: not a human finding (A- and P- findings are closed by the closure reviewers)")
        rec = reg["findings"][fid]
        rec["status"] = "closed"
        rec["history"].append([did, "closed by the user"])
    write_atomic(run / "review" / "registry.json", json.dumps(reg, indent=2) + "\n")
    log_append(run, "orchestrator", "findings", f"Closed on the user's word ({did}): {', '.join(ids)}.",
               links=["decisions.md"])
    print(f"closed: {', '.join(ids)}")


def cmd_status(run: Path):
    reg = load_registry(run)
    open_ = [(k, r) for k, r in reg["findings"].items() if r["status"] == "open"]
    for sev in ("blocking", "should", "nit"):
        ids = [k for k, r in open_ if r["severity"] == sev]
        print(f"{sev}: {', '.join(ids) or 'none'}")
    disputes = [k for k, r in reg["findings"].items() if r["status"] == "dispute-upheld"]
    if disputes:
        print(f"dispute-upheld (builder was right): {', '.join(disputes)}")
    sys.exit(1 if any(r["severity"] == "blocking" for _, r in open_) else 0)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    _, run = resolve_run(sys.argv[1])
    if sys.argv[2] == "ingest":
        cmd_ingest(run, int(sys.argv[3]))
    elif sys.argv[2] == "ingest-human" and len(sys.argv) == 6 and sys.argv[4] == "--decision":
        cmd_ingest_human(run, sys.argv[3], sys.argv[5])
    elif sys.argv[2] == "close" and "--decision" in sys.argv:
        i = sys.argv.index("--decision")
        cmd_close(run, sys.argv[3:i], sys.argv[i + 1])
    elif sys.argv[2] == "status":
        cmd_status(run)
    else:
        print(__doc__)
        sys.exit(2)


if __name__ == "__main__":
    main()
