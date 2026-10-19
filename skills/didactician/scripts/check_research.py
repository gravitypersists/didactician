#!/usr/bin/env python3
"""Check run/research/* against the depth caps and the formats in templates/research-formats.md.

    check_research.py <out|run>

Exit 0 = pass (warnings may print), 1 = errors (send back to the researcher once).
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import blocks, load_state, read_brief, resolve_run, section, write_atomic  # noqa: E402

CAPS = {
    "none": None,
    "light": {"claims": 12, "sources": 8, "examples": 5, "misconceptions": 4},
    "standard": {"claims": 25, "sources": 15, "examples": 8, "misconceptions": 6},
    "deep": {"claims": 40, "sources": 25, "examples": 12, "misconceptions": 8},
}
CLAIM_MAX_WORDS = 40


def main():
    out, run = resolve_run(sys.argv[1] if len(sys.argv) > 1 else ".")
    state = load_state(run)
    brief = read_brief(run)
    depth = brief.get("research_depth", state["depth"]).split()[0] if brief.get("research_depth") else state["depth"]
    caps = CAPS.get(depth)
    rdir = run / "research"
    errors, warnings = [], []

    if caps is None:
        print("research_depth is none: nothing to check")
        return

    facts_p = rdir / "facts.md"
    if not facts_p.exists():
        print(f"ERROR missing {facts_p}")
        sys.exit(1)
    facts = facts_p.read_text()
    objectives = {o for o, _ in brief["objectives"]}

    claims = blocks(facts, r"c-\d+")
    sources = set()
    for cid, _, f in claims:
        for key in ("objective", "claim", "source", "confidence"):
            if not f.get(key):
                errors.append(f"{cid}: missing `{key}:`")
        if f.get("objective") and f["objective"] not in objectives:
            errors.append(f"{cid}: objective {f['objective']} is not in the brief ({', '.join(sorted(objectives))})")
        words = len(f.get("claim", "").split())
        if words > CLAIM_MAX_WORDS:
            errors.append(f"{cid}: claim is {words} words (max {CLAIM_MAX_WORDS}); split it into single assertions")
        src = f.get("source", "").strip()
        if src == "model":
            if f.get("confidence") != "low":
                errors.append(f"{cid}: `source: model` at depth {depth} must be `confidence: low` with a note")
        elif src:
            sources.add(re.sub(r"[#?].*$", "", src))
        if f.get("confidence") and f["confidence"] not in ("high", "medium", "low"):
            errors.append(f"{cid}: confidence must be high | medium | low")
        if src and src != "model" and not f.get("quote"):
            warnings.append(f"{cid}: no `quote:` from the source")

    # questions coverage
    qsec = section(facts, "Questions")
    answered = dict(re.findall(r"^-\s*(q-\d+):\s*(answered|unresolved)\b", qsec, flags=re.M))
    for qid, _, _ in brief["questions"]:
        if qid not in answered:
            errors.append(f"{qid}: not listed under `## Questions` as answered or unresolved")
    for qid, st in answered.items():
        if st == "answered":
            line = re.search(rf"^-\s*{qid}:.*$", qsec, flags=re.M).group(0)
            refs = re.findall(r"c-\d+", line)
            known = {c for c, _, _ in claims}
            if not refs:
                errors.append(f"{qid}: marked answered but cites no claims")
            for r in refs:
                if r not in known:
                    errors.append(f"{qid}: cites {r}, which doesn't exist")
    unresolved = [q for q, s in answered.items() if s == "unresolved"]

    # optional files
    def count(name, pat, required):
        p = rdir / name
        if not p.exists():
            return []
        bs = blocks(p.read_text(), pat)
        for bid, _, f in bs:
            for key in required:
                if not f.get(key):
                    errors.append(f"{name} {bid}: missing `{key}:`")
            if f.get("objective") and f["objective"] not in objectives:
                errors.append(f"{name} {bid}: objective {f['objective']} is not in the brief")
        return bs

    mis = count("misconceptions.md", r"m-\d+", ["objective", "misconception", "why_tempting", "counter"])
    exs = count("examples.md", r"x-\d+", ["objective", "example", "why"])
    assets = count("assets.md", r"a-\d+", ["url", "kind", "license", "attribution", "clearance"])
    for aid, _, f in assets:
        if f.get("clearance") not in ("license", "needs-user"):
            errors.append(f"assets.md {aid}: clearance must be `license` or `needs-user`")
    for name in ("misconceptions.md", "examples.md", "parking-lot.md"):
        if not (rdir / name).exists():
            warnings.append(f"no {name} (fine if there was nothing to record)")

    # caps
    counts = {"claims": len(claims), "sources": len(sources), "examples": len(exs), "misconceptions": len(mis)}
    for k, v in counts.items():
        if v > caps[k]:
            errors.append(f"{k}: {v} exceeds the `{depth}` cap of {caps[k]}. Converge: keep what the objectives "
                          f"need, move the rest to parking-lot.md")

    lines = [f"depth: {depth}", "counts: " + ", ".join(f"{k} {v}/{caps[k]}" for k, v in counts.items()),
             f"assets: {len(assets)} ({sum(1 for _, _, f in assets if f.get('clearance') == 'needs-user')} need the user)",
             f"unresolved questions: {', '.join(unresolved) or 'none'}"]
    lines += [f"ERROR {e}" for e in errors] + [f"warn  {w}" for w in warnings]
    lines.append("RESULT: " + ("FAIL" if errors else "PASS"))
    text = "\n".join(lines)
    write_atomic(run / "gate" / "check_research.txt", text + "\n")
    print(text)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
