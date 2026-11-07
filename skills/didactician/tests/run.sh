#!/usr/bin/env bash
# Self-test for Didactician's scripts. Copies fixtures to a temp dir (never writes into tests/).
#   bash tests/run.sh
# Needs: python3, node ≥ 20, and scripts/preflight.sh having succeeded once.
set -uo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/didactician-test.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
PASS=0; FAILN=0
ok()   { echo "  ok   $1"; PASS=$((PASS+1)); }
bad()  { echo "  FAIL $1"; FAILN=$((FAILN+1)); }
expect_exit() { # name expected-code actual-code
  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (exit $3, expected $2)"; fi
}
expect_grep() { # name pattern file
  if grep -q -- "$2" "$3"; then ok "$1"; else bad "$1 (no '$2' in output)"; fi
}

# Keep the scripts away from the real ~/.claude transcripts.
export CLAUDE_CONFIG_DIR="$TMP/claude"
cp -R "$SKILL/tests/fixtures" "$TMP/fx"
rm -rf "$TMP"/fx/*/run/gate "$TMP"/fx/*/run/screenshots

echo "verify.mjs"
node "$SKILL/scripts/verify.mjs" --out "$TMP/fx/bad" > "$TMP/bad.txt" 2>&1; expect_exit "bad fixture fails" 1 $?
for id in "FAIL overflow" "FAIL static" "FAIL media" "FAIL replay" "FAIL carousel" "FAIL markers" "FAIL relative" "FAIL console" "FAIL resources" "FAIL placeholders"; do
  expect_grep "bad: $id" "$id" "$TMP/bad.txt"
done
expect_grep "bad: clipped marker box" "exceeds its markerWidth/Height box" "$TMP/bad.txt"
expect_grep "bad: unresolved marker" "does not resolve" "$TMP/bad.txt"
expect_grep "bad: head outside svg" "outside the <svg> box" "$TMP/bad.txt"
node "$SKILL/scripts/verify.mjs" --out "$TMP/fx/good" > "$TMP/good.txt" 2>&1; expect_exit "good fixture passes" 0 $?
node "$SKILL/scripts/verify.mjs" --out "$TMP/fx/kit" > "$TMP/kit.txt" 2>&1; expect_exit "kit demo passes" 0 $?
expect_grep "kit: legibility warns at 360" "warn legibility" "$TMP/kit.txt"
# asset approval removed → media must fail
sed -i.bak 's/decision: approved/decision: rejected/' "$TMP/fx/good/run/decisions.md"
node "$SKILL/scripts/verify.mjs" --out "$TMP/fx/good" > "$TMP/good2.txt" 2>&1; expect_exit "rejected asset fails" 1 $?
expect_grep "rejected asset reported" "which the user rejected" "$TMP/good2.txt"

echo "assemble (fragments)"
F="$TMP/fx/frag"
node "$SKILL/scripts/verify.mjs" --out "$F" > "$TMP/frag.txt" 2>&1; expect_exit "fragment page assembles and passes" 0 $?
expect_grep "banner on line 2" "assembled by didactician assemble.mjs" "$F/site/index.html"
expect_grep "segment boundaries marked" "<!-- begin s-02 · src/s-02.html -->" "$F/site/index.html"
expect_grep "order written for hosts" '"id": "s-02"' "$F/site/src/segments.json"
sed -i.bak 's|A longer pendulum|A much longer pendulum|' "$F/site/index.html"
node "$SKILL/scripts/verify.mjs" --out "$F" > "$TMP/frag2.txt" 2>&1; expect_exit "hand-edited index.html refused" 2 $?
expect_grep "hand edit named" "edited by hand" "$TMP/frag2.txt"
node "$SKILL/scripts/assemble.mjs" --out "$F" --force > /dev/null; expect_exit "--force reassembles" 0 $?
echo '<section id="s-09"></section>' > "$F/site/src/s-09.html"
node "$SKILL/scripts/assemble.mjs" --out "$F" > "$TMP/frag3.txt" 2>&1; expect_exit "unplaced fragment refused" 2 $?
expect_grep "unplaced fragment named" "src/s-09.html is not placed" "$TMP/frag3.txt"
rm "$F/site/src/s-09.html"
node "$SKILL/scripts/assemble.mjs" --out "$TMP/fx/good" > "$TMP/single.txt" 2>&1; expect_exit "single-file page left alone" 0 $?

echo "kb.py"
python3 "$SKILL/scripts/kb.py" "$F" get w-swing --closure > "$TMP/kb.txt" 2>&1; expect_exit "closure" 0 $?
for id in "## Shape" "## Conventions" "### s-01" "### c-01" "ac-02 (w-swing)" "ac-04 (all checks)" "### d-01" "## Diagnosis · plan/learning-plan.md"; do
  expect_grep "closure has $id" "$id" "$TMP/kb.txt"
done
grep -q "### c-02\|ac-03\|### s-02" "$TMP/kb.txt" && bad "closure leaks another segment's records" || ok "closure stays in scope"
python3 "$SKILL/scripts/kb.py" "$F" get s-02 --closure > "$TMP/kb2.txt"
expect_grep "requested segment brings its claims" "### c-02" "$TMP/kb2.txt"
python3 "$SKILL/scripts/kb.py" "$F" get c-01 > "$TMP/kb3.txt"; expect_grep "record with its location" "c-01 · research/facts.md:8-12" "$TMP/kb3.txt"
python3 "$SKILL/scripts/kb.py" "$F" get s-77 > /dev/null 2>&1; expect_exit "unknown id fails" 1 $?
python3 "$SKILL/scripts/kb.py" "$F" refs c-01 > "$TMP/kb4.txt"; expect_grep "refs finds the citing segment" "^s-01 " "$TMP/kb4.txt"
python3 "$SKILL/scripts/kb.py" "$F" ids --kind s,w > "$TMP/kb5.txt"; expect_grep "ids lists widgets" "^w-swing " "$TMP/kb5.txt"

echo "round_gate.py"
R="$TMP/run1"
python3 "$SKILL/scripts/init_run.py" "$R" --slug t --depth light --minutes 5 > /dev/null; expect_exit "init" 0 $?
python3 "$SKILL/scripts/round_gate.py" "$R" dispatch --role researcher --loop research --writes run/research --label a > "$TMP/d1.txt"; expect_exit "dispatch" 0 $?
echo p > "$R/run/handoffs/01-researcher.prompt.md"
echo rogue > "$R/site/x.html"
printf 'status: done\n' > "$R/run/handoffs/01-researcher.report.md"
python3 "$SKILL/scripts/round_gate.py" "$R" receive 1 > /dev/null 2>&1; expect_exit "namespace violation detected" 5 $?
python3 "$SKILL/scripts/round_gate.py" "$R" dispatch --role instructional-designer --loop checkpoint --writes run/plan --label b > /dev/null 2>&1; expect_exit "blocked until ack" 5 $?
python3 "$SKILL/scripts/round_gate.py" "$R" ack 1 --note test > /dev/null
python3 "$SKILL/scripts/round_gate.py" "$R" dispatch --role instructional-designer --loop checkpoint --writes run/plan --label b > /dev/null 2>&1; expect_exit "dispatch after ack" 0 $?
python3 "$SKILL/scripts/round_gate.py" "$R" dispatch --role instructional-designer --loop checkpoint --writes run/plan --label c > /dev/null 2>&1; expect_exit "unreceived dispatch blocks same loop" 5 $?
python3 "$SKILL/scripts/round_gate.py" "$R" receive 2 --abandon test > /dev/null; expect_exit "abandon" 0 $?
# no-progress: two identical gate failure sets
python3 - "$R" <<'EOF'
import json, sys
p = sys.argv[1] + "/run/state.json"; s = json.load(open(p))
s["gate_history"]["gate:page"] = [["overflow: x"], ["overflow: x"]]; json.dump(s, open(p, "w"))
EOF
python3 "$SKILL/scripts/round_gate.py" "$R" dispatch --role page-builder --loop gate:page --writes site --label fix > /dev/null 2>&1; expect_exit "no-progress asks for pivot" 3 $?
python3 "$SKILL/scripts/round_gate.py" "$R" dispatch --role page-builder --loop gate:page --writes site --label fix --pivot > /dev/null 2>&1; expect_exit "pivot authorised" 0 $?
# cap
python3 - "$R" <<'EOF'
import json, sys
p = sys.argv[1] + "/run/state.json"; s = json.load(open(p)); s["caps"]["spawns"] = len(s["dispatches"]); json.dump(s, open(p, "w"))
EOF
python3 "$SKILL/scripts/round_gate.py" "$R" dispatch --role researcher --loop research --writes run/research --label z > /dev/null 2>&1; expect_exit "spawn cap enforced" 2 $?
# agent time: a 3-hour dispatch with a 2.5-hour pause between turns counts active time only
A="$TMP/run-time"
python3 "$SKILL/scripts/init_run.py" "$A" --slug a --depth light --minutes 5 > /dev/null
python3 - "$A" <<'EOF'
import json, sys
run = sys.argv[1] + "/run"; p = run + "/state.json"; s = json.load(open(p))
s["dispatches"] = [
  {"nn": 1, "role": "page-builder", "loop": "gate:page", "label": "x", "writes": ["site"], "exclude": [],
   "opened": "2026-01-01T10:00:00+00:00", "closed": "2026-01-01T13:00:00+00:00", "status": "done", "ns_ok": True},
  {"nn": 2, "role": "researcher", "loop": "research", "label": "y", "writes": ["run/research"], "exclude": [],
   "opened": "2026-01-01T14:00:00+00:00", "closed": "2026-01-01T14:10:00+00:00", "status": "done", "ns_ok": True}]
s["seq"] = 2; json.dump(s, open(p, "w"))
seg = {"v": 1, "t": "segment", "dispatch": 1, "role": "page-builder"}
ts = ["10:01", "10:05", "10:10", "10:15", "10:20", "12:50", "12:55"]  # 20 min of work, a 2.5 h pause, 5 min more
lines = [seg] + [{"v": 1, "t": "turn", "ts": f"2026-01-01T{t}:00Z"} for t in ts]
import os; os.makedirs(run + "/usage", exist_ok=True)
open(run + "/usage/01-page-builder.jsonl", "w").write("".join(json.dumps(l) + "\n" for l in lines))
EOF
python3 "$SKILL/scripts/round_gate.py" "$A" status > "$TMP/at.txt"
# dispatch 1: 10:00→10:20 (20) + 5 capped + 12:50→12:55 (5) + 5 capped to close = 35; dispatch 2 has no turns: 10
expect_grep "pauses between turns don't count as agent time" "agent-min: 45/" "$TMP/at.txt"

echo "findings.py (human review)"
H="$R/run/review/human-site-1"; mkdir -p "$H"
cat > "$H/comments.json" <<'EOF'
{"comments":[
 {"id":"c1","type":"highlight","text":"Too wordy.","anchor":{"exact":"some words","prefix":"","suffix":""},"resolved":false,"replies":[]},
 {"id":"c2","type":"block","text":"Say who built this.","geom":{"kind":"block","selector":"#s-01 > p"},"resolved":false,"replies":[]},
 {"id":"c3","type":"highlight","text":"Fine now.","anchor":{"exact":"x","prefix":"","suffix":""},"resolved":true,"replies":[]}],
 "didactician":{"targets":{"c2":"Being an Account"},"shots":{}}}
EOF
echo '{"ended":"x","how":"submitted","submitted":true}' > "$H/meta.json"
python3 "$SKILL/scripts/init_run.py" "$R" --slug t --depth light --minutes 5 > "$TMP/resume.txt"
expect_grep "resume flags an unconfirmed round" "NOT ingested" "$TMP/resume.txt"
python3 "$SKILL/scripts/findings.py" "$R" ingest-human site-1 --decision d-01 > /dev/null 2>&1; expect_exit "ingest refused without a decision" 1 $?
printf '\n### d-01 · t · delta\nquestion: done?\nanswer: "keep going"\ndecision: other\napplies_to: human-review site-1\n' >> "$R/run/decisions.md"
python3 "$SKILL/scripts/findings.py" "$R" ingest-human site-1 --decision d-01 > /dev/null 2>&1; expect_exit "ingest refused unless the user said finished" 1 $?
printf '\n### d-02 · t · delta\nquestion: done?\nanswer: "yes, done"\ndecision: approved\napplies_to: human-review site-1\n' >> "$R/run/decisions.md"
python3 "$SKILL/scripts/findings.py" "$R" ingest-human site-1 --decision d-02 > "$TMP/h.txt" 2>&1; expect_exit "ingest on the user's yes" 0 $?
expect_grep "open comments become H- findings" "new: H-01, H-02" "$TMP/h.txt"
python3 "$SKILL/scripts/findings.py" "$R" ingest-human site-1 --decision d-02 > "$TMP/h2.txt" 2>&1
expect_grep "re-ingest adds nothing twice" "new: none" "$TMP/h2.txt"
python3 "$SKILL/scripts/init_run.py" "$R" --slug t --depth light --minutes 5 > "$TMP/resume2.txt"
expect_grep "resume sees the round ingested" "ingested as H- findings" "$TMP/resume2.txt"
python3 "$SKILL/scripts/findings.py" "$R" status > /dev/null; expect_exit "open H- findings block" 1 $?
python3 "$SKILL/scripts/findings.py" "$R" close H-01 H-02 --decision d-09 > /dev/null 2>&1; expect_exit "close needs a recorded decision" 1 $?
python3 "$SKILL/scripts/findings.py" "$R" close H-01 H-02 --decision d-02 > /dev/null; expect_exit "close on the user's word" 0 $?
python3 "$SKILL/scripts/findings.py" "$R" status > /dev/null; expect_exit "nothing blocking after close" 0 $?

echo "findings.py (changed-text check after wording edits)"
W="$R/run/review/wording-1"; mkdir -p "$W"
cat > "$W/accuracy.md" <<'EOF'
### new
severity: blocking
criterion: accuracy
location: s-01
verdict: contradicted
evidence: the reworded sentence now says the opposite of c-03
expected_fix: restore the original meaning

### new
severity: should
criterion: accuracy
location: s-01
verdict: unsupported
evidence: x
expected_fix: y
EOF
python3 "$SKILL/scripts/findings.py" "$R" ingest wording-1 > "$TMP/w.txt" 2>&1; expect_exit "wording check ingests" 0 $?
expect_grep "wording findings.md written" "wording-1/findings.md" "$TMP/w.txt"
python3 "$SKILL/scripts/findings.py" "$R" status > /dev/null; expect_exit "a blocking wording finding blocks" 1 $?
expect_grep "below-blocking wording findings are late nits" "late nits (not routed)" "$R/run/log.md"
python3 "$SKILL/scripts/findings.py" "$R" ingest wording-x > /dev/null 2>&1; expect_exit "bad ingest target refused" 1 $?

echo "cost_report.py"
C="$TMP/run3"
python3 "$SKILL/scripts/init_run.py" "$C" --slug c --depth light --minutes 5 > /dev/null
for n in 1 2; do
  python3 "$SKILL/scripts/round_gate.py" "$C" dispatch --role page-builder --loop gate:page --writes site --label r$n > /dev/null
  echo p > "$C/run/handoffs/0$n-page-builder.prompt.md"; printf 'status: done\n' > "$C/run/handoffs/0$n-page-builder.report.md"
  [ $n = 1 ] && python3 "$SKILL/tests/make_transcripts.py" "$C" "$CLAUDE_CONFIG_DIR" > /dev/null
  python3 "$SKILL/scripts/round_gate.py" "$C" receive $n > "$TMP/c$n.txt" 2>&1
done
expect_grep "receive refreshes the cost report" "cost so far:" "$TMP/c2.txt"
for f in 01-page-builder 02-page-builder orchestrator; do
  [ -s "$C/run/usage/$f.jsonl" ] && ok "usage/$f.jsonl written" || bad "usage/$f.jsonl missing"
done
expect_grep "reminder doesn't split a round" '"turns": 4' "$C/run/cost.json"
expect_grep "continuation counted" "+ 1 continuation" "$C/run/cost.md"
expect_grep "cold restart found" "started after the cache had expired" "$C/run/cost.md"
expect_grep "fix round staged as a gate fix" "Fixes (gate)" "$C/run/cost.md"
expect_grep "screenshot measured" '"w":1280,"h":900' "$C/run/usage/01-page-builder.jsonl"
expect_grep "whole read of a big file" "run/plan/learning-plan.md (58 KB)" "$C/run/cost.md"
# transcripts cleaned up: usage stays and the report still builds
cp "$C/run/usage/01-page-builder.jsonl" "$TMP/u1.jsonl"; rm -rf "$CLAUDE_CONFIG_DIR/projects"
python3 "$SKILL/scripts/cost_report.py" "$C" > /dev/null 2>&1; expect_exit "report without transcripts" 0 $?
cmp -s "$TMP/u1.jsonl" "$C/run/usage/01-page-builder.jsonl" && ok "usage kept after cleanup" || bad "usage lost after cleanup"
expect_grep "report still has the numbers" "+ 1 continuation" "$C/run/cost.md"
# transcript format change: fail loudly, write nothing
python3 "$SKILL/tests/make_transcripts.py" "$C" "$CLAUDE_CONFIG_DIR" --break > /dev/null
cp "$C/run/cost.md" "$TMP/cost-before.md"
python3 "$SKILL/scripts/cost_report.py" "$C" > /dev/null 2> "$TMP/cbreak.txt"; expect_exit "format change exits 3" 3 $?
expect_grep "format change named" "unrecognized transcript format" "$TMP/cbreak.txt"
cmp -s "$TMP/cost-before.md" "$C/run/cost.md" && ok "report untouched on format change" || bad "report overwritten on format change"

echo
echo "passed $PASS, failed $FAILN"
[ "$FAILN" -eq 0 ]
