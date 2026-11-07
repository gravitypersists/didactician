#!/usr/bin/env python3
"""Read the run's records by ID instead of reading whole files.

    kb.py <out|run> ids [--kind s,w,k …]      index: one line per record (id, title, file:lines)
    kb.py <out|run> get <id> [<id> …]          the records themselves, verbatim, with file:lines
    kb.py <out|run> get <id> … --closure       plus what they depend on (see below)
    kb.py <out|run> refs <id>                  records that mention <id>

The run's files already hold ID'd records: claims c-NN, misconceptions m-NN, examples x-NN, assets
a-NN, questions q-N and objectives o-N, segments s-NN, widgets w-<id>, checks k-NN, acceptance
criteria ac-NN, decisions d-NN, findings A-/P-/H-NN, and any other `### <prefix>-<id>` block a
designer adds (figures f-NN, say). The files stay the source of truth, written
and edited as markdown. This only reads them. Every record is printed with `file:start-end`, so an
agent that needs to change one can Read that range and Edit it.

--closure is what an agent working on those records needs, worked out from the references:
  - the plan's `## Shape` and `## Conventions` sections (they apply to everything);
  - every record the requested ones mention (one hop);
  - for each requested segment, the claims, misconceptions, examples, assets and figures it cites
    (a segment that is only mentioned, say a widget's host, comes without its citations);
  - acceptance criteria, decisions, open findings and other records (figures …) that mention a
    requested record, or a widget or check inside a requested segment;
  - page-wide acceptance criteria: those whose `(…)` target names no record, like "(all checks)".
Records are printed whole. Nothing is excerpted, so nothing inside a record can be cut off. The
plan's other free sections are not printed but listed at the end with their line ranges, so the
agent knows they exist and can read one if it matters.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import die, resolve_run  # noqa: E402

# Where records live, relative to run/. Later files win for an ID that appears twice
# (a finding's latest round; plan/facts.md only exists at depth none).
SOURCES = [
    "brief.md",
    "research/facts.md", "research/misconceptions.md", "research/examples.md", "research/assets.md",
    "plan/facts.md", "plan/learning-plan.md",
    "decisions.md",
]

KIND_ORDER = ["o", "q", "s", "w", "k", "f", "ac", "c", "m", "x", "a", "d", "A", "P", "H"]
ID_RE = r"[a-z]{1,3}-[A-Za-z0-9][A-Za-z0-9_-]*|[APH]-\d+"
PEERS = ("o", "q", "s", "w", "k", "c", "m", "x", "a")  # reached by forward references only
GLOBAL_SECTIONS = ("Shape", "Conventions")
RECORD_SECTIONS = GLOBAL_SECTIONS + ("Objectives", "Segments", "Widgets", "Comprehension items",
                                     "Acceptance criteria")
HEAD_RE = re.compile(rf"^###\s+({ID_RE})\b[ \t]*(?:(?:[—–-]+|·)[ \t]*(.*))?$")
ITEM_RE = re.compile(rf"^-\s+({ID_RE})\b[:\s]?\s*(.*)$")
ANY_HEAD = re.compile(r"^#{1,3}\s")
LIST_IDS = ("o", "q", "ac")  # these are `- id …` list items, not `### id` blocks


def kind(rid: str) -> str:
    return rid.split("-", 1)[0]


def mentions(text: str) -> list[str]:
    seen = []
    for m in re.finditer(rf"(?<![\w-])({ID_RE})", text):
        rid = m.group(1).rstrip("-_")
        if rid not in seen:
            seen.append(rid)
    return seen


def parse_file(path: Path, rel: str) -> dict[str, dict]:
    lines = path.read_text().splitlines()
    # blank out HTML comments but keep line numbers
    text = re.sub(r"<!--.*?-->", lambda m: "\n" * m.group(0).count("\n"), "\n".join(lines), flags=re.S)
    clean = text.split("\n")
    recs: dict[str, dict] = {}
    cur = None

    def close(end: int):
        nonlocal cur
        if cur:
            while end > cur["start"] and not clean[end - 1].strip():
                end -= 1
            cur["end"] = end
            cur["text"] = "\n".join(lines[cur["start"] - 1:end])
            recs[cur["id"]] = cur
            cur = None

    for i, line in enumerate(clean, start=1):
        h = HEAD_RE.match(line)
        it = ITEM_RE.match(line)
        if h:
            close(i - 1)
            cur = {"id": h.group(1), "title": (h.group(2) or "").strip(), "file": rel, "start": i}
        elif it and kind(it.group(1)) in LIST_IDS:
            close(i - 1)
            cur = {"id": it.group(1), "title": it.group(2).strip()[:80], "file": rel, "start": i}
        elif cur and ANY_HEAD.match(line):
            close(i - 1)
        elif cur and kind(cur["id"]) in LIST_IDS and line.strip() and not line.startswith((" ", "\t")):
            close(i - 1)  # a list item ends at the next unindented line
    close(len(clean))
    return recs


def finding_files(run: Path) -> list[Path]:
    def order(p: Path):
        m = re.search(r"(\d+)$", p.parent.name)
        return (0 if p.parent.name.startswith("round-") else 1, int(m.group(1)) if m else 0)
    return sorted((run / "review").glob("*/findings.md"), key=order)


def plan_sections(run: Path) -> list[tuple[str, int, int, str]]:
    """The plan's `## ` sections: (heading, start line, end line, text)."""
    plan = run / "plan" / "learning-plan.md"
    if not plan.exists():
        return []
    pl = plan.read_text().splitlines()
    heads = [i for i, line in enumerate(pl) if re.match(r"^##\s", line)]
    out = []
    for n, i in enumerate(heads):
        j = heads[n + 1] if n + 1 < len(heads) else len(pl)
        while j > i + 1 and not pl[j - 1].strip():
            j -= 1
        text = re.sub(r"<!--.*?-->\n?", "", "\n".join(pl[i:j]), flags=re.S).rstrip()
        out.append((pl[i][2:].strip(), i + 1, j, text))
    return out


def load(run: Path) -> dict[str, dict]:
    recs: dict[str, dict] = {}
    for rel in SOURCES:
        p = run / rel
        if p.exists():
            recs.update(parse_file(p, rel))
    for p in finding_files(run):
        for rid, r in parse_file(p, str(p.relative_to(run))).items():
            if kind(rid) in ("A", "P", "H"):
                recs[rid] = r
    # A finding's status is the registry's, not whichever findings.md printed it last.
    reg_p = run / "review" / "registry.json"
    reg = json.loads(reg_p.read_text()).get("findings", {}) if reg_p.exists() else {}
    for rid, r in recs.items():
        if rid in reg:
            r["status"] = reg[rid].get("status")
        if not r["title"]:
            body = [ln.strip() for ln in r["text"].splitlines()[1:] if ln.strip()]
            r["title"] = body[0][:80] if body else ""
    return recs


def is_global_ac(r: dict, recs: dict) -> bool:
    """An acceptance criterion whose `(target)` names no record applies page-wide."""
    m = re.match(r"^-\s+ac-[\w-]+\s*\(([^)]*)\)", r["text"])
    target = m.group(1) if m else r["text"]
    return not any(x in recs for x in mentions(target))


def closure(recs: dict[str, dict], want: list[str]) -> list[tuple[str, str]]:
    """[(id, why)] in print order."""
    picked: dict[str, str] = {w: "requested" for w in want}
    for w in want:
        for m in mentions(recs[w]["text"]):
            if m in recs and m not in picked:
                picked[m] = f"mentioned by {w}"
    for s in [i for i in want if kind(i) == "s"]:
        for m in mentions(recs[s]["text"]):
            if m in recs and m not in picked and kind(m) in ("c", "m", "x", "a", "f"):
                picked[m] = f"cited by {s}"
    scope = set(want)
    for w in want:
        if kind(w) == "s":
            scope.update(m for m in mentions(recs[w]["text"]) if kind(m) in ("w", "k"))
    for rid, r in recs.items():
        if rid in picked or kind(rid) in PEERS:
            continue
        if kind(rid) in ("A", "P", "H") and r.get("status") not in (None, "open", "still-open"):
            continue
        hit = [m for m in mentions(r["text"]) if m in scope]
        if hit:
            picked[rid] = f"applies to {hit[0]}"
        elif kind(rid) == "ac" and is_global_ac(r, recs):
            picked[rid] = "page-wide"
    rank = {k: i for i, k in enumerate(KIND_ORDER)}
    return sorted(picked.items(), key=lambda kv: (kv[1] != "requested", rank.get(kind(kv[0]), 99)))


def loc(r: dict) -> str:
    return f"{r['file']}:{r['start']}-{r['end']}"


def main():
    argv = sys.argv[1:]
    if len(argv) < 2 or argv[1] not in ("ids", "get", "refs"):
        die(__doc__.strip(), 2)
    _, run = resolve_run(argv[0])
    cmd, rest = argv[1], argv[2:]
    recs = load(run)

    if cmd == "ids":
        kinds = None
        if "--kind" in rest:
            kinds = set(rest[rest.index("--kind") + 1].split(","))
        rank = {k: i for i, k in enumerate(KIND_ORDER)}
        for rid, r in sorted(recs.items(), key=lambda kv: (rank.get(kind(kv[0]), 99), kv[1]["file"], kv[1]["start"])):
            if kinds and kind(rid) not in kinds:
                continue
            st = f" [{r['status']}]" if r.get("status") else ""
            print(f"{rid:<22} {loc(r):<40} {r['title'][:70]}{st}")
        return

    if cmd == "refs":
        if not rest:
            die("refs needs an id", 2)
        target = rest[0]
        for rid, r in recs.items():
            if rid != target and target in mentions(r["text"]):
                print(f"{rid:<22} {loc(r):<40} {r['title'][:70]}")
        return

    want = [a for a in rest if not a.startswith("--")]
    want = [x for a in want for x in a.split(",") if x]
    missing = [w for w in want if w not in recs]
    if missing:
        die(f"no record for {', '.join(missing)}. `kb.py {argv[0]} ids` lists what exists.", 1)
    if "--closure" not in rest:
        for w in want:
            print(f"<!-- {w} · {loc(recs[w])} -->\n{recs[w]['text']}\n")
        return
    sections = plan_sections(run)
    for head, a, b, text in sections:
        if head in GLOBAL_SECTIONS:
            print(f"<!-- plan globals · plan/learning-plan.md:{a}-{b} -->\n{text}\n")
    for rid, why in closure(recs, want):
        r = recs[rid]
        tag = "" if why == "requested" else f" · {why}"
        print(f"<!-- {rid} · {loc(r)}{tag} -->\n{r['text']}\n")
    other = [(h, a, b) for h, a, b, _ in sections if h not in RECORD_SECTIONS]
    if other:
        print("<!-- not included: the plan's other sections. Read one by its range if it bears on your task.")
        for h, a, b in other:
            print(f"     ## {h} · plan/learning-plan.md:{a}-{b}")
        print("-->")


if __name__ == "__main__":
    main()
