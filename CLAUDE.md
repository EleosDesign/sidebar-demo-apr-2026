# CLAUDE.md — Eleos Demo (sidebar-demo-apr-2026)

## What this repo is

A sales and design demo for the Eleos Health clinical documentation product. Three teams work here:
- **Design/PM** — own the component layer (UI, layout, interactions)
- **Sales** — own the content layer (suggestion data, session data, client configs, EHR content)
- **Dev** — own the infrastructure

The guiding mental model: **the new demo is the skin; the old demo is the content, feature flags, and flow.**
When porting features, always source content and behavior from the old demo rather than inventing it.

## Old demo (source of truth for content)

`/Users/tim/Documents/Coding/Eleos Platform Demo/src/`

When you need the actual text, logic, or behavior for a feature — go here first. Do not guess or generate content. Key files:
- `components/MobileFinishNoteWrapper.tsx` — Larry Quinn's suggestion data + DAP format (lines 44–56)
- `components/UserMenu.tsx` — avatar dropdown with all 6 menu items
- `components/EhrNoteHeadersContext.tsx` — boolean toggle context
- `imports/SessionSelections.tsx` — client → session type / note type locking logic
- `components/companion/LQAReview.tsx` — LQA scoring logic
- `components/useTextShortcut.ts` — `::` keyboard shortcut (inserts preset text)
- `components/FeedbackOverlay.tsx` — feedback popup (star rating + chips)
- `components/StreamlineEhrScreen.tsx` — EHR list and routing
- `components/SmartscribeEhrScreen.tsx` — Smartscribe white-label EHR

## Stack

- React 19 + Vite 6 (not Next.js)
- React Router v7
- JavaScript/JSX throughout (not TypeScript, despite some `.ts` files in data/)
- No lucide-react, no icon library — use inline SVGs
- Images go in `/public/`; reference as `/filename.png`

## Dev commands

```bash
npm run dev      # http://localhost:5173 (or next available port)
npm run build    # production build — run this to verify before opening a PR
```

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, demo-ready. All teams. Default target for PRs. |
| `sales-demo` | Sales-specific guardrails only: client auto-selection, locked note type paths. Do NOT add this to main — it restricts designer/dev exploration. |
| `feat/*` | Feature work. Branch from `main` unless the work depends on an unmerged feature branch (stacked PR). |

**Never put sales-specific locking behavior on `main`.** The `sales-demo` branch is where client→note type auto-selection and EHR page auto-fill live.

## Content ownership — do not mix

| Path | Owner | Rule |
|------|-------|------|
| `src/data/` | Sales team | Suggestion content, session data, client lists, note defaults |
| `src/components/` | Design team | UI components, layouts, interactions |
| `src/contexts/` | Shared | Context providers — discuss with design before changing |
| `public/` | Shared | Static assets (logos, images) |
| `src/pages/Clinician/ClinicianScene.jsx` | Shared | Import from `src/data/` — don't define content inline |

The `src/data/` extraction is on branch `feat/content-layer-extraction` (PR #9). Once merged, all suggestion/session content lives in those files — that's the pattern to follow.

## Key files

- `src/pages/Clinician/ClinicianScene.jsx` — 6,000+ line main orchestrator; contains 35+ inline sub-components. Do not add content constants inline here — import from `src/data/`.
- `src/components/ehr/EhrBackgrounds.jsx` — all 16 EHR background renderings. Each exports a `*Bg` function.
- `src/components/ui/LQAReview.jsx` — LQA widget (3 states: idle/progress/results). Scoring is currently hardcoded.
- `src/components/ui/UserMenu.jsx` — avatar dropdown (on `feat/avatar-dropdown-and-ehr-note-headers`, PR #10)
- `src/contexts/EhrContext.jsx` — `selectedEhr`, `clientName`
- `src/contexts/NoteTypeContext.jsx` — reads `note-structures.json`, drives EHR field sections
- `src/contexts/EhrNoteHeadersContext.jsx` — boolean toggle for DAP vs Key Moments format (on PR #10)
- `public/` — static assets (logos, PNGs)

## Client → feature mapping (naming convention)

Client initials match the feature they demo:
- **Larry Quinn (L.Q.)** → Live Quality Assist (LQA) demo
- **Trisha Platts (T.P.)** → Treatment Plan demo

## Client → session type locking (sales-demo branch)

These clients have locked session/note type paths in the old demo. Port to `sales-demo` branch only:

| Client | Session Type | Note Type |
|--------|-------------|-----------|
| Larry Quinn | Individual Therapy | Progress Note |
| Jacob Rosen | Individual Therapy | Progress Note |
| Trisha Platts | Individual Therapy | Treatment Plan |
| Patricia Rodriguez | Medication Management | Psych/Medical Note |
| Ashlyn Rivera | Assessment (Intake) | CalAIM Assessment |
| Calvin Murphy | Individual Therapy | SOAP |
| Anger Mgmt / SUD Group | Group Session | Group Note |

## Suggestion card formats

Two formats, controlled by the **"Use My EHR Note Headers"** toggle in the avatar dropdown:

- **OFF (default):** Key Moments / Interventions / Assessment / Plan sections
- **ON:** Data / Assessment / Plan (DAP) — one card per section, full narrative text

Currently wired only for Larry Quinn. Trisha Platts is **not eligible** for the toggle.

## Open PRs (as of June 2026)

| PR | Branch | Target | Status |
|----|--------|--------|--------|
| #9 | `feat/content-layer-extraction` | `main` | Open — must merge before #10 |
| #10 | `feat/avatar-dropdown-and-ehr-note-headers` | `feat/content-layer-extraction` | Open — depends on #9 |
| #11 | `feat/foothold-ehr-background` | `main` | Open — independent |

When PR #9 merges, change PR #10's base to `main`.

## EHR backgrounds

All 16 EHRs are implemented in `EhrBackgrounds.jsx`. Pattern for updating:
- Header + sidebar = chrome layer (visual only, no logic)
- `StackedFields` component = note entry area (do not remove or restructure)
- `StackedFields` props: `noteValues`, `onNoteChange`, `highlightedField`, plus style overrides (`labelColor`, `fontSize`, `borderColor`, `minHeight`, `borderRadius`)
- Reference source designs from `/Users/tim/Documents/Projects/progress-note-clone/` or similar project directories when updating EHR chrome

## What NOT to do

- **Don't invent suggestion content.** Always source from the old demo's `MobileFinishNoteWrapper.tsx`, `AddSummaryPanel.tsx`, or `data/suggestions.ts`.
- **Don't put client locking on `main`.** That's `sales-demo` only.
- **Don't edit `ClinicianScene.jsx` to add data constants inline.** Import from `src/data/`.
- **Don't skip `npm run build` before opening a PR.** The chunk size warning is pre-existing and expected; actual errors are not.
- **Don't use lucide-react or other icon libraries** — they aren't installed and npm installs fail due to proxy config. Use inline SVGs.
