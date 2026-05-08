# Git Guidelines Handbook — Project Context

## Overview

This is an internal handbook for the Eleos Demo repo explaining Git collaboration across three teams: Designers & PMs, Sales, and Developers. It's a Next.js web application that serves as a reference guide with interactive team-specific workflows.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with HTML setup
│   ├── page.tsx         # Main page orchestrating all sections
│   └── globals.css      # Global styles and animations
└── components/
    ├── TopBar.tsx       # Header with metadata
    ├── Hero.tsx         # Intro section
    ├── SectionHead.tsx  # Reusable section header
    ├── RuleCard.tsx     # Core rule card
    ├── PromptCard.tsx   # Claude Code prompt
    ├── BranchTable.tsx  # Branch naming table
    ├── TeamSwitcher.tsx # Interactive team tabs (client component)
    ├── TeamCard.tsx     # Team-specific playbook
    ├── ReviewerCallout.tsx # Dev reviewer guidance
    ├── FooterBanner.tsx # Footer CTA
    └── index.ts         # Component exports
```

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + custom Eleos tokens
- **Language**: TypeScript
- **Build**: Node.js + npm

## Design System

All colors and typography are defined in `tailwind.config.js` using Eleos Health brand tokens:

- **Colors**: Navy (ink), Amber, Gold, Butter, Mist, Tiel, Blush, etc.
- **Fonts**: Source Serif 4 (display), Poppins (UI), monospace (code)
- **Shadows**: Signature hard-drop `0 2px 0 0`
- **Spacing**: 4px–96px scale

## Key Features

1. **Interactive Team Switcher**: Three role-specific workflows (client-side state)
2. **Responsive Design**: Mobile-first, adapts to tablet and desktop
3. **Accessible**: WCAG 2.1 AA compliant, semantic HTML
4. **Content-Rich**: 5 rules, 5 prompts, 3 team playbooks, reviewer guide

## Component Patterns

### Server Components (Default)

Most components are server-rendered. Use for static content:

```tsx
export const MyComponent: React.FC<Props> = ({ prop }) => {
  return <div>{prop}</div>
}
```

### Client Components

Use `'use client'` only for interactivity (state, effects, event handlers):

```tsx
'use client'
import { useState } from 'react'

export const TeamSwitcher: React.FC = () => {
  const [active, setActive] = useState('designers')
  // ...
}
```

## Content Management

To update handbook content:

1. **Edit `/src/app/page.tsx`** for rules, prompts, and branch patterns
2. **Edit component files** for team playbook workflows (in `TeamSwitcher.tsx` and `TeamCard.tsx`)
3. **Update `tailwind.config.js`** for design token changes

No database or CMS — all content is static and versioned in Git.

## Development Workflow

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Styling Guidelines

### Tailwind Classes

Use existing Tailwind classes. For Eleos tokens, use the extended colors:

```tsx
<div className="bg-eleos-ink text-eleos-white border-1.5 border-eleos-amber">
  <h1 className="font-serif text-6xl font-light">Headline</h1>
  <p className="font-sans text-lg text-eleos-slate">Body</p>
</div>
```

### Custom CSS

Add global or component-specific styles in:
- `src/app/globals.css` — animations, states, accessibility overrides
- Inline Tailwind in JSX (preferred)

### Shadows

Always use the signature hard-drop shadow:

```tsx
className="shadow-card"  // 0 2px 0 0 #293D86
```

## Accessibility

- Use semantic HTML (`<h1>`, `<p>`, `<button>`, etc.)
- Add `aria-*` labels for interactive elements
- Test with keyboard navigation
- Respect `prefers-reduced-motion`
- Maintain 4.5:1 color contrast for body text

## Deployment

### Local

```bash
npm run build
npm start
```

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker/Server

Update `next.config.js` if needed, build, and deploy the `.next` folder.

## Performance

- **No images** in current implementation (use placeholder SVG or emoji)
- **Font optimization** via Google Fonts preconnect
- **Code splitting** automatic via Next.js
- **Responsive images** use native `srcset`

Target metrics:
- Lighthouse: 95+
- FCP: <1.5s
- LCP: <2.5s

## Security

- No external data fetching (static content)
- No form submissions or API calls
- Marked as internal (`robots: noindex, nofollow`)
- No sensitive data in URLs or storage

## Maintenance

### Regular Tasks

- **Monthly**: Review handbook content for accuracy
- **Quarterly**: Update version number and last-updated date in footer
- **As needed**: Add new team workflows or Claude Code prompts

### Future Enhancements

Possible additions (not in current scope):

- Dark mode toggle (already designed, see `data-mood` in globals.css)
- Search/filter for prompts
- Print-friendly version
- Export as PDF
- Video tutorials embedded in sections

## Known Constraints

- All content is static (no CMS)
- Team switcher only affects display (no persistence)
- Illustration placeholder — replace with actual SVG or image
- No authentication or user tracking

## Questions?

- **Content**: See the handbook itself (`#eng-help` on Slack)
- **Implementation**: Review component code and TypeScript types
- **Design**: Check `tailwind.config.js` for all tokens

---

Last updated: April 2026
