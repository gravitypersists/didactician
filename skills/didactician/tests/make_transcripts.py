#!/usr/bin/env python3
"""Write Claude Code-shaped transcripts for a test run, for tests/run.sh.

    make_transcripts.py <out> <claude-config-dir> [--break]

Creates <claude-config-dir>/projects/<slug of out>/ with one orchestrator session and one subagent
that is spawned for dispatch 01 and continued for dispatch 02 after its cache expired. The subagent
reads a big file whole and takes one screenshot. --break drops `usage` from assistant turns, as a
Claude Code format change would.
"""

import base64
import datetime as dt
import json
import re
import struct
import sys
from pathlib import Path

out, cfg = Path(sys.argv[1]).resolve(), Path(sys.argv[2])
broken = "--break" in sys.argv
proj = cfg / "projects" / re.sub(r"[^A-Za-z0-9]", "-", str(out))
sess = "11111111-2222-3333-4444-555555555555"
(proj / sess / "subagents").mkdir(parents=True, exist_ok=True)
clock = dt.datetime.now(dt.timezone.utc)


def ts():
    global clock
    clock += dt.timedelta(seconds=1)
    return clock.isoformat().replace("+00:00", "Z")


def turn(rid, ctx_read, ctx_write, content=(), out_tokens=200):
    usage = {"input_tokens": 3, "cache_creation_input_tokens": ctx_write, "cache_read_input_tokens": ctx_read,
             "output_tokens": out_tokens, "cache_creation": {"ephemeral_5m_input_tokens": ctx_write,
                                                             "ephemeral_1h_input_tokens": 0}}
    msg = {"model": "claude-test", "id": rid, "role": "assistant", "content": list(content)}
    if not broken:
        msg["usage"] = usage
    return {"type": "assistant", "requestId": rid, "timestamp": ts(), "cwd": str(out), "message": msg}


def user(content):
    return {"type": "user", "timestamp": ts(), "cwd": str(out), "message": {"role": "user", "content": content}}


def tool_use(i, name, inp):
    return {"type": "tool_use", "id": f"tu{i}", "name": name, "input": inp}


def tool_result(i, content):
    return user([{"type": "tool_result", "tool_use_id": f"tu{i}", "content": content}])


png = b"\x89PNG\r\n\x1a\n" + b"\x00\x00\x00\x0dIHDR" + struct.pack(">II", 1280, 900) + b"\x08\x02\x00\x00\x00"
handoff = lambda nn: f"{out}/run/handoffs/{nn:02d}-page-builder.prompt.md"  # noqa: E731

sub = [
    user(f"Read and follow agents/page-builder.md. Your task handoff is `{handoff(1)}`."),
    turn("r1", 0, 30000, [tool_use(1, "Read", {"file_path": f"{out}/run/plan/learning-plan.md"})]),
    tool_result(1, "x" * 60000),
    turn("r2", 30000, 15000, [tool_use(2, "Bash", {"command": "node probe.mjs"})]),
    tool_result(2, [{"type": "text", "text": "shot"},
                    {"type": "image", "source": {"type": "base64", "media_type": "image/png",
                                                 "data": base64.b64encode(png).decode()}}]),
    turn("r3", 45000, 2000),
    user("<system-reminder>not a new round</system-reminder>"),
    turn("r4", 47000, 1000),
    user(f"The coordinator sent a message: revision round, handoff `{handoff(2)}`."),
    turn("r5", 0, 200000),  # cache expired: the whole context is written again
    turn("r6", 200000, 3000),
    turn("r7", 203000, 1000),
]
orch = [user("/didactician explain things")]
for nn, i in ((1, 10), (2, 11)):
    orch += [turn(f"o{nn}", 20000, 5000, [tool_use(i, "Bash", {"command": f"python3 round_gate.py {out} dispatch"})]),
             tool_result(i, f"NN={nn:02d}")]

with open(proj / sess / "subagents" / "agent-abc123.jsonl", "w") as f:
    f.writelines(json.dumps(r) + "\n" for r in sub)
with open(proj / f"{sess}.jsonl", "w") as f:
    f.writelines(json.dumps(r) + "\n" for r in orch)
print(proj)
