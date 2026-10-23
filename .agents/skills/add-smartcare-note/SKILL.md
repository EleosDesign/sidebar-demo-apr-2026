---
name: add-smartcare-note
description: Add a new note type to the CalMHSA SmartCare and Streamline EHR backgrounds, matching a live SmartCare reference. Use when asked for a new note field/type selectable in the note-type dropdown, or to bring an existing note to visual parity with SmartCare.
---

Worked example: PR #125 (Group G/O Note). Read it with `gh pr diff 125` to see every touchpoint.

## 1. Branch

`git fetch origin && git switch main && git merge --ff-only origin/main && git switch -c <note-slug>`. Uncommitted user files carry across; never stage them.

## 2. Capture the reference

Ask the user to open the note on a **demo record** in their logged-in Chrome with *View → Developer → Allow JavaScript from Apple Events* on (it resets when Chrome restarts). Never open a second browser or ask for credentials.

```bash
scripts/capture-smartcare-note.sh <slug> <tab-element-id> ...   # e.g. ServiceNoteTabPage_T1
```

Writes `docs/note-references/<slug>/<tab>.json` (labels, control options, rects, fonts, colors, borders) and scrolled screenshots. Find tab ids with a one-off `execute javascript` over `[id$=TabPage_T0]`-style cells if unknown. Read the screenshots and JSON before writing any code. Done when every tab and scroll position of the note has a screenshot and no section is known only from memory.

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
3. Parity: `SC_URL_MATCH=localhost:5173 scripts/capture-smartcare-note.sh <slug>-ours`, then compare screenshots and JSON rects/fonts/colors against the reference capture. Fix mismatches over ~2px or any font/color difference.

## 6. Ship

Stage only feature files. Commit, push, `gh pr create --base main` using the `pr` skill template (screenshots as Evidence).
