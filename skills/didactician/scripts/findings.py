#!/usr/bin/env python3
"""Stable finding IDs across review rounds.

    findings.py <out|run> ingest <round>    assign IDs to `### new` findings, apply closure statuses,
                                            write run/review/round-<N>/findings.md
    findings.py <out|run> status            open findings by severity; exit 1 if any blocking is open

Reviewers write `### new` for a new finding and `### <ID>` + `status:` when verifying an earlier
one. Prefix: A- for accuracy, P- for pedagogy/UX (a merged reviewer's findings with `verdict:` are A-).
In rounds ≥ 2, new findings below `blocking` are recorded as late nits and not routed.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import log_append, now, resolve_run, section, strip_comments, write_atomic  # noqa: E402

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
    return json.loads(p.read_text()) if p.exists() else {"next": {"A": 1, "P": 1}, "findings": {}}


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
    for fid in sorted(reg["findings"], key=lambda x: (x[0], int(x.split('-')[1]))):
        r = reg["findings"][fid]
        lines.append(f"### {fid} · {r['severity']} · {r['status']}")
        for k in ["criterion", "location", "verdict", "evidence", "expected_fix", "closure_evidence"]:
            if r.get(k):
                lines.append(f"{k}: {r[k]}")
        lines.append("")
    write_atomic(rdir / "findings.md", "\n".join(lines))
    opened = {s: sum(1 for r in reg["findings"].values() if r["status"] == "open" and r["severity"] == s)
              for s in ("blocking", "should", "nit")}
    log_append(run, "orchestrator", "findings",
               f"Round {rnd} ingested: {len(touched)} finding(s) touched; open: {opened['blocking']} blocking, "
               f"{opened['should']} should, {opened['nit']} nit" + (f"; late nits (not routed): {', '.join(late)}" if late else "") + ".",
               links=[str((rdir / 'findings.md').relative_to(run))])
    print(f"wrote {rdir / 'findings.md'}")
    print(f"open: {opened}")


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
    elif sys.argv[2] == "status":
        cmd_status(run)
    else:
        print(__doc__)
        sys.exit(2)


if __name__ == "__main__":
    main()
