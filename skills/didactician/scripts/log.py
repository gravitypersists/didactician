#!/usr/bin/env python3
"""Append a human-readable entry to run/log.md.

    log.py <out|run> --actor orchestrator --event <event> --summary "…" [--link <path>]… [--decision "…"]

Events used by the orchestrator: intake, user-question, user-decision, stage, route, blocker,
escalation, delta, deliver, note. (dispatch/receive/gate entries are written by the scripts.)
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import log_append, resolve_run  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("run")
    ap.add_argument("--actor", default="orchestrator")
    ap.add_argument("--event", required=True)
    ap.add_argument("--summary", required=True)
    ap.add_argument("--link", action="append", default=[])
    ap.add_argument("--decision")
    a = ap.parse_args()
    _, run = resolve_run(a.run)
    log_append(run, a.actor, a.event, a.summary, a.link, a.decision)


if __name__ == "__main__":
    main()
