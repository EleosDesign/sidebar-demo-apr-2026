import React from 'react'
import Image from 'next/image'

export const TopBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between pb-6 border-b stroke-hairline">
      {/* Logo */}
      <div className="w-8 h-8 flex-shrink-0">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="98" fill="#293D86" />
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="140" fontWeight="bold" fontFamily="serif">
            E
          </text>
        </svg>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4.5 text-2xs text-eleos-fog font-sans">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-eleos-tiel"></span>
          Engineering · Internal
        </span>
        <span>v1.0 · April 2026</span>
      </div>
    </div>
  )
}
