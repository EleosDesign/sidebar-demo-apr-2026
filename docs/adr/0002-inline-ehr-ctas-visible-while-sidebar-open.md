---
status: accepted
---

# Enhance and LQA inline CTAs stay visible while the Companion Sidebar is open

## Context

Since commit `928beba` ("hide inline CTAs when sidebar is open"), the Enhance CTA, the LQA CTA, and the InlineLaunchButton in `StackedFields` (`src/components/ehr/EhrBackgrounds.jsx`) have all been gated by a single `!sidebarOpen` check — the whole action strip disappears the moment the Companion Sidebar is open, and only reappears when the sidebar returns to Sidebar Minimized (see glossary).

That blanket gate turned out to be too broad. The LQA CTA has a working equivalent while the sidebar is open — the Quality nav-rail tab, reachable manually and driven by the same `eleos:openQuality` event the bubble dispatches. The Enhance CTA has no such equivalent: the only other surface that used to offer it, `EnhancePointerToolbarWrapper`, was removed (see comment at `ClinicianScene.jsx` ~L199) specifically because it visually collided with these same inline CTAs — it was never replaced with an open-sidebar-compatible affordance. Practically, this meant Enhance was unreachable for the entire time a clinician had the sidebar open, which is likely most of a session.

## Decision

The Enhance CTA, its result tooltip (`EnhanceTooltip`), and the LQA CTA no longer depend on `sidebarOpen` at all — they show or hide purely from their existing per-field conditions (Enhance: any focused field with text; LQA: the last field only, once it has text). `InlineLaunchButton` keeps the original `!sidebarOpen` gate, since its only purpose is opening the sidebar and it would be meaningless once the sidebar is already open.

Because the Companion Sidebar renders at `zIndex: 10` and can be dragged/resized to overlap the EHR note area (default: full height, anchored right — see ADR 0001), the action strip and tooltip are given a z-index above the sidebar's. This guarantees they're never rendered underneath an overlapping sidebar, which is the same visual-collision failure mode that got `EnhancePointerToolbarWrapper` removed in the first place.

## Considered Options

- **Leave the blanket `!sidebarOpen` gate on all three elements (status quo).** Rejected — it makes Enhance unusable for as long as the sidebar is open, with no alternative surface.
- **Remove the gate from all three, including InlineLaunchButton.** Rejected — showing "Open Eleos" while the sidebar is already open has no purpose and would just be visual noise.
- **Show the Enhance CTA but suppress its result tooltip while the sidebar is open.** Rejected — leaves Enhance half-working: clickable, but with no visible outcome until the sidebar closes.
- **Accept the z-index collision risk rather than resolve it.** Rejected — this is the same failure mode that was already hit once (`EnhancePointerToolbarWrapper` vs. the sidebar), and un-hiding these CTAs while the sidebar is open makes the overlap scenario common rather than rare.

## Consequences

- LQA's CTA and the Quality nav tab are now two entry points to the same flow whenever the sidebar is open; this redundancy is accepted as a convenience, not treated as a bug.
- Any future change to the Companion Sidebar's z-index (currently 10) or to the action strip's z-index needs to preserve the "strip renders above the sidebar" ordering, or this collision resurfaces.
