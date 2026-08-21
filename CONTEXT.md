# Context

Glossary of domain terms for sidebar-demo-apr-2026. This file is descriptive only — no implementation details.

## Mobile Mode

A full-screen phone-frame overlay (`MobileModeFrame`) that the demo can enter from the desktop Companion Sidebar. While active, `MobileModeContext.mobileMode` is `true` and the sidebar's own nav rail / floating chrome is bypassed entirely — only the current panel renders, inside the phone frame.

Every entry into Mobile Mode lands on the Mobile Activities List rather than resuming a previously open mobile flow.

Distinct from **compact mode** (`compactMode = mobileMode || sidebarW < 380`), which is a narrower-width visual treatment that Mobile Mode always implies but that can also happen on desktop when the Companion Sidebar is resized below 380px.

## Mobile Activities List

The Activity list rendered while Mobile Mode is still active, inside the phone frame. It uses the mobile labels **My Captured Activities**, **For Review**, and **Completed**, while showing the same underlying Activities and statuses as the desktop Companion Sidebar without applying a mobile-only date cutoff. The mobile presentation retains the prototype's two-week footer. Reaching the list should never exit Mobile Mode; that is reserved for the phone frame's explicit exit control.

## Activity Capture Methods

The three ways to create a new Activity: **Live Session** records the session as it happens, **Voice Summary** records a spoken account after the activity, and **Text Summary** accepts a written account after the activity. Opening a Voice Summary confirmation suspends capture; resuming continues the same recording. Cancelling discards the current recording but retains the Activity details and returns Voice Summary to its initial capture state.

## Activity Completion

An actively recording Live Session is not yet an Activity list item. Finishing the Live Session creates the reviewable Activity and completes its audio capture, but does not complete the resulting Activity. The Activity remains in **Add to EHR** (called **For Review** in Mobile Mode) until the clinician explicitly submits it or marks it as done; only then does it move to **Marked as Done** (called **Completed** in Mobile Mode).

## Mobile Check-In Questions

The six follow-up questions presented after a mobile Voice Summary and before suggestions are generated. Confirming that a Voice Summary is done proceeds to these questions rather than generating suggestions immediately.

## Live Session Readiness Reminder

The guidance shown immediately before a Live Session begins. A clinician may suppress it for later Live Sessions in the same demo run; the preference resets when the page reloads.

## Mobile Live Session

A Live Session created in Mobile Mode belongs to one Client, never a Group. Client, session type, setting, note type, and audio input are all required before capture can begin. Client-specific defaults follow the same rules as desktop Live Session capture, while mobile audio input defaults to iPhone Microphone. Once capture is active, **End Session** is the only in-flow exit. Voice Summary and Text Summary continue to allow either a Client or a Group.

## Sidebar Minimized

The Companion Sidebar state where the full panel is closed and only the floating circular **Launcher Button** is visible on screen (`sidebarOpen` is `false`). Distinct from the panel being open at any size/position — there is no intermediate collapsed-but-visible state for the Companion Sidebar today. Inline EHR actions (the Enhance CTA and the LQA "check quality" bubble in `StackedFields`) are currently shown only while Sidebar Minimized, and hidden whenever the sidebar is open.

## Side

Whether the Launcher Button and the Companion Sidebar panel sit closer to the left or right edge of the viewport (`side` state in `EleosSidebar`, `xSide` in the button's intended-position tracking, per ADR-0001). The two are kept as one Side, synced whenever either changes: opening the panel re-derives its Side from the button's current Side (and snaps to full viewport height); any change to the panel's Side while it's open — drag, width-resize, or the ADR-0001 zoom-reconciliation — updates the button's tracked Side live, even while the button is hidden behind the open panel. Not tracked for vertical position — only horizontal edge.

## Demo Mode

The clinician-facing name for the `lockedDownMode` state (`LockedDownModeContext`), toggled by the button labeled "Demo Mode" (`LockedDownModeToggle`) and defaulting on. While active, `CLIENT_LOCK_RULES` (`src/data/lockedDownRules.js`) forces session type, setting, and note type to fixed values for the demo clients it lists, overriding whatever the clinician would otherwise pick. Referred to as "Demo toggle" in issue reports — same concept, not a separate one.

## CalMHSA SmartCare

The EHR background option (`EHR_BACKGROUNDS.calmhsa`, dropdown label "CalMHSA SmartCare") representing the SmartCare EHR chrome used by CalMHSA member counties. Visually identical today to the **Streamline** background (`EHR_BACKGROUNDS.streamline`), which represents the same underlying SmartCare product for other Streamline-branded clients — per ADR-0005, the two are separate components/assets so they can diverge independently as CalMHSA-specific chrome is designed. Not linked to CalMHSA's own note structures (`ehrSystem: "calmhsa-psych"` in `note-structures.json`, e.g. Patricia Rodriguez / Ashlyn Rivera) — EHR background selection stays fully manual via the EHR dropdown for every EHR, decoupled from Demo Mode client/note-type locking.

## CalMHSA Progress Note

A clinical note format used in CalMHSA SmartCare. **Problem Details**, **Problem List**, and **Problems Addressed During This Session** establish the clinical context; **Information** and **Care Plan** are the two editable narrative sections populated from documentation suggestions.

## SmartScribe skin

The alternate navy visual state for Eleos-branded chrome, active whenever `useEhrContext().selectedEhr` is `'streamline'` or `'calmhsa'` (per ADR-0006, both trigger it — they render the same underlying SmartCare product per the **CalMHSA SmartCare** entry above). Recolors every literal occurrence of the app's two Eleos-brand colors to the Streamline navy (`#254A67`): Eleos-navy (`#293D87`) and, per ADR-0008, Eleos primary-blue (`#2d4ccd`) — both as hex and as their `rgba(r,g,b,alpha)` form (shadow/glow tints). This covers the Companion Sidebar's nav rail background, active-icon color, and launcher circle/pill/mark (ADR-0006); the EHR-overlay "Enhance" CTA family — `EnhanceTooltip`, `InlineLaunchButton`, `EnhancePointer`, `EnhanceInlineButton` — that floats on top of any EHR background (ADR-0007); and, since ADR-0008, every sidebar panel that uses either literal color, including `MySessionsPanel`'s "Marked as Done" strip and CTA buttons like "Next"/"Capture Session"/"Select session" that were previously excluded for being `#2d4ccd` rather than `#293D87`. Scoped strictly by color literal, not by feature, panel, or "is this a CTA": a panel or accent with neither brand-color literal in it is untouched (grays, semantic status colors, the EHR-strip teal `#01579B`, etc. stay as-is). Purely an internal name for this visual concept — it implies no visible copy change, and no panel's layout or copy changes, only which of its existing colors get swapped. Not to be confused with the "SMARTscribe™ Powered by Eleos Health" splash/loader branding that appears elsewhere in the Streamline-SmartCare Figma file, which is an unrelated loading-screen feature, not this skin.

## Note Complete screen

The confirmation screen (`MobileNoteComplete`) shown after a suggestions review is sent to the EHR while in Mobile Mode. Offers "Go to Mobile Activities List" and "Enter New Summary." Used both by the new-summary flow (`AddSummaryPanel`) and, per this session's fix, by the session-select-from-activities flow.
