---
status: accepted
---

# Launcher Button and Companion Sidebar always share one Side

Before this decision, the Launcher Button and the Companion Sidebar panel tracked left/right Side independently: the button's current Side only fed the panel's opening position on a brand-new session (no `eleos-sidebar-state` saved yet), and never again after that. Once a user had used the app once, dragging the Launcher Button to the opposite side from where the panel last sat produced a button that opened to a panel on the far side of the screen (issue #55). We decided the two always represent one Side, synced at both points where they interact: opening the panel re-derives its Side (and resets to full viewport height) from the button's current Side regardless of any saved state, and any change to the panel's Side while it's open — drag, width-resize, or the ADR-0001 zoom-reconciliation — immediately updates the button's tracked Side live, even while the button itself is hidden behind the open panel.

## Considered options

- **Only sync at the close/open transitions, not live during a drag.** Rejected — would leave the button's tracked Side stale, and cause it to visibly jump on next open if the panel is dragged and later closed without the user watching the button (it's hidden behind the panel the whole time).
- **Reset everything to defaults on open** — including `sidebarW` back to 467px and removing height-resize/vertical drag, so the whole panel snaps to one canonical shape every time. Rejected — a user who's deliberately widened the panel or resized its height mid-session shouldn't lose that; only the Side/edge and the full-height snap the icon promises should be forced fresh.
- **Leave the two decoupled and only harden the initial-session case.** Rejected — doesn't fix the reported bug for anyone who's already used the sidebar once, which is everyone after their first close (`eleos-sidebar-state` is written then).

## Consequences

- `side`, `posY`, and `sidebarH` are no longer written to `eleos-sidebar-state` — `sidebarW`, `navTab`, and other genuinely sticky fields still are. A reader who notices `sidebarW` persists but `sidebarH` doesn't should look here rather than assume it's an oversight.
- `EleosSidebar` needs a way to notify `ClinicianScene` of Side changes as they happen (not just at close), mirroring the `onPosChange` callback the Launcher Button already exposes for its own drags.
