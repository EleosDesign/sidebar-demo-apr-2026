# Context

Glossary of domain terms for sidebar-demo-apr-2026. This file is descriptive only — no implementation details.

## Mobile Mode

A full-screen phone-frame overlay (`MobileModeFrame`) that the demo can enter from the desktop Companion Sidebar. While active, `MobileModeContext.mobileMode` is `true` and the sidebar's own nav rail / floating chrome is bypassed entirely — only the current panel renders, inside the phone frame.

Distinct from **compact mode** (`compactMode = mobileMode || sidebarW < 380`), which is a narrower-width visual treatment that Mobile Mode always implies but that can also happen on desktop when the Companion Sidebar is resized below 380px.

## Mobile Activities List

The "My Activities" panel (`MySessionsPanel`) rendered while Mobile Mode is still active, inside the phone frame — as opposed to the same panel rendered as part of the desktop floating Companion Sidebar. It's the same component and content either way; what makes it "mobile" is that `mobileMode` stays `true` so it's wrapped in `MobileModeFrame` rather than the desktop sidebar shell. Reaching it should never call `exitMobileMode()` — that's reserved for the phone frame's explicit "X" exit button.

## Sidebar Minimized

The Companion Sidebar state where the full panel is closed and only the floating circular **Launcher Button** is visible on screen (`sidebarOpen` is `false`). Distinct from the panel being open at any size/position — there is no intermediate collapsed-but-visible state for the Companion Sidebar today. Inline EHR actions (the Enhance CTA and the LQA "check quality" bubble in `StackedFields`) are currently shown only while Sidebar Minimized, and hidden whenever the sidebar is open.

## Note Complete screen

The confirmation screen (`MobileNoteComplete`) shown after a suggestions review is sent to the EHR while in Mobile Mode. Offers "Go to Mobile Activities List" and "Enter New Summary." Used both by the new-summary flow (`AddSummaryPanel`) and, per this session's fix, by the session-select-from-activities flow.
