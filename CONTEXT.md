# Sidebar Demo (Clinician App)

Demo app simulating Eleos's clinician documentation product: an EHR-adjacent sidebar that captures session content and turns it into notes.

## Language

**Clinical Session Type**: the visit category for a session — e.g. "Individual Therapy", "Case Management", "BPS Assessment", "Medication Management". Comes from `CLIENT_LOCK_RULES` per client in locked-down mode. _Avoid_: "session type" alone — ambiguous with Capture Modality below, which uses the same field name (`sessionType`) in a different file for a different concept.

**Capture Modality**: how a session's content was captured — `text` or `audio`. Stored as the `sessionType` field on entries in `SESSION_LIST` (`src/data/sessions.js`), which collides in name (not meaning) with Clinical Session Type above. _Avoid_: "session type" alone.

**Mobile Mode**: the full-screen mobile-session-capture experience, reached via the sidebar user-menu "Mobile" item. Replaces the desktop clinician chrome entirely (not an embedded panel) while active; distinct from the EHR/desktop view. Implemented by restyling the existing Add Summary Flow (below) into a full-screen shell, not by porting new screens from the prior Figma-exported prototype — that prototype (see `/Users/tim/Documents/Coding/Eleos Platform Demo/src/APP_DOCUMENTATION.md`) is a visual/behavioral reference only.

**Add Summary Flow**: the existing capture pipeline in `AddSummaryPanel` (`ClinicianScene.jsx`) — client/activity auto-select (in locked-down mode) → voice-or-text choice → capture (bullet-autofill for text, recording sim for voice) → `SuggestionsPanel` review → add to EHR. Today it renders inside the desktop sidebar's "Add Summary" nav tab. Mobile Mode reuses this same phase machine full-screen rather than duplicating it. _Avoid_ confusing this with the reference prototype's own distinct 16-screen flow — they overlap conceptually but are different codebases.
