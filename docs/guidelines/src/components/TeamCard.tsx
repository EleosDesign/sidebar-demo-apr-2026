import React from 'react'

type TeamId = 'designers' | 'sales' | 'developers'
type KnowItemType = 'tip' | 'warn' | 'default'

interface KnowItem {
  type: KnowItemType
  title: string
  text: string
}

interface TeamCardData {
  label: string
  title: string
  goal: string
  workflow: string[]
  knowItems: KnowItem[]
}

interface TeamCardProps {
  team: TeamId
  data: TeamCardData
}

const teamBgColors = {
  designers: 'bg-eleos-petal',
  sales: 'bg-eleos-butter',
  developers: 'bg-eleos-mist',
}

const teamDots = {
  designers: 'bg-eleos-blush',
  sales: 'bg-eleos-gold',
  developers: 'bg-eleos-tiel',
}

const markerColors: Record<KnowItemType, string> = {
  tip: 'bg-eleos-tiel',
  warn: 'bg-eleos-blush',
  default: 'bg-eleos-gold',
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, data }) => {
  return (
    <div className={`border-1.5 border-eleos-ink rounded-2xl shadow-card p-9 grid grid-cols-1 lg:grid-cols-2 gap-10 is-entering ${teamBgColors[team]}`}>
      {/* Left column */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className={`w-2 h-2 rounded-full border border-eleos-ink flex-shrink-0 ${teamDots[team]}`}></span>
          <span className="text-2xs font-semibold uppercase tracking-widest text-eleos-ink font-sans">
            {data.label}
          </span>
        </div>
        <h3 className="text-4xl font-serif font-semibold leading-tight tracking-tight mt-3.5 mb-2.5">
          {data.title.split('<em>').map((part, idx) => {
            const [text, rest] = part.split('</em>')
            if (idx === 0) return <React.Fragment key={idx}>{text}</React.Fragment>
            return (
              <React.Fragment key={idx}>
                <em>{text}</em>
                {rest}
              </React.Fragment>
            )
          })}
        </h3>
        <p className="text-lg text-eleos-slate max-w-prose mb-5.5 font-sans">
          {data.goal}
        </p>

        {/* Workflow */}
        <div className="bg-eleos-white border border-eleos-ink rounded-md p-5 mb-4.5">
          <div className="text-2xs font-semibold uppercase tracking-widest text-eleos-ink font-sans mb-2.5">
            Workflow
          </div>
          <ol className="space-y-2 list-none p-0 m-0">
            {data.workflow.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-base text-eleos-slate font-sans">
                <span className="font-serif italic text-xl text-eleos-amber flex-shrink-0 font-light">
                  {idx + 1}
                </span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: step,
                  }}
                  className="flex-1"
                />
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Right column */}
      <div>
        <div className="text-2xs font-semibold uppercase tracking-widest text-eleos-ink font-sans mb-3">
          Things to know
        </div>
        <div className="space-y-3.5">
          {data.knowItems.map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <span className={`w-4.5 h-4.5 rounded-full flex-shrink-0 mt-0.5 border border-eleos-ink ${markerColors[item.type]}`}></span>
              <div className="text-base text-eleos-slate font-sans flex-1">
                {item.title && (
                  <strong className="text-eleos-ink">
                    {item.title}
                  </strong>
                )}
                {item.text && (
                  <>
                    {item.title && ' '}
                    {item.text}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
