#!/usr/bin/env bash
# Capture a SmartCare note from your logged-in Chrome tab (read-only) into docs/note-references/<slug>/.
# Usage: scripts/capture-smartcare-note.sh <slug> [tab-element-id ...]
#   Each tab-element-id (e.g. ServiceNoteTabPage_T1) is clicked, then captured as <id>.json + screenshots.
# Needs: Chrome > View > Developer > Allow JavaScript from Apple Events. Use a demo record only (no PII).
set -euo pipefail
slug=${1:?usage: $0 <slug> [tab-element-id ...]}; shift || true
here=$(cd "$(dirname "$0")" && pwd); out="$here/../docs/note-references/$slug"; mkdir -p "$out"
# SC_URL_MATCH overrides the tab to read, e.g. localhost:5173 to capture our own build for parity checks
export SC_URL_MATCH=${SC_URL_MATCH:-smartcarenet.com}
extract=$(cat "$here/smartcare-extract.js")

# Run JS in the SmartCare tab (brings it to the front). Prints the JS result.
run_js() {
osascript - "$1" <<'APPLESCRIPT'
on run argv
  tell application "Google Chrome"
    repeat with w in windows
      repeat with i from 1 to count of tabs of w
        if URL of tab i of w contains (system attribute "SC_URL_MATCH") then
          set active tab index of w to i
          set index of w to 1
          return execute tab i of w javascript (item 1 of argv)
        end if
      end repeat
    end repeat
  end tell
  error "No SmartCare tab found in Chrome"
end run
APPLESCRIPT
}

# Capture Chrome's front window by window id (not a screen region), so another app on top can't end up in the shot.
# Fails loudly if the front Chrome tab is not the page we mean to capture.
shot() {
  local info url wid
  info=$(osascript -e 'tell application "Google Chrome"' -e 'activate' -e 'return (URL of active tab of front window) & "|" & (id of front window)' -e 'end tell')
  url=${info%|*}; wid=${info##*|}
  case "$url" in *"$SC_URL_MATCH"*) ;; *) echo "ABORT: front Chrome tab is '$url', expected URL containing '$SC_URL_MATCH'" >&2; exit 1;; esac
  sleep 0.3
  screencapture -x -o -l"$wid" "$1"
  [ -s "$1" ] || { echo "ABORT: empty screenshot $1" >&2; exit 1; }
}

capture() { # name
  local name=$1 json sid n=0 max
  json=$(run_js "$extract"); echo "$json" > "$out/$name.json"
  sid=$(python3 -c 'import json,sys;print(json.load(sys.stdin)["scrollerId"] or "")' <<<"$json")
  run_js "(()=>{let e=document.getElementById('$sid');if(e)e.scrollTop=0})()" >/dev/null; sleep 0.5
  shot "$out/$name-0.png"
  if [ -n "$sid" ]; then
    max=$(run_js "(()=>{let e=document.getElementById('$sid');return e.scrollHeight-e.clientHeight})()")
    while [ "$((n*400))" -lt "${max%.*}" ] && [ $n -lt 15 ]; do
      n=$((n+1)); run_js "document.getElementById('$sid').scrollTop=$((n*400))" >/dev/null; sleep 0.5; shot "$out/$name-$n.png"
    done
    run_js "document.getElementById('$sid').scrollTop=0" >/dev/null
  fi
  echo "captured $name ($((n+1)) screenshot(s))"
}

if [ $# -eq 0 ]; then capture current; else
  for tab in "$@"; do
    run_js "(()=>{let el=document.getElementById('$tab') || [...document.querySelectorAll('a.rtsLink, .dxtcTab, [id*=\"Tab\"]')].find(e=>e.innerText.trim()==='$tab'||e.id==='$tab'); if(el) el.click();})()" >/dev/null
    sleep 2
    safe_tab=$(echo "$tab" | tr ' /' '_')
    capture "$safe_tab"
  done
fi
echo "-> $out"
