'use client'

import React, { useState } from 'react'
import { TeamCard } from './TeamCard'

type TeamId = 'designers' | 'sales' | 'developers'

interface TeamSwitcherProps {
  children?: React.ReactNode
}

const teamColors = {
  designers: 'bg-eleos-blush',
  sales: 'bg-eleos-gold',
  developers: 'bg-eleos-tiel',
}

const teamLabels = {
  designers: 'Designers & PMs',
  sales: 'Sales',
  developers: 'Developers',
}

export const TeamSwitcher: React.FC<TeamSwitcherProps> = () => {
  const [activeTeam, setActiveTeam] = useState<TeamId>('designers')

  const teamData = {
    designers: {
      label: 'Designers & PMs',
      title: 'Prototype upcoming features <em>without</em> stepping on Sales or Devs.',
      goal: 'Your branch is your sandbox. Experiment freely — main is protected, and the work you ship for review is exactly the work you mean to ship.',
      workflow: [
        'Ask Claude Code: "Create a new branch called <code>prototype/[your-feature-name]</code> from main."',
        'Make your changes — Claude Code handles the code.',
        'When ready for feedback: "Open a pull request for this branch."',
        'Add a one-line description of what the prototype is exploring.',
        'Tag a dev to review.',
      ],
      knowItems: [
        {
          type: 'tip' as const,
          title: 'Your branch is your sandbox',
          text: '— feel free to experiment.',
        },
        {
          type: 'default' as const,
          title: 'Need a fix from main?',
          text: 'Ask Claude Code: "Sync my branch with the latest main."',
        },
        {
          type: 'warn' as const,
          title: "Don't worry about breaking things on your branch",
          text: '— that\'s what it\'s for. Main is protected.',
        },
      ],
    },
    sales: {
      label: 'Sales',
      title: 'Maintain a clean, <em>impressive</em> demo that\'s always ready to present.',
      goal: 'A prospect should never see anything you didn\'t choose to show. Branch the demo, control the surface area, sync before you walk in the room.',
      workflow: [
        'Ask Claude Code: "Create a new branch called <code>demo/[demo-name]</code> from main."',
        'Make any customizations needed for the demo.',
        'When ready: "Open a pull request for this branch."',
        'Add a one-line description (e.g., "Customized for Q2 enterprise pitch — added placeholder org data").',
        'Tag a dev to review before presenting.',
      ],
      knowItems: [
        {
          type: 'tip' as const,
          title: 'For recurring demos',
          text: 'you can reuse a branch — just sync it with main before each presentation.',
        },
        {
          type: 'default' as const,
          title: 'Custom look for one prospect?',
          text: 'Create a new branch rather than modifying an existing demo branch.',
        },
        {
          type: 'warn' as const,
          title: 'Never demo directly from main',
          text: '— always present from your own branch so you control what\'s shown.',
        },
      ],
    },
    developers: {
      label: 'Developers',
      title: 'Ship features and fixes — <em>keep</em> main stable for everyone else.',
      goal: 'You build it, you review it, you keep the standard. Non-dev PRs need a quick sanity check, not a deep code review.',
      workflow: [
        'Branch off main: <code>feat/your-feature</code> or <code>fix/your-fix</code>.',
        'Build and test.',
        'Open a PR, get one peer approval, merge.',
        'After merging, let the other teams know if they should sync their branches.',
      ],
      knowItems: [
        {
          type: 'tip' as const,
          title: 'Quick sanity check, not a deep review',
          text: '— 5 minutes or less for most non-dev PRs.',
        },
        {
          type: 'default' as const,
          title: 'Does it do what the description says?',
          text: '',
        },
        {
          type: 'default' as const,
          title: 'Does it break anything in main or other active branches?',
          text: '',
        },
        {
          type: 'warn' as const,
          title: 'Is there anything that would embarrass us',
          text: 'in a demo or presentation?',
        },
      ],
    },
  }

  return (
    <div>
      {/* Switcher buttons */}
      <div className="flex flex-wrap gap-2.5 mb-7">
        {(Object.keys(teamColors) as TeamId[]).map((team) => (
          <button
            key={team}
            onClick={() => setActiveTeam(team)}
            className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-full text-base font-medium transition-all duration-160 font-sans ${
              activeTeam === team
                ? 'bg-eleos-ink text-eleos-white shadow-card'
                : 'bg-eleos-white border border-eleos-ink text-eleos-ink hover:shadow-card hover:-translate-y-0.5'
            }`}
            aria-pressed={activeTeam === team}
          >
            <span className={`w-2.5 h-2.5 rounded-full border border-eleos-ink ${teamColors[team]}`}></span>
            {teamLabels[team]}
          </button>
        ))}
      </div>

      {/* Team cards */}
      {(Object.keys(teamData) as TeamId[]).map((team) => (
        <div key={team} className={activeTeam !== team ? 'hidden' : ''}>
          <TeamCard
            team={team}
            data={teamData[team]}
          />
        </div>
      ))}
    </div>
  )
}
