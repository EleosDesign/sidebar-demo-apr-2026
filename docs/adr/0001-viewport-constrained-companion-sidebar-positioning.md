---
status: accepted
---

# Viewport-constrained positioning for the Companion Sidebar and Launcher Button

## Context

The Launcher Button currently defaults to the bottom-left corner, and the Companion Sidebar currently defaults to a 70%-of-viewport-height floating box near wherever the button was. Neither element reacts to the browser window being resized or zoomed after it's placed — there's no resize listener at all today, so a Companion Sidebar (or Launcher Button) positioned near an edge can end up partially or fully off-screen once the window shrinks or the page is zoomed in.

We want the Launcher Button to default to the bottom-right corner and the Companion Sidebar to default to full viewport height anchored to the right edge — but only for a Fresh Session, so we don't clobber positions users already dragged and saved. We also want a standing guarantee that neither element is ever obscured or clipped by a window resize or browser zoom change, for all sessions, not just fresh ones.

## Decision

Introduce two decoupled concepts for both the Companion Sidebar and the Launcher Button: **Intended Size/Position** (what the user wants — the Fresh Session default, or their last deliberate drag/resize) and **Rendered Size/Position** (what's actually on screen). On every window resize or browser zoom change, recompute the Rendered Size/Position from the Intended Size/Position: render at the intended value if the viewport has room; otherwise shrink width/height (respecting the existing 320–600px width clamp) and/or reposition so the whole element stays fully visible. When the viewport gains room again, the rendered value grows back toward the intended value, up to what now fits.

The Companion Sidebar remains exactly as free-floating, draggable, and resizable on all edges as it is today — this decision does not turn it into a pinned/docked panel, despite the new default looking like one (full height, flush to the right edge).

## Considered Options

- **Force all existing sessions to the new bottom-right/full-height default.** Rejected — would silently discard positions users already dragged and saved to `eleos-sidebar-state`.
- **Live-resize both width and height proportionally on every viewport change.** Rejected — width already has an explicit user-driven drag-resize affordance with a fixed 320–600px range; continuously rescaling it as a percentage would fight the user's own resizing and add complexity beyond what "never obscured" requires.
- **Convert the Companion Sidebar into a true pinned/docked panel** (fixed to the right edge, width-only resize, no longer draggable). Rejected — bigger scope than requested, and removes drag-anywhere behavior clinicians already rely on.
- **Reposition-only clamping, never shrink.** Rejected — cannot guarantee full visibility in all cases; if the Intended Size structurally exceeds the new viewport, repositioning alone still leaves part of the element clipped.
- **Freeze at the shrunk size permanently instead of growing back.** Rejected — would feel like the sidebar randomly and permanently got smaller after a transient window/zoom change.

## Consequences

- Both `CompanionLaunchButton` and `EleosSidebar` need a shared resize/zoom-reconciliation mechanism (a `resize` listener plus fit/grow-back logic), rather than the current one-time-at-mount positioning.
- The existing 320–600px width clamp and the full-height default become inputs to the fit/grow-back calculation, not just static bounds checked during drag.
