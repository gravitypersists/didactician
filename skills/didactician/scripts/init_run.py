#!/usr/bin/env python3
"""Create (or report on) a Didactician run directory.

    init_run.py <out> --slug <slug> --depth <none|light|standard|deep> --minutes <N>

On an existing run it changes nothing and prints the current stage and any open dispatches,
so the orchestrator can resume.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import SKILL_DIR, log_append, now, save_state  # noqa: E402

DEPTHS = ["none", "light", "standard", "deep"]
LOOP_CAPS = {"research": 2, "checkpoint": 4, "gate": 6, "review": 2}


def caps_for(minutes: float, depth: str) -> dict:
    if minutes <= 5:
        spawns, agent_minutes = 12, 45
    elif minutes <= 15:
        spawns, agent_minutes = 18, 75
    elif minutes <= 30:
        spawns, agent_minutes = 24, 105
    else:
        spawns, agent_minutes = 30, 150
    spawns += {"none": 0, "light": 0, "standard": 1, "deep": 4}[depth]
    return {"spawns": spawns, "agent_minutes": agent_minutes, "loops": dict(LOOP_CAPS)}


def report_human_reviews(run: Path):
    """Where each human review round stands: still open, finished but unconfirmed, or ingested."""
    review = run / "review"
    reg = json.loads((review / "registry.json").read_text()) if (review / "registry.json").exists() else {}
    ingested = {r.get("comment_id") for r in reg.get("findings", {}).values()}
    for d in sorted(review.glob("human-*-*"), key=lambda p: (p.name.rsplit("-", 1)[0], int(p.name.rsplit("-", 1)[1]))):
        meta = json.loads((d / "meta.json").read_text()) if (d / "meta.json").exists() else {}
        comments = (json.loads((d / "comments.json").read_text()) if (d / "comments.json").exists() else {}).get("comments", [])
        name = d.name.removeprefix("human-")
        if not meta.get("ended"):
            state = "never finished (the session was interrupted); reopen it"
        elif name.startswith("plan-"):
            state = f"{meta.get('how')}; its comments are revise notes for the checkpoint question"
        elif comments and all(c["id"] in ingested for c in comments if not c.get("resolved")):
            state = "ingested as H- findings"
        else:
            state = (f"{meta.get('how')}, NOT ingested. Ask the user whether they are finished with it "
                     f"(the browser's Send button is easy to hit early); ingest only on a recorded yes")
        print(f"  human review {name}: {len(comments)} comment(s), {state}")


def report_existing(out: Path, run: Path):
    state = json.loads((run / "state.json").read_text())
    open_d = [d for d in state["dispatches"] if not d.get("closed")]
    print(f"RESUME: run exists at {run}")
    print(f"stage: {state['stage']}")
    print(f"dispatches: {len(state['dispatches'])} (cap {state['caps']['spawns']})")
    for d in open_d:
        print(f"  open: {d['nn']:02d} {d['role']} loop={d['loop']} label={d['label']} (never received)")
    report_human_reviews(run)
    if open_d:
        print("Open dispatches can't be continued from a new session: respawn fresh with the last report,")
        print("open findings and current artifacts, then `round_gate.py receive` the old NN with --abandon.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--slug", required=True)
    ap.add_argument("--depth", choices=DEPTHS, required=True)
    ap.add_argument("--minutes", type=float, required=True)
    a = ap.parse_args()

    out = Path(a.out).resolve()
    run = out / "run"
    if (run / "state.json").exists():
        report_existing(out, run)
        return

    for d in ["site", "run/research", "run/plan", "run/review", "run/handoffs", "run/history",
              "run/gate", "run/screenshots"]:
        (out / d).mkdir(parents=True, exist_ok=True)

    brief = run / "brief.md"
    if not brief.exists():
        shutil.copy(SKILL_DIR / "templates" / "brief.md", brief)
    decisions = run / "decisions.md"
    if not decisions.exists():
        decisions.write_text("# Decisions\n\n<!-- Orchestrator only. Format: templates/decisions.md -->\n")
    (run / "log.md").write_text(
        f"# Run log: {a.slug}\n\n"
        "Human-readable timeline. Each entry links the files it refers to. Every dispatch has a\n"
        "prompt and report in `handoffs/` and a pre-dispatch snapshot in `history/`.\n"
    )

    state = {
        "version": 1,
        "slug": a.slug,
        "created": now(),
        "depth": a.depth,
        "minutes": a.minutes,
        "stage": "intake",
        "caps": caps_for(a.minutes, a.depth),
        "seq": 0,
        "dispatches": [],
        "loops": {},
        "gate_history": {},
        "noprogress": {},
    }
    save_state(run, state)
    c = state["caps"]
    log_append(
        run, "orchestrator", "init",
        f"Run initialised: depth `{a.depth}`, budget {a.minutes:g} min. "
        f"Caps: {c['spawns']} dispatches, {c['agent_minutes']} agent-minutes; loops {c['loops']}.",
        links=["brief.md", "decisions.md"],
    )
    print(f"initialised {out}")
    print(f"write the brief: {brief}")
    print(f"caps: {json.dumps(c)}")


if __name__ == "__main__":
    main()
