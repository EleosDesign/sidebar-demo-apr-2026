import React from 'react'

interface RuleCardProps {
  num: string
  title: string
  description: string
}

export const RuleCard: React.FC<RuleCardProps> = ({ num, title, description }) => {
  return (
    <div className="bg-eleos-white border-1.5 border-eleos-ink rounded-lg shadow-card p-5 min-h-40 flex flex-col">
      <div className="text-6xl font-serif italic font-light text-eleos-amber leading-none">
        {num}
        <div className="w-5 h-0.5 bg-eleos-ink mt-2"></div>
      </div>
      <h3 className="text-base font-semibold text-eleos-ink mt-3 font-sans">
        {title}
      </h3>
      <p className="text-sm text-eleos-fog mt-1 font-sans flex-grow">
        {description}
      </p>
    </div>
  )
}
