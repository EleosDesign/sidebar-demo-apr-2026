import React from 'react'

export const ReviewerCallout: React.FC = () => {
  return (
    <div className="bg-eleos-mist border-1.5 border-eleos-ink rounded-lg shadow-card p-7 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-6">
      {/* Left column */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-6 h-1.5 bg-eleos-ink"></div>
          <span className="text-2xs font-semibold uppercase tracking-widest text-eleos-ink font-sans">
            For dev reviewers
          </span>
        </div>
        <h4 className="text-2xl font-serif font-semibold leading-tight tracking-tight mt-1.5 mb-2">
          Five minutes <em>is enough</em>.
        </h4>
        <p className="text-base text-eleos-slate font-sans">
          You're not deep-reviewing prototype code or demo tweaks. You're catching the few things that actually matter — described behavior, blast radius, public-facing risk.
        </p>
      </div>

      {/* Right column - checks */}
      <div className="space-y-2.5">
        {[
          'Does it do what the description says?',
          'Does it break anything in main or other active branches?',
          'Is there anything that would embarrass us in a demo or presentation?',
        ].map((check, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded border-1.5 border-eleos-ink bg-eleos-white flex-shrink-0 mt-0.5 flex items-center justify-center">
              <div className="w-2 h-2 border-l-2 border-b-2 border-eleos-amber -rotate-45"></div>
            </div>
            <div className="text-base text-eleos-ink font-sans">{check}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
