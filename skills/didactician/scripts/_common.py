"""Shared helpers for Didactician's run scripts. Stdlib only."""

from __future__ import annotations

import datetime as _dt
import json
import os
import re
import sys
import tempfile
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent

# Namespaces the orchestrator and the scripts may always write (relative to <out>).
ORCHESTRATOR_NS = [
    "run/brief.md",
    "run/decisions.md",
    "run/escalation.md",
    "run/log.md",
    "run/state.json",
    "run/handoffs",
    "run/history",
    "run/gate",
    "run/screenshots",
    "run/review/registry.json",
    "run/review/round-*/findings.md",
]


def now() -> str:
    return _dt.datetime.now().astimezone().isoformat(timespec="seconds")


def parse_time(s: str) -> _dt.datetime:
    return _dt.datetime.fromisoformat(s)


def die(msg: str, code: int = 1):
    print(msg, file=sys.stderr)
    sys.exit(code)


def resolve_run(arg: str) -> tuple[Path, Path]:
    """Accept either <out> or <out>/run; return (out, run)."""
    p = Path(arg).resolve()
    if p.name == "run" and (p / "state.json").exists():
        return p.parent, p
    if (p / "run" / "state.json").exists():
        return p, p / "run"
    die(f"no run found at {arg} (expected <out>/run/state.json); run init_run.py first")


def load_state(run: Path) -> dict:
    return json.loads((run / "state.json").read_text())


def save_state(run: Path, state: dict):
    write_atomic(run / "state.json", json.dumps(state, indent=2) + "\n")


def write_atomic(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=".tmp-")
    with os.fdopen(fd, "w") as f:
        f.write(text)
    os.replace(tmp, path)


def strip_comments(text: str) -> str:
    return re.sub(r"<!--.*?-->", "", text, flags=re.S)


def kv_lines(text: str) -> dict:
    """Top-level `key: value` lines (first occurrence wins)."""
    out = {}
    for line in strip_comments(text).splitlines():
        m = re.match(r"^([a-z_][a-z0-9_]*):\s*(.*?)\s*$", line)
        if m and m.group(1) not in out:
            out[m.group(1)] = m.group(2)
    return out


def blocks(text: str, id_pattern: str) -> list[tuple[str, str, dict]]:
    """Split on `### <id>[ — title]` headings whose id matches id_pattern.

    Returns (id, title, fields) where fields are the `key: value` lines in the block.
    Indented `  key: value` lines under a `key:` line are folded in as `parent.key`.
    """
    text = strip_comments(text)
    heads = list(re.finditer(rf"^###\s+({id_pattern})\b[ \t]*(?:[—–-]+[ \t]*(.*))?$", text, flags=re.M))
    out = []
    for i, m in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
        # stop the block at the next level-2 heading too
        body = text[m.end():end]
        h2 = re.search(r"^##\s", body, flags=re.M)
        if h2:
            body = body[: h2.start()]
        fields, parent = {}, None
        for line in body.splitlines():
            top = re.match(r"^([a-z_][a-z0-9_]*):\s*(.*?)\s*$", line)
            sub = re.match(r"^\s{2,}([a-z_][a-z0-9_]*):\s*(.*?)\s*$", line)
            if top:
                parent = top.group(1)
                fields[parent] = top.group(2)
            elif sub and parent:
                fields[f"{parent}.{sub.group(1)}"] = sub.group(2)
            elif re.match(r"^\S", line):
                parent = None
            # a line like "readiness: x · interactivity: y" is also split on " · "
        for k, v in list(fields.items()):
            if " · " in v:
                parts = v.split(" · ")
                fields[k] = parts[0].strip()
                for p in parts[1:]:
                    mm = re.match(r"^([a-z_][a-z0-9_-]*):\s*(.*)$", p.strip())
                    if mm:
                        fields.setdefault(mm.group(1).replace("-", "_"), mm.group(2).strip())
        out.append((m.group(1), (m.group(2) or "").strip(), fields))
    return out


def ids_in(value: str, prefix: str) -> list[str]:
    return re.findall(rf"\b{prefix}-[A-Za-z0-9_-]+\b", value or "")


def section(text: str, heading: str) -> str:
    """Body of a `## heading` section (until the next `## `)."""
    text = strip_comments(text)
    m = re.search(rf"^##\s+{re.escape(heading)}\s*$", text, flags=re.M | re.I)
    if not m:
        return ""
    rest = text[m.end():]
    n = re.search(r"^##\s", rest, flags=re.M)
    return rest[: n.start()] if n else rest


def read_brief(run: Path) -> dict:
    p = run / "brief.md"
    if not p.exists():
        die(f"missing {p}")
    text = p.read_text()
    b = kv_lines(text)
    b["_text"] = text
    b["objectives"] = re.findall(r"^-\s*(o-\d+):\s*(.+)$", section(text, "Objectives"), flags=re.M)
    b["questions"] = re.findall(
        r"^-\s*(q-\d+)\s*\((o-\d+)\):\s*(.+)$", section(text, "Research questions"), flags=re.M
    )
    try:
        b["minutes"] = float(re.match(r"[\d.]+", b.get("time_budget_minutes", "")).group(0))
    except (AttributeError, ValueError):
        b["minutes"] = None
    return b


def log_append(run: Path, actor: str, event: str, summary: str, links=(), decision: str | None = None):
    """Append one human-readable entry to run/log.md. Links are paths relative to run/ or absolute."""
    lines = [f"\n### {now()} · {actor} · {event}", summary.strip()]
    for link in links:
        p = Path(link)
        try:
            rel = p.resolve().relative_to(run.resolve()) if p.is_absolute() else Path(link)
        except ValueError:
            rel = p
        lines.append(f"- [{rel}]({rel})")
    if decision:
        lines.append(f"- **decision:** {decision}")
    with open(run / "log.md", "a") as f:
        f.write("\n".join(lines) + "\n")


def file_manifest(out: Path) -> dict:
    """mtime+size+hash-lite manifest of every file under <out>, excluding history snapshots."""
    import hashlib

    m = {}
    for root, dirs, files in os.walk(out):
        rel_root = Path(root).relative_to(out)
        if rel_root.parts[:2] == ("run", "history"):
            dirs[:] = []
            continue
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules")]
        for name in files:
            p = Path(root) / name
            rel = str(p.relative_to(out))
            try:
                data = p.read_bytes()
            except OSError:
                continue
            m[rel] = hashlib.sha1(data).hexdigest()
    return m


def under(path: str, namespaces: list[str]) -> bool:
    import fnmatch

    for ns in namespaces:
        ns = ns.rstrip("/")
        if "*" in ns:
            if fnmatch.fnmatch(path, ns) or fnmatch.fnmatch(path, ns + "/*"):
                return True
        elif path == ns or path.startswith(ns + "/"):
            return True
    return False
