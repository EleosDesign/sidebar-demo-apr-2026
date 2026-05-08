import React from 'react'

export const FooterBanner: React.FC = () => {
  return (
    <div className="bg-eleos-ink text-eleos-white rounded-2xl shadow-card p-9 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-16">
      {/* Left column */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-6 h-1.5 bg-eleos-gold"></div>
          <span className="text-2xs font-semibold uppercase tracking-widest text-eleos-gold font-sans">
            Questions?
          </span>
        </div>
        <h3 className="text-3xl font-serif font-light leading-tight tracking-tight mb-2">
          If you're unsure, <em className="text-eleos-gold">ask before pushing.</em>
        </h3>
        <p className="text-base text-blue-100 font-sans leading-relaxed">
          It's much easier to fix something before it's in a PR than after. Slack{' '}
          <code className="font-mono bg-white bg-opacity-10 border border-white border-opacity-20 rounded px-1.5 py-0.5 text-sm text-eleos-white">
            #eng-help
          </code>
          , drop a question in the PR draft, or ask Claude Code first.
        </p>
      </div>

      {/* Right column - signoff */}
      <div className="lg:border-l border-white border-opacity-20 lg:pl-8">
        <p className="text-xl font-serif italic text-eleos-gold leading-relaxed text-center lg:text-right">
          If you care,
          <br />
          we care.
        </p>
      </div>
    </div>
  )
}
