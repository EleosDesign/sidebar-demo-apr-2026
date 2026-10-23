---
name: add-smartcare-note
description: Add a new note type to the CalMHSA SmartCare and Streamline EHR backgrounds, matching a live SmartCare reference. Use when asked for a new note field/type selectable in the note-type dropdown, or to bring an existing note to visual parity with SmartCare.
---

Worked example: PR #125 (Group G/O Note). Read it with `gh pr diff 125` to see every touchpoint.

## 1. Branch

`git fetch origin && git switch main && git merge --ff-only origin/main && git switch -c <note-slug>`. Uncommitted user files carry across; never stage them.

## 2. Capture the reference

Use Playwright, not AppleScript (the Chrome/`screencapture` route photographed Slack when another window was on top). Never ask for credentials.

```bash
node scripts/capture-smartcare-pw.mjs <slug> smartcare "https://<tenant>.smartcarenet.com/<site>/Login.aspx"
TABS=AIMS,Diagnosis node scripts/capture-smartcare-pw.mjs <slug> smartcare "<url>"   # recapture only some tabs
```

- It opens a headed Chrome with a persistent profile (`~/.cache/smartcare-pw-profile`). Ask the user to log in and open the note on a **demo record**; the script waits up to 10 min for the tab strip. Sessions expire, so expect to ask again.
- Tab ids/selectors are hard-coded to the RadTabStrip in the script; adjust `TABS` and the strip selector for a new note.
- Writes `docs/note-references/<slug>/<Tab>.json` (labels, rects, fonts, colors, borders) plus `<Tab>-N.png` at 600px scroll steps, 1440x900.
- Pages load asynchronously. The script waits for network idle, the "Processing" overlay to clear, then 3 s; a blank-looking tab means it was captured too early, so recapture.
- **Open every PNG** before coding and confirm it is SmartCare (not another app or a login page), fully loaded, and not truncated (scroll height +0 on a long tab is suspect).
- **Conditional UI:** click each radio/checkbox that might reveal fields (e.g. "Yes" on an add-on question) and capture each state; the default state hides them. Ask the user for screenshots of states you cannot reach.
- Reference record values (diagnosis rows, allergies, "test" text) are test data; do not copy them into the build.
- Commit the JSON and script; do not commit PNGs you have not viewed (each is ~100 KB).

Done when every tab, scroll position and conditional state has a viewed screenshot and no section is known only from memory.

## 3. Confirm scope

Only ask what differs from these defaults (state them, let the user override):

- Separate note type; existing note unchanged; `ehrs: ["streamline","calmhsa"]`.
- Same layout in both EHRs, inside existing shell chrome; keep dynamic `clientName`.
- Structured controls (checkboxes, selects) are local and interactive, start empty; no backend/submit.
- Narrative copy comes from `src/data/` sources or the reference; never invent clinical text. Ask before reusing reference record values (e.g. goal text) as demo content.
- Add to EHR appends with a blank line and highlights; map each suggestion card to a field; no auto-added names.
- Note-type change resets values; EHR switch preserves them; no reload persistence.
- Whether any activity type auto-selects this note, and whether that beats a preserved Core Note. **Always ask this one.**

Use `ask_user_question`, up to four per round.

## 4. Implement

Touchpoints (all hit in PR #125):

- `src/data/note-structures.json`: note type with `ehrs`, sections, source `sampleContent`.
- `src/data/<note>.js`: structural content and EHR helper; no constants in `ClinicianScene.jsx`.
- `src/components/ehr/<Note>.jsx` + `.css`: shared by both EHRs; takes `noteValues`, `onNoteChange`, `highlightedField`. Keep structured state in `noteValues` so it survives EHR switches.
- `src/components/ehr/EhrBackgrounds.jsx`: render in both `StreamlineBg` and `CalmhsaBg` (title, `maxWidth`, body).
- `src/contexts/LockedDownModeContext.jsx` and `ClinicianScene.jsx`: activity auto-selection and Add to EHR routing. Keep existing session-specific suggestion datasets; change destinations only.
- Fonts used by the reference go in `index.html`.
- `CONTEXT.md`: add the note's term.

## 5. Verify

Done when all pass and nothing is claimed from code alone:

1. `npm run build`.
2. A Playwright spec (`e2e/<note>.spec.ts`, model on `e2e/group-go-note.spec.ts`) in **both** EHRs covering: option appears; blank initial state; controls interactive; narrative edit; reset on note-type change; state kept on EHR switch; Add to EHR against **real source cards** per destination, with highlight; no overflow with the sidebar open at 830/600/380/280px.
3. Parity: `node scripts/capture-smartcare-pw.mjs <slug>-ours ours Streamline` (same viewport; `TABS=` works too; the `ours` driver clicks Psychiatric Note, so adapt its note-type name). View the PNGs side by side with the reference and compare JSON rects/fonts/colors. Fix mismatches over ~2px or any font/color difference. Don't screenshot mid-HMR: re-capture if the layout looks stale.

Implementation pitfalls: define form primitives at module scope (using a context for `noteValues`), never as components inside the render function, or text inputs remount and lose focus on every keystroke. In the overflow test, skip elements inside intentionally scrollable table wrappers, and loop over every sub-tab, not just the first.

## 6. Ship

Stage only feature files. Commit, push, `gh pr create --base main` using the `pr` skill template (screenshots as Evidence).
