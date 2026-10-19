#!/usr/bin/env python3
"""Check run/plan/* : references, required parts; warn on scope and drift.

    check_plan.py <out|run>

Errors (exit 1) go back to the designer. Warnings never block; the orchestrator carries them into
the checkpoint summary so the human can judge them.

There is deliberately no word or time estimate: scope is sized in ideas (objectives, segments), and
the built page's reading time is measured by verify.mjs and reported, never gated.
"""

from __future__ import annotations

import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import blocks, ids_in, read_brief, resolve_run, section, write_atomic  # noqa: E402

MOCKUP_PLACEHOLDERS = ["OBJECTIVE TEXT", "SEGMENT HEADING", "WHY THIS FORM", "THE ACTUAL PROMPT", "CUT FIRST"]


def main():
    out, run = resolve_run(sys.argv[1] if len(sys.argv) > 1 else ".")
    brief = read_brief(run)
    pdir = run / "plan"
    errors, warnings = [], []

    plan_p = pdir / "learning-plan.md"
    for p in (plan_p, pdir / "cut-list.md", pdir / "mockup.html"):
        if not p.exists():
            errors.append(f"missing {p.relative_to(run)}")
    if not plan_p.exists():
        print("\n".join(f"ERROR {e}" for e in errors) + "\nRESULT: FAIL")
        sys.exit(1)
    plan = plan_p.read_text()

    facts_p = run / "research" / "facts.md"
    if not facts_p.exists():
        facts_p = pdir / "facts.md"  # depth none: the designer records model-sourced claims here
    claim_ids = {c for c, _, _ in blocks(facts_p.read_text(), r"c-\d+")} if facts_p.exists() else set()
    if not facts_p.exists():
        errors.append("no facts file: run/research/facts.md (or run/plan/facts.md at depth none)")

    objectives = {o: t for o, t in brief["objectives"]}
    segs = blocks(plan, r"s-\d+")
    widgets = {w: f for w, _, f in blocks(section(plan, "Widgets"), r"w-[a-z0-9-]+")}
    items = {k: f for k, _, f in blocks(section(plan, "Comprehension items"), r"k-\d+")}
    acs = re.findall(r"^-\s*(ac-\d+)\b", section(plan, "Acceptance criteria"), flags=re.M)

    if not segs:
        errors.append("no segments (`### s-NN — Title`) under ## Segments")
    if not section(plan, "Shape").strip():
        errors.append("## Shape is empty: state the chosen form and why")
    if not acs:
        errors.append("## Acceptance criteria has no `- ac-NN (…)` items; builders and reviewers need them")

    covered = set()
    for sid, title, f in segs:
        objs = ids_in(f.get("objectives", ""), "o")
        covered.update(objs)
        if not objs:
            warnings.append(f"{sid} ({title}): maps to no objective; is it connective, or drift?")
        for o in objs:
            if o not in objectives:
                errors.append(f"{sid}: objective {o} is not in the brief")
        for c in ids_in(f.get("claims", ""), "c"):
            if claim_ids and c not in claim_ids:
                errors.append(f"{sid}: claim {c} not found in {facts_p.relative_to(run)}")
        for w_id in ids_in(f.get("widget", ""), "w"):
            if w_id not in widgets:
                errors.append(f"{sid}: widget {w_id} has no `### {w_id}` entry under ## Widgets")
        for k in ids_in(f.get("checks", ""), "k"):
            if k not in items:
                errors.append(f"{sid}: check {k} has no `### {k}` entry under ## Comprehension items")
    for w_id, f in widgets.items():
        if f.get("complexity") not in ("high", "low"):
            errors.append(f"{w_id}: `complexity:` must be high or low")
        for key in ("model", "reader_does", "shows", "size"):
            if not f.get(key):
                warnings.append(f"{w_id}: no `{key}:`; builders will have to guess")

    # objectives ↔ checks (judgment call: warn only)
    osec = section(plan, "Objectives")
    for o in objectives:
        line = re.search(rf"^-\s*{o}\b.*$", osec, flags=re.M)
        if o not in covered:
            warnings.append(f"{o}: no segment serves it")
        if not line:
            warnings.append(f"{o}: not listed under the plan's ## Objectives")
        elif re.search(r"checks:\s*none\s*$", line.group(0)):
            warnings.append(f"{o}: `checks: none` with no reason given")
        elif "checks:" not in line.group(0):
            warnings.append(f"{o}: no `checks:` mapping (give items, or `none — reason`)")

    budget = brief["minutes"]
    if budget:
        n_obj = len(objectives)
        suggested = max(1, math.ceil(budget / 3))
        if n_obj > suggested:
            warnings.append(f"{n_obj} objectives for a {budget:g}-min piece (guide: ≤ {suggested}); broad scope invites bloat")
    else:
        errors.append("brief has no numeric `time_budget_minutes:`")

    cuts_p = pdir / "cut-list.md"
    if cuts_p.exists() and not section(cuts_p.read_text(), "If it runs long").strip():
        warnings.append("cut-list.md has no `## If it runs long` section; the user has no ranked cuts if the page runs long")

    mock = (pdir / "mockup.html").read_text() if (pdir / "mockup.html").exists() else ""
    left = [p for p in MOCKUP_PLACEHOLDERS if p in mock]
    if left:
        errors.append(f"mockup.html still has template placeholders: {', '.join(left)}")
    if mock and 'id="assets"' not in mock:
        errors.append("mockup.html has no #assets panel (say 'no third-party assets' if none)")

    used = {c for _, _, f in segs for c in ids_in(f.get("claims", ""), "c")}
    unused = sorted(claim_ids - used)

    lines = ["segments:"]
    lines += [f"  {sid:<6} {t}" for sid, t, _ in segs]
    lines.append(f"objectives: {len(objectives)} · segments: {len(segs)} · reader's time: {budget:g} min" if budget
                 else f"objectives: {len(objectives)} · segments: {len(segs)}")
    wlist = ", ".join(f"{w} ({f.get('complexity')})" for w, f in widgets.items()) or "none"
    lines.append(f"widgets: {wlist}")
    lines.append(f"checks: {len(items)} · acceptance criteria: {len(acs)}")
    if unused:
        lines.append(f"info  claims not used by any segment: {', '.join(unused)} (should appear in cut-list.md)")
    lines += [f"ERROR {e}" for e in errors] + [f"warn  {w}" for w in warnings]
    lines.append("RESULT: " + ("FAIL" if errors else "PASS"))
    text = "\n".join(lines)
    write_atomic(run / "gate" / "check_plan.txt", text + "\n")
    print(text)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
