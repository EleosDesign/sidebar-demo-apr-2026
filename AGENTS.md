# Repository Guide

## Current App

- Trust executable config over prose: `README.md` describes management reports, but `src/App.tsx` currently routes only `/clinician` (with all other paths redirected there). Report, user, site, and workflow pages remain in `src/pages/` but are not wired into the app.
- The runtime is React 19 + Vite 6 + React Router 7. The tree intentionally mixes TypeScript/TSX and unchecked JavaScript/JSX (`allowJs: true`, `checkJs: false`).
- `src/pages/Clinician/ClinicianScene.jsx` is the 6,000+ line orchestrator. `ClinicianPage.jsx` supplies the EHR, note-type, note-header, and locked-down-mode providers.
- `src/components/ehr/EhrBackgrounds.jsx` owns the shared note fields and the EHR registry. Preserve `noteValues`, `onNoteChange`, and `highlightedField` plumbing when changing an EHR shell.
- `src/contexts/NoteTypeContext.jsx` derives fields and suggestion mappings from `src/data/note-structures.json`; changing note types resets field values.
- EHR inline actions communicate with `ClinicianScene` through the `eleos:openSidebar` and `eleos:openQuality` window events.

## Commands

```bash
npm ci
npm run dev        # fixed port 5173; Vite may choose another if occupied
npm run build      # production verification
npm run typecheck  # tsc -b; currently fails on legacy/unrouted TS files and missing CSS module declarations
```

- There are no root lint or test scripts. Do not invent a focused-test command.
- `npm run build` currently succeeds with a pre-existing chunk-size warning; Vite does not run TypeScript checking.

## Content And Branch Boundaries

- Treat the new app as the UI skin. Source feature copy, demo data, and behavior from `/Users/tim/Documents/Coding/Eleos Platform Demo/src/`; do not generate clinical suggestion content.
- Keep content/config in `src/data/`, UI and interactions in `src/components/`, and shared state in `src/contexts/`. Do not add content constants to `ClinicianScene.jsx`.
- `src/data/lockedDownRules.js` is the executable source for client lock behavior. Locked-down mode defaults on in `LockedDownModeContext.jsx`.
- Sales-only client auto-selection, note-type locking, and EHR auto-fill belong on `sales-demo`, not `main`. Default feature branches start from `main` unless intentionally stacked.
- Static images belong in `public/` and are referenced as `/filename.png`. No icon library is installed; use the existing inline-SVG pattern rather than adding one.

## EHR Work

- View reference assets under `/Users/tim/Documents/Coding/Eleos Platform Demo/src/assets/` before rebuilding an EHR. Hand-code the chrome; never use a full screenshot as a background because it can embed browser UI or PII.
- Keep EHR navigation visual-only and preserve dynamic `clientName` from `useEhrContext()`; do not replace it with hardcoded names in completion/back handlers.
- For sidebar responsiveness, preserve the documented 320-600 px range and `compactMode = sidebarW < 380`; see `docs/sidebar-responsive-guidelines.md` for the verified propagation rules and manual checks.

## Repository Navigation

- If `graphify-out/graph.json` exists, start codebase questions with `graphify query "<question>"`; use `graphify path` or `graphify explain` for narrower relationships. Run `graphify update .` after code changes.
- `docs/guidelines/` is a nested example/template project with its own manifest and config, not root tooling.
