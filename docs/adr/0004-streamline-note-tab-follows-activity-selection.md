---
status: accepted
---

# Streamline's Note tab jumps to 'Note' on activity selection, gated on Demo Mode

Every other EHR background either renders its note fields (`StackedFields`) unconditionally or, in `PCEBg`'s case, simply defaults its internal tab state to `'Note'` on mount — none of them react live to activity selection. `StreamlineBg` is the only EHR that both gates note fields behind a tab and defaults away from it (`activeTab` starts at `'Service'`), so with Demo Mode on, selecting an activity never revealed the note fields the demo depends on (issue #60).

We considered simply defaulting `StreamlineBg`'s `activeTab` to `'Note'` on mount, matching `PCEBg`. Rejected — it wouldn't fix the case where a rep has already wandered to another tab and then selects a new activity; the tab would stay put, same as it does today.

We also considered driving the switch off `selectedNoteType` (`NoteTypeContext`), since it already changes on every activity selection. Rejected — the Note tab switching is really about the *event* "an activity was selected," not the *value* "which note type is active." Coupling to `selectedNoteType` conflates the two, even though it happens to fire at the right moments today.

Instead, `ClinicianScene` maintains a dedicated `activitySelectionSeq` counter, incremented in both `MySessionsPanel.onSelectSession` and `AddSummaryPanel.onSuggestionsReached`, and threads it into `EHRBackground` alongside `noteValues`/`onNoteChange`/`highlightedField`/`sidebarOpen` — the same way `sidebarOpen` already extends that prop set for shell-specific needs. Only `StreamlineBg` consumes it: a `useEffect` keyed on `activitySelectionSeq` forces `activeTab` to `'Note'` if `lockedDownMode` (Demo Mode) is on at that moment.

`lockedDownMode` is deliberately left out of that effect's dependency array (with an `eslint-disable-line`, matching existing precedent in `StackedFields`), so flipping Demo Mode on by itself never forces the jump — only a subsequent activity selection does. A reader who expects exhaustive-deps here should know this is intentional, not an oversight.

## Considered options

- **Default `activeTab` to `'Note'` on mount, matching `PCEBg`.** Rejected — doesn't handle re-selecting an activity after the rep has navigated away from the Note tab.
- **Watch `selectedNoteType` instead of a dedicated signal.** Rejected — semantically the wrong trigger; would work today but conflates "note type changed" with "activity selected."
- **Fire the jump unconditionally, regardless of Demo Mode.** Rejected — the issue frames this as a Demo Mode restriction, consistent with `CLIENT_LOCK_RULES` only forcing values when `lockedDownMode` is true elsewhere. Outside Demo Mode, Streamline keeps today's manual-click-only tab behavior.

## Consequences

- `StreamlineBg` is the only EHR background with a prop beyond `noteValues`/`onNoteChange`/`highlightedField`/`sidebarOpen`. A reader adding a new EHR shell should not assume `activitySelectionSeq` is part of the standard contract — it exists solely for Streamline's tab-gating shape.
- Toggling Demo Mode on mid-session, with a tab already parked away from Note, will not itself jump the tab — only the next activity selection does.
