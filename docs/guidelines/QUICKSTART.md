# Quick Start Guide

Get the Git Guidelines handbook running in 2 minutes.

## 1. Install Dependencies

```bash
npm install
```

This installs Next.js, React, Tailwind CSS, and TypeScript.

## 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll see the handbook with:

- ✅ Interactive team switcher (click Designers, Sales, Developers)
- ✅ 5 core rules
- ✅ Claude Code prompt reference
- ✅ Branch naming conventions
- ✅ Per-team workflows
- ✅ Responsive design (try resizing)

## 3. Customize Content (Optional)

### Update handbook text

Edit `src/app/page.tsx`:

```tsx
const rules = [
  {
    num: '01',
    title: 'Your new rule title',
    description: 'Your new description',
  },
  // ...
]
```

### Update team workflows

Edit `src/components/TeamSwitcher.tsx` and modify `teamData`:

```tsx
designers: {
  label: 'Designers & PMs',
  title: 'Your new title',
  goal: 'Your new goal',
  workflow: [ /* steps */ ],
  knowItems: [ /* items */ ],
}
```

### Change colors

Edit `tailwind.config.js` under `theme.extend.colors`:

```js
eleos: {
  ink: '#293D86',
  amber: '#D88100',
  // ...
}
```

## 4. Build for Production

```bash
npm run build
npm start
```

The app will be optimized and ready to serve.

## Project Structure

```
src/
├── app/
│   ├── page.tsx         ← Main content (rules, prompts, teams)
│   ├── layout.tsx       ← HTML setup and metadata
│   └── globals.css      ← Styles and animations
└── components/
    ├── TeamSwitcher.tsx ← Interactive tabs (edit team data here)
    ├── RuleCard.tsx
    ├── PromptCard.tsx
    └── ... other components
```

## What's Already Built

✅ Fully responsive (mobile, tablet, desktop)
✅ Accessible (WCAG 2.1 AA)
✅ Interactive team switcher with smooth animations
✅ All Eleos design tokens
✅ Production-ready TypeScript
✅ Zero external data dependencies

## Next Steps

1. **Test it**: Click the team switcher tabs and resize the browser
2. **Customize**: Update handbook content in `src/app/page.tsx`
3. **Deploy**: Push to GitHub, connect to Vercel, or use Docker
4. **Share**: Send the URL to your team

## Deployment Options

### Vercel (Easiest)

```bash
npm install -g vercel
vercel deploy
```

### GitHub Pages / Static

```bash
# In next.config.js:
# const nextConfig = { output: 'export' }

npm run build
# Deploy the 'out' folder
```

### Docker

```bash
docker build -t git-guidelines .
docker run -p 3000:3000 git-guidelines
```

## Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**Styles look broken?**
Restart the dev server and clear `.next` folder:
```bash
rm -rf .next
npm run dev
```

**TypeScript errors?**
Make sure you have Node 18+:
```bash
node --version  # Should be v18.0.0 or higher
```

## Need Help?

- 📖 See `README.md` for full documentation
- 💬 Check `CLAUDE.md` for project architecture
- 🎨 Review `tailwind.config.js` for all design tokens

---

Ready to share with your team! 🚀
