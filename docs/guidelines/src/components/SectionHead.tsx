import React from 'react'

interface SectionHeadProps {
  eyebrow: string
  title: string | React.ReactNode
  support?: string
}

export const SectionHead: React.FC<SectionHeadProps> = ({ eyebrow, title, support }) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 mb-7">
      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-6 h-1.5 bg-eleos-ink"></div>
          <span className="text-2xs font-semibold uppercase tracking-widest text-eleos-ink font-sans">
            {eyebrow}
          </span>
        </div>
        <h2 className="text-5xl font-serif font-semibold leading-tight tracking-tight">
          {title}
        </h2>
      </div>
      {support && (
        <p className="text-lg text-eleos-slate max-w-xs flex-shrink-0 font-sans">
          {support}
        </p>
      )}
    </div>
  )
}
