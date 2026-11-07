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
