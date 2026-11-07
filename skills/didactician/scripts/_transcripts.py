"""Adapter: Claude Code transcripts (.jsonl) → Didactician usage events (format v1).

This is the only code that reads Claude Code's transcript format. That format is internal to
Claude Code and undocumented, so it can change with any update. When it does, this module raises
TranscriptFormatError naming what it couldn't find, rather than quietly reporting zeros.
Everything downstream (cost_report.py, future evals) reads the usage events in run/usage/, which
are a format we own.

Usage events, one JSON object per line, all carrying "v": 1:

    {"t":"segment", "dispatch":5, "role":"page-builder", "agent":"a02d…", "session":"…",
     "kind":"spawn"|"continue"|"orchestrator", "seq":0, "ts":"…", "source":"~/.claude/projects/…"}
    {"t":"turn", "ts":"…", "input":312, "cache_write_5m":214880, "cache_write_1h":0,
     "cache_read":198004, "output":611}
    {"t":"tool", "name":"Read", "path":"site/index.html", "op":"read", "whole":true, "result_bytes":90112}
    {"t":"image", "w":1280, "h":2400, "est_tokens":1534}

No message content is kept: only counts, paths, sizes and timestamps.

How transcripts are matched to a run:
- A subagent belongs to dispatch NN when a user message (its first prompt, or a continuation)
  names `<run>/handoffs/NN-<role>.prompt.md`. Each such message starts a segment.
- Orchestrator turns are the turns of a main session between its first and last Bash command
  that names the run's directory, clipped to the span of the run's log.
"""

from __future__ import annotations

import base64
import datetime as _dt
import json
import os
import re
import shlex
import struct
from pathlib import Path

FORMAT_VERSION = 1


class TranscriptFormatError(Exception):
    pass


def projects_root() -> Path:
    return Path(os.environ.get("CLAUDE_CONFIG_DIR", Path.home() / ".claude")) / "projects"


def project_dirs(out: Path, override: str | None = None) -> list[Path]:
    """Claude Code keeps transcripts in projects/<cwd with every non-alphanumeric char → '-'>.
    The orchestrator's cwd is the run directory or one of its ancestors."""
    if override:
        return [Path(override)]
    root = projects_root()
    dirs = []
    for p in [out, *out.parents]:
        d = root / re.sub(r"[^A-Za-z0-9]", "-", str(p))
        if d.is_dir():
            dirs.append(d)
    return dirs


def _ts(s: str) -> _dt.datetime:
    return _dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def _records(path: Path, text: str):
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if not line.strip():
            continue
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            if i == len(lines) - 1:  # a live transcript can end in a half-written line
                return
            raise TranscriptFormatError(f"{path}: line {i + 1} is not JSON")


def _user_text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return " ".join(b.get("text", "") for b in content if isinstance(b, dict) and b.get("type") == "text")
    return ""


def _is_tool_result(content) -> bool:
    return isinstance(content, list) and any(isinstance(b, dict) and b.get("type") == "tool_result" for b in content)


def _usage(u, where: str) -> dict:
    if not isinstance(u, dict) or "input_tokens" not in u or "output_tokens" not in u:
        raise TranscriptFormatError(f"{where}: assistant turn has no usage.input_tokens/output_tokens")
    created = u.get("cache_creation_input_tokens", 0) or 0
    split = u.get("cache_creation") or {}
    w1h = split.get("ephemeral_1h_input_tokens", 0) or 0
    return {
        "input": u["input_tokens"] or 0,
        "cache_write_5m": max(0, created - w1h),
        "cache_write_1h": w1h,
        "cache_read": u.get("cache_read_input_tokens", 0) or 0,
        "output": u["output_tokens"] or 0,
    }


# ── images ───────────────────────────────────────────────────────────────────

def _image_dims(b64: str):
    try:
        raw = base64.b64decode(b64[: 64 * 1024 // 3 * 4])
    except (ValueError, TypeError):
        return None
    if raw[:8] == b"\x89PNG\r\n\x1a\n" and len(raw) >= 24:
        return struct.unpack(">II", raw[16:24])
    if raw[:2] == b"\xff\xd8":  # JPEG: walk the markers to a start-of-frame
        i = 2
        while i + 9 < len(raw):
            if raw[i] != 0xFF:
                i += 1
                continue
            marker = raw[i + 1]
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                h, w = struct.unpack(">HH", raw[i + 5:i + 9])
                return w, h
            i += 2 + struct.unpack(">H", raw[i + 2:i + 4])[0]
    return None


def image_tokens(w: int, h: int) -> int:
    """The API downscales to a long edge of 1568px and about 1.15 megapixels, then charges w*h/750."""
    s = min(1.0, 1568 / max(w, h), (1.15e6 / (w * h)) ** 0.5)
    return round((w * s) * (h * s) / 750)


def _image_event(block) -> dict | None:
    src = block.get("source") or {}
    dims = _image_dims(src.get("data", "")) if src.get("type") == "base64" else None
    if dims and dims[0] and dims[1]:
        return {"v": FORMAT_VERSION, "t": "image", "w": dims[0], "h": dims[1], "est_tokens": image_tokens(*dims)}
    return {"v": FORMAT_VERSION, "t": "image", "w": None, "h": None, "est_tokens": 1600}


# ── tools ────────────────────────────────────────────────────────────────────

_READ_CMDS = {"cat", "head", "tail", "sed", "nl", "less", "more"}


def _norm_path(p: str, cwd: str | None, out: Path) -> str:
    if not p:
        return p
    path = Path(p).expanduser()
    if not path.is_absolute() and cwd:
        path = Path(cwd) / path
    path = Path(os.path.normpath(path))
    if "tool-results" in path.parts and ".claude" in path.parts:
        return "(a large tool output Claude Code saved to a file)"
    try:
        return str(path.relative_to(out))
    except ValueError:
        pass
    try:
        return "~/" + str(path.relative_to(Path.home()))
    except ValueError:
        return str(path)


def _bash_read(cmd: str):
    """(path, whole) for a simple single-file read command, else None. Compound commands are skipped."""
    if any(ch in cmd for ch in "|;&<>`$\n"):
        return None
    try:
        argv = shlex.split(cmd)
    except ValueError:
        return None
    if not argv or argv[0] not in _READ_CMDS:
        return None
    files = [a for a in argv[1:] if not a.startswith("-")]
    if argv[0] == "sed":
        files = files[1:]  # first non-flag is the script
    if len(files) != 1:
        return None
    return files[0], argv[0] == "cat"


def _tool_event(name: str, inp: dict, result_bytes: int, cwd, out: Path) -> dict:
    ev = {"v": FORMAT_VERSION, "t": "tool", "name": name, "result_bytes": result_bytes}
    inp = inp if isinstance(inp, dict) else {}
    if name == "Read" and inp.get("file_path"):
        ev.update(path=_norm_path(inp["file_path"], cwd, out), op="read",
                  whole=not any(inp.get(k) for k in ("offset", "limit", "pages")))
    elif name in ("Write", "Edit", "NotebookEdit") and (inp.get("file_path") or inp.get("notebook_path")):
        ev.update(path=_norm_path(inp.get("file_path") or inp.get("notebook_path"), cwd, out), op="write")
    elif name == "Bash":
        r = _bash_read(inp.get("command", ""))
        if r:
            ev.update(path=_norm_path(r[0], cwd, out), op="read", whole=r[1])
    return ev


def _result_size_and_images(content):
    if isinstance(content, str):
        return len(content.encode()), []
    size, images = 0, []
    for b in content or []:
        if not isinstance(b, dict):
            continue
        if b.get("type") == "text":
            size += len(b.get("text", "").encode())
        elif b.get("type") == "image":
            images.append(b)
    return size, images


# ── one transcript → events ──────────────────────────────────────────────────

class _Walker:
    """Turns transcript records into usage events, deduplicating streamed assistant lines."""

    def __init__(self, path: Path, out: Path):
        self.path, self.out = path, out
        self.pending: dict[str, tuple[str, dict]] = {}
        self.turns: dict[str, dict] = {}

    def events(self, rec) -> list[dict]:
        kind = rec.get("type")
        msg = rec.get("message") or {}
        evs = []
        if kind == "assistant":
            if msg.get("model") == "<synthetic>":
                return evs
            key = rec.get("requestId") or msg.get("id") or rec.get("uuid")
            u = _usage(msg.get("usage"), f"{self.path.name} @ {rec.get('timestamp')}")
            if key in self.turns:
                self.turns[key].update(u)  # later lines of the same request carry the final counts
            else:
                t = {"v": FORMAT_VERSION, "t": "turn", "ts": rec.get("timestamp"), **u}
                self.turns[key] = t
                evs.append(t)
            for b in msg.get("content") or []:
                if isinstance(b, dict) and b.get("type") == "tool_use":
                    self.pending[b.get("id")] = (b.get("name", "?"), b.get("input") or {})
        elif kind == "user":
            content = msg.get("content")
            if isinstance(content, list):
                for b in content:
                    if not isinstance(b, dict):
                        continue
                    if b.get("type") == "tool_result":
                        size, imgs = _result_size_and_images(b.get("content"))
                        name, inp = self.pending.pop(b.get("tool_use_id"), ("?", {}))
                        evs.append(_tool_event(name, inp, size, rec.get("cwd"), self.out))
                        evs += [_image_event(i) for i in imgs]
                    elif b.get("type") == "image":
                        evs.append(_image_event(b))
        return evs


def extract_subagent(path: Path, out: Path, origin_run: Path, roles: dict[int, str]) -> list[dict]:
    """Segments of one subagent transcript that belong to this run: [{header, events}]."""
    text = path.read_text(errors="replace")
    if str(origin_run) not in text:
        return []
    handoff = re.compile(re.escape(str(origin_run)) + r"/handoffs/(\d+)-([a-z0-9-]+)\.prompt\.md")
    walker = _Walker(path, out)
    segs, cur, agent, session = [], None, path.stem.removeprefix("agent-"), path.parent.parent.name
    for rec in _records(path, text):
        msg = rec.get("message") or {}
        if rec.get("type") == "user" and not _is_tool_result(msg.get("content")):
            found = [(int(m.group(1)), m.group(2)) for m in handoff.finditer(_user_text(msg.get("content")))]
            if found:
                nn, role = max(found)
                if cur is None or cur["header"]["dispatch"] != nn:
                    cur = {"header": {
                        "v": FORMAT_VERSION, "t": "segment", "dispatch": nn, "role": roles.get(nn, role),
                        "agent": agent, "session": session, "kind": "spawn" if not segs else "continue",
                        "seq": len(segs), "ts": rec.get("timestamp"), "source": _norm_path(str(path), None, out),
                    }, "events": []}
                    segs.append(cur)
        evs = walker.events(rec)
        if cur is not None:
            cur["events"] += evs
    if segs and not any(e["t"] == "turn" for s in segs for e in s["events"]):
        raise TranscriptFormatError(f"{path}: matched this run but no assistant turns were recognised")
    return segs


def extract_orchestrator(path: Path, out: Path, start: str, end: str) -> dict | None:
    """The orchestrator's share of one main-session transcript, or None if it never touched this run."""
    text = path.read_text(errors="replace")
    if str(out) not in text and out.name not in text:
        return None
    t0, t1 = _ts(start), _ts(end) + _dt.timedelta(minutes=10)
    recs = list(_records(path, text))
    marks = []
    for i, rec in enumerate(recs):
        if rec.get("type") != "assistant":
            continue
        cwd = rec.get("cwd") or ""
        rel = os.path.relpath(out, cwd) if cwd else str(out)
        for b in (rec.get("message") or {}).get("content") or []:
            if isinstance(b, dict) and b.get("type") == "tool_use" and b.get("name") == "Bash":
                cmd = (b.get("input") or {}).get("command", "")
                if "cost_report.py" in cmd:
                    continue
                if str(out) in cmd or (not rel.startswith("..") and rel != "." and rel in cmd):
                    ts = rec.get("timestamp")
                    if ts and t0 <= _ts(ts) <= t1:
                        marks.append(i)
    if not marks:
        return None
    walker = _Walker(path, out)
    events = []
    for rec in recs[marks[0]:marks[-1] + 1]:
        events += walker.events(rec)
    # tool results for the last marked call arrive after it
    for rec in recs[marks[-1] + 1:marks[-1] + 3]:
        if rec.get("type") == "user":
            events += walker.events(rec)
    if not any(e["t"] == "turn" for e in events):
        raise TranscriptFormatError(f"{path}: matched this run but no assistant turns were recognised")
    return {"header": {
        "v": FORMAT_VERSION, "t": "segment", "dispatch": None, "role": "orchestrator", "agent": path.stem,
        "session": path.stem, "kind": "orchestrator", "seq": 0, "ts": recs[marks[0]].get("timestamp"),
        "source": _norm_path(str(path), None, out),
    }, "events": events}


def collect(out: Path, run: Path, origin: Path, since: str, until: str, roles: dict[int, str],
            override: str | None = None) -> tuple[list[dict], list[dict], list[Path]]:
    """(subagent segments, orchestrator segments, project dirs searched)."""
    origin_run = origin / "run"
    t_since = _ts(since).timestamp() - 3600
    subs, orch = [], []
    dirs = project_dirs(origin, override)
    for d in dirs:
        for p in sorted(d.glob("*/subagents/*.jsonl")):
            if p.stat().st_mtime >= t_since:
                subs += extract_subagent(p, origin, origin_run, roles)
        for p in sorted(d.glob("*.jsonl")):
            if p.stat().st_mtime >= t_since:
                seg = extract_orchestrator(p, origin, since, until)
                if seg:
                    orch.append(seg)
    return subs, orch, dirs
