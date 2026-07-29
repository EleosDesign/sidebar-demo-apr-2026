# Sidebar Demo

Demo app for Eleos's clinician-facing companion experience. This context covers the floating AI companion sidebar and its launcher.

## Language

**Companion Sidebar**:
The floating, draggable, resizable AI assistant panel (`EleosSidebar` in `src/pages/Clinician/ClinicianScene.jsx`), opened via the Launcher Button. This is what "the sidebar" means in any documentation about positioning, sizing, or resize/zoom behavior.
_Avoid_: sidebar (bare word), Eleos sidebar — and don't confuse with `src/components/Sidebar/Sidebar.tsx`, an unrelated, currently-unused static nav component that happens to share the name.

**Launcher Button**:
The floating, draggable icon (`CompanionLaunchButton`) shown when the Companion Sidebar is closed. Clicking it opens the Companion Sidebar.
_Avoid_: toggle button, floating button

**Side**:
`'left' | 'right'` — derived from which half of the viewport the Companion Sidebar's center currently sits in. Drives which direction internal panels, shadows, and the overflow menu flip.
_Avoid_: anchor, corner

**Fresh Session**:
A browser session with no `eleos-sidebar-state` entry in localStorage yet — first-time use, or storage was cleared. Fresh sessions receive the current default Launcher Button corner and Companion Sidebar size/position; any other session restores its previously saved values instead.
_Avoid_: new user, first load

**Intended Size/Position**:
The size and position the Companion Sidebar or Launcher Button would occupy if the viewport imposed no constraint: either the Fresh Session default, or whatever the user last deliberately dragged or resized it to. Tracked independently of what's currently drawn on screen.
_Avoid_: desired size, target size, saved size

**Rendered Size/Position**:
What is actually drawn on screen right now for the Companion Sidebar or Launcher Button. Equal to the Intended Size/Position whenever the viewport has room for it; shrunk and/or repositioned to stay fully visible when the viewport (window resize or browser zoom) doesn't have room.
_Avoid_: current size, actual size, applied size
