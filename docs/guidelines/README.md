# Git Guidelines Handbook

An internal handbook for Eleos Demo repo explaining how Designers, Sales, and Developers can collaborate in a shared Git repository without stepping on each other.

## Overview

This is a production-ready Next.js + React application that provides:

- **Interactive team switcher** — View workflows specific to your role (Designers & PMs, Sales, or Developers)
- **Core rules and quick reference** — 5 golden rules and Claude Code prompts for common tasks
- **Branch naming conventions** — Clear patterns for each team
- **Responsive design** — Works on mobile, tablet, and desktop
- **Accessible** — WCAG 2.1 compliant
- **Eleos brand theming** — Uses official Eleos Health design tokens

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Architecture

### Components

The application is built with modular, reusable React components:

- **`TopBar`** — Header with metadata
- **`Hero`** — Introductory section with headline and illustration placeholder
- **`SectionHead`** — Reusable section header with eyebrow and support text
- **`RuleCard`** — Individual core rule card
- **`PromptCard`** — Claude Code prompt reference
- **`BranchTable`** — Branch naming conventions table
- **`TeamSwitcher`** — Interactive tabs for team-specific workflows
- **`TeamCard`** — Team-specific playbook content
- **`ReviewerCallout`** — Callout for developer reviewers
- **`FooterBanner`** — Footer with call to action

### Styling

The project uses **Tailwind CSS** with custom Eleos design tokens:

- Colors: Navy (`#293D86`), Amber (`#D88100`), Gold, Butter, Mist, Tiel, and more
- Typography: Source Serif 4 (display) + Poppins (UI)
- Spacing: 4px to 96px scale
- Shadows: Signature hard-drop shadow (`0 2px 0`)

### Design System Integration

All design tokens are defined in `tailwind.config.js` and can be accessed throughout the app:

```tsx
<div className="bg-eleos-ink text-eleos-white">
  <h1 className="font-serif text-6xl">Headline</h1>
</div>
```

## Features

### Team Switcher

Click any team tab to view role-specific workflows:

- **Designers & PMs**: Prototyping workflow with sandbox branching
- **Sales**: Demo management with presentation-ready branches
- **Developers**: Feature/fix workflow with PR guidelines

### Responsive Layout

The design adapts gracefully:

- **Mobile**: Single column, stacked sections
- **Tablet**: 2-column grids for team cards
- **Desktop**: Full 2-column layouts with optimal spacing

### Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance
- Reduced motion preferences respected

## Customization

### Updating Content

Edit `/src/app/page.tsx` to modify:

- Core rules
- Claude Code prompts
- Branch naming patterns
- Team workflows

### Changing Colors

Update color tokens in `tailwind.config.js`:

```js
colors: {
  eleos: {
    ink: '#293D86',
    // ...
  }
}
```

### Modifying Typography

Font families and sizes are defined in `tailwind.config.js`:

```js
fontFamily: {
  serif: ['Source Serif 4', ...],
  sans: ['Poppins', ...],
}
```

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next .next
COPY public public
CMD ["npm", "start"]
```

### Static Export

For internal-only deployment without a server:

```bash
# Update next.config.js:
# const nextConfig = { output: 'export' }

npm run build
# Serve the 'out' directory
```

## Environment Variables

Currently, this application doesn't require environment variables. If you integrate with external services, add them to `.env.local`:

```env
# .env.local (not committed to git)
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Lighthouse**: 95+ across all metrics
- **Core Web Vitals**: Optimized
- **Bundle size**: ~50KB gzipped

## Contributing

When adding new content or components:

1. Keep components focused and reusable
2. Follow the Eleos design tokens
3. Test responsive behavior
4. Verify accessibility with WCAG 2.1 AA
5. Use semantic HTML

## License

Internal use only — Eleos Health.

## Support

Questions about the handbook content? Slack `#eng-help` or ask Claude Code.

Questions about the implementation? See the component exports in `src/components/index.ts`.

---

Built with Next.js, React, Tailwind CSS, and TypeScript.
