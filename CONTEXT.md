# Context

Glossary of domain terms for sidebar-demo-apr-2026. This file is descriptive only — no implementation details.

## Mobile Mode

A full-screen phone-frame overlay (`MobileModeFrame`) that the demo can enter from the desktop Companion Sidebar. While active, `MobileModeContext.mobileMode` is `true` and the sidebar's own nav rail / floating chrome is bypassed entirely — only the current panel renders, inside the phone frame.

Distinct from **compact mode** (`compactMode = mobileMode || sidebarW < 380`), which is a narrower-width visual treatment that Mobile Mode always implies but that can also happen on desktop when the Companion Sidebar is resized below 380px.

## Mobile Activities List

The "My Activities" panel (`MySessionsPanel`) rendered while Mobile Mode is still active, inside the phone frame — as opposed to the same panel rendered as part of the desktop floating Companion Sidebar. It's the same component and content either way; what makes it "mobile" is that `mobileMode` stays `true` so it's wrapped in `MobileModeFrame` rather than the desktop sidebar shell. Reaching it should never call `exitMobileMode()` — that's reserved for the phone frame's explicit "X" exit button.

## Sidebar Minimized

The Companion Sidebar state where the full panel is closed and only the floating circular **Launcher Button** is visible on screen (`sidebarOpen` is `false`). Distinct from the panel being open at any size/position — there is no intermediate collapsed-but-visible state for the Companion Sidebar today. Inline EHR actions (the Enhance CTA and the LQA "check quality" bubble in `StackedFields`) are currently shown only while Sidebar Minimized, and hidden whenever the sidebar is open.

## Side

Whether the Launcher Button and the Companion Sidebar panel sit closer to the left or right edge of the viewport (`side` state in `EleosSidebar`, `xSide` in the button's intended-position tracking, per ADR-0001). The two are kept as one Side, synced whenever either changes: opening the panel re-derives its Side from the button's current Side (and snaps to full viewport height); any change to the panel's Side while it's open — drag, width-resize, or the ADR-0001 zoom-reconciliation — updates the button's tracked Side live, even while the button is hidden behind the open panel. Not tracked for vertical position — only horizontal edge.

## Demo Mode

The clinician-facing name for the `lockedDownMode` state (`LockedDownModeContext`), toggled by the button labeled "Demo Mode" (`LockedDownModeToggle`) and defaulting on. While active, `CLIENT_LOCK_RULES` (`src/data/lockedDownRules.js`) forces session type, setting, and note type to fixed values for the demo clients it lists, overriding whatever the clinician would otherwise pick. Referred to as "Demo toggle" in issue reports — same concept, not a separate one.

## CalMHSA SmartCare

The EHR background option (`EHR_BACKGROUNDS.calmhsa`, dropdown label "CalMHSA SmartCare") representing the SmartCare EHR chrome used by CalMHSA member counties. Visually identical today to the **Streamline** background (`EHR_BACKGROUNDS.streamline`), which represents the same underlying SmartCare product for other Streamline-branded clients — per ADR-0005, the two are separate components/assets so they can diverge independently as CalMHSA-specific chrome is designed. Not linked to CalMHSA's own note structures (`ehrSystem: "calmhsa-psych"` in `note-structures.json`, e.g. Patricia Rodriguez / Ashlyn Rivera) — EHR background selection stays fully manual via the EHR dropdown for every EHR, decoupled from Demo Mode client/note-type locking.

## Note Complete screen

The confirmation screen (`MobileNoteComplete`) shown after a suggestions review is sent to the EHR while in Mobile Mode. Offers "Go to Mobile Activities List" and "Enter New Summary." Used both by the new-summary flow (`AddSummaryPanel`) and, per this session's fix, by the session-select-from-activities flow.
