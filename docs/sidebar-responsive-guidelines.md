# Sidebar Responsive Guidelines

## Overview

The sidebar is horizontally resizable between **320 px** and **600 px**. As clinicians narrow it to expose EHR content behind it, a single `compactMode` boolean drives all density and layout changes — typography tightens, padding shrinks, labels hide, and certain layouts switch to a more vertical arrangement. Nothing clips or overflows.

---

## Sidebar Dimensions

| Property | Value |
|---|---|
| Minimum width | 320 px |
| Maximum width | 600 px |
| Default width | 467 px |
| Nav rail width (default) | 74 px |
| Nav rail width (compact) | 54 px |
| Content area (default) | sidebarW − navRailW |

---

## Breakpoints

Both breakpoints are derived values computed inside `EleosSidebar` and passed as props to all child panels.

### Width — `compactMode`
```js
const compactMode = sidebarW < 380;
```
At 380 px the content area (380 − 74 = **306 px**) is too narrow for the default 18 px headers with 16 px horizontal padding on each side. Below this threshold all density rules activate.

### Height + Width — `showNavLabels`
```js
const showNavLabels = sidebarH >= 480 && !compactMode;
```
Nav rail labels hide when the sidebar is **either** shorter than 480 px (height gate, pre-existing) **or** narrower than 380 px (width gate, added with compactMode). The `ITEM_H` and `RAIL_FIXED_H` constants already key off `showNavLabels`, so no further changes are needed in the nav rail.

| Condition | `showNavLabels` |
|---|---|
| sidebarH ≥ 480 AND sidebarW ≥ 380 | `true` — labels visible |
| sidebarH < 480 (any width) | `false` — labels hidden |
| sidebarW < 380 (any height) | `false` — labels hidden |

---

## Typography & Density Rules

All values follow the pattern `compactMode ? compactValue : defaultValue`.

### Panel titles
Applies to: SuggestionsPanel, MySessionsPanel, AddSummaryPanel (voice phase, text phase), SessionEndPanel.
```js
fontSize: compactMode ? 15 : 18
```

### Panel header padding
```js
padding: compactMode ? '10px 10px 8px' : '16px 16px 12px'
```

### Tab bars (SuggestionsPanel, MySessionsPanel)
```js
height: compactMode ? 34 : 42
fontSize: compactMode ? 13 : 14
```

### Search input height (MySessionsPanel)
```js
height: compactMode ? 38 : 47
```

### Session cards (MySessionsPanel)
| Property | Default | Compact |
|---|---|---|
| Card outer padding | 12 px | 8 px |
| Session name font | 16 px | 14 px |
| Day number font | 20 px | 16 px |
| Month label font | 12 px | 11 px |

```js
padding: compactMode ? 8 : 12
// Session name
fontSize: compactMode ? 14 : 16
// Day number
fontSize: compactMode ? 16 : 20
// Month label
fontSize: compactMode ? 11 : 12
```

### Form labels & inputs (AddSummaryPanel)
```js
fontSize: compactMode ? 14 : 16
```

---

## Layout Changes

### AddOnCptCard — Start / End / Duration row
At default widths the three time values (Start, End, Duration) render as a horizontal row with three equal flex columns. In compact mode the row switches to a vertical stack with left-aligned labels and right-aligned values, separated by horizontal dividers.

```
Default (≥ 380 px)          Compact (< 380 px)
────────────────────        ────────────────────
Start   End   Duration      Start          10:00 A.M.
                            ─────────────────────────
                            End            10:30 A.M.
                            ─────────────────────────
                            Duration          30 min
```

### Nav rail
- Default (≥ 380 px): rail is 74 px wide, labels visible (subject to height gate)
- Compact (< 380 px): rail is 54 px wide, labels always hidden

---

## Badge Text Truncation

| Badge | Default text | Compact text |
|---|---|---|
| `BadgePrimary` | Primary CPT Code | Primary |
| `BadgeAddOn` | Add-On CPT Code | Add-On |

```jsx
// BadgePrimary
{compactMode ? 'Primary' : 'Primary CPT Code'}

// BadgeAddOn
{compactMode ? 'Add-On' : 'Add-On CPT Code'}
```

---

## Prop Threading

`compactMode` and `sidebarW` are derived in `EleosSidebar` and passed down explicitly. No component reads `sidebarW` from context — it is always a prop.

```
EleosSidebar
  └─ compactMode={compactMode}  ──→  MySessionsPanel
  └─ compactMode={compactMode}  ──→  AddSummaryPanel
  └─ compactMode={compactMode}  ──→  CaptureSessionPanel
  └─ compactMode={compactMode}  ──→  SuggestionsPanel
  └─ sidebarW={sidebarW}        ──→  SuggestionsPanel
  └─ sidebarW={sidebarW}        ──→  ClientsPanel
       └─ compactMode (derived locally from sidebarW)
            └─ ClientDetailPanelV2
                 └─ V2Shell / V2LastActivity / V2MostFrequentThemes / etc.

CptCardList
  └─ compactMode  ──→  PrimaryCptCard  ──→  BadgePrimary
  └─ compactMode  ──→  AddOnCptCard    ──→  BadgeAddOn
  └─ compactMode  ──→  InteractiveComplexityCptCard  ──→  BadgeAddOn
```

---

## Quick Reference

| Sidebar width | compactMode | Nav labels | Content area |
|---|---|---|---|
| 600 px (max) | false | visible* | 526 px |
| 467 px (default) | false | visible* | 393 px |
| 380 px (threshold) | false → true | hidden | 306 px |
| 320 px (min) | true | hidden | 266 px |

\* Subject to height gate: labels also hide when sidebarH < 480 px regardless of width.

---

## Verification Checklist

1. Drag sidebar to < 380 px → all sizes shrink, nav labels disappear
2. Drag sidebar to ≥ 380 px → all sizes restore, labels reappear (if sidebarH ≥ 480)
3. Each panel (Sessions, Suggestions, AddSummary) is legible and non-clipped at 320 px
4. Height-based `showNavLabels` still triggers independently at sidebarH < 480
5. No regressions at default 467 px width — `compactMode` is false, appearance unchanged
6. AddOnCptCard time row is vertical in compact mode, horizontal at default
7. Badge text truncates correctly in compact mode
