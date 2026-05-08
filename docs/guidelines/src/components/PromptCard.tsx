import React from 'react'

interface PromptCardProps {
  task: string
  ask: string | React.ReactNode
  fullWidth?: boolean
}

export const PromptCard: React.FC<PromptCardProps> = ({ task, ask, fullWidth }) => {
  return (
    <div
      className={`bg-eleos-white border-1.5 border-eleos-ink rounded-lg shadow-card p-5 transition-all duration-160 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
        fullWidth ? 'sm:col-span-2' : ''
      }`}
    >
      <div className="text-2xs font-semibold uppercase tracking-widest text-eleos-amber font-sans mb-2">
        {task}
      </div>
      <div className="text-xl font-serif italic text-eleos-ink leading-snug">
        <span className="text-eleos-amber">"</span>
        {ask}
        <span className="text-eleos-amber">"</span>
      </div>
    </div>
  )
}
