import React from 'react'

export const Hero: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 items-end mt-10 mb-16">
      {/* Left column */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-6 h-1.5 bg-eleos-ink"></div>
          <span className="text-2xs font-semibold uppercase tracking-widest text-eleos-ink font-sans">
            Internal handbook · One-pager
          </span>
        </div>

        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-serif font-light leading-tight tracking-tight mb-4">
          Git, the <em>shared</em> way.
          <br />
          One main, three teams,
          <br />
          zero surprises.
        </h1>

        <p className="text-xl text-eleos-slate max-w-2xl mb-3.5 font-sans leading-relaxed">
          This repository is shared across <strong>Designers & PMs</strong>, <strong>Sales</strong>, and <strong>Developers</strong>. Each team has its own workflow, but everyone follows the same core rules to keep{' '}
          <code className="font-mono bg-eleos-butter border stroke-hairline rounded-sm px-1.5 py-0.5 text-sm">
            main
          </code>{' '}
          stable and demo-ready at all times.
        </p>

        <p className="text-xl text-eleos-slate max-w-2xl font-sans leading-relaxed">
          All Git operations are done through <strong>Claude Code</strong> — no terminal commands required.
        </p>
      </div>

      {/* Right column - illustration placeholder */}
      <div className="hero-illustration bg-eleos-butter border-1.5 border-eleos-ink rounded-2xl shadow-card p-6 aspect-square flex items-center justify-center overflow-hidden relative hidden lg:flex">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 38%, rgba(255,217,0,.55), transparent 58%)',
            pointerEvents: 'none',
          }}
        ></div>
        <div className="relative z-10 text-center text-eleos-ink">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-sm font-sans">Design illustration</p>
        </div>
      </div>
    </div>
  )
}
