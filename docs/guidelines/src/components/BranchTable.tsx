import React from 'react'

interface BranchRow {
  team: string
  pattern: React.ReactNode
  example: string
  color: 'blush' | 'gold' | 'tiel'
}

interface BranchTableProps {
  rows: BranchRow[]
}

const colorMap = {
  blush: 'bg-eleos-blush',
  gold: 'bg-eleos-gold',
  tiel: 'bg-eleos-tiel',
}

export const BranchTable: React.FC<BranchTableProps> = ({ rows }) => {
  return (
    <div className="bg-eleos-white border-1.5 border-eleos-ink rounded-lg shadow-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 gap-5 bg-eleos-ink text-eleos-white text-2xs font-semibold uppercase tracking-widest px-6 py-3.5 font-sans sm:gap-4">
        <div>Team</div>
        <div>Pattern</div>
        <div>Example</div>
      </div>

      {/* Rows */}
      <div>
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-3 gap-5 px-6 py-4.5 border-t stroke-hairline sm:gap-4"
          >
            <div className="flex items-center gap-2.5 text-base font-semibold text-eleos-ink font-sans">
              <span className={`w-2.5 h-2.5 rounded-full border border-eleos-ink flex-shrink-0 ${colorMap[row.color]}`}></span>
              {row.team}
            </div>
            <div className="font-mono text-sm text-eleos-ink">{row.pattern}</div>
            <div className="font-mono text-sm text-eleos-slate">{row.example}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
