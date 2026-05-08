import { TopBar } from '@/components/TopBar'
import { Hero } from '@/components/Hero'
import { SectionHead } from '@/components/SectionHead'
import { RuleCard } from '@/components/RuleCard'
import { PromptCard } from '@/components/PromptCard'
import { BranchTable } from '@/components/BranchTable'
import { TeamSwitcher } from '@/components/TeamSwitcher'
import { ReviewerCallout } from '@/components/ReviewerCallout'
import { FooterBanner } from '@/components/FooterBanner'

export default function Home() {
  const rules = [
    {
      num: '01',
      title: 'Never push directly to main.',
      description: 'All changes go through a Pull Request.',
    },
    {
      num: '02',
      title: 'Start from the latest main.',
      description: 'Sync before branching so you're not on stale code.',
    },
    {
      num: '03',
      title: 'Keep branches short-lived.',
      description: 'One branch per task. Merge or discard when done.',
    },
    {
      num: '04',
      title: 'Write a one-line PR description.',
      description: 'A sentence on intent helps reviewers move fast.',
    },
    {
      num: '05',
      title: 'One dev approval to merge.',
      description: 'Tag a developer; they sign off, you ship.',
    },
  ]

  const prompts = [
    {
      task: 'Start new work',
      ask: 'Create a new branch called [name] from main',
    },
    {
      task: 'Sync with latest main',
      ask: 'Sync my branch with the latest main',
    },
    {
      task: 'Submit for review',
      ask: 'Open a pull request for this branch',
    },
    {
      task: 'Where am I?',
      ask: 'What branch am I on?',
    },
    {
      task: 'Discard work and start over',
      ask: 'Delete my current branch and start fresh from main',
      fullWidth: true,
    },
  ]

  const branchRows = [
    {
      team: 'Designers & PMs',
      pattern: (
        <>
          prototype<span className="text-eleos-amber">/</span>short-description
        </>
      ),
      example: 'prototype/new-onboarding-flow',
      color: 'blush' as const,
    },
    {
      team: 'Sales',
      pattern: (
        <>
          demo<span className="text-eleos-amber">/</span>short-description
        </>
      ),
      example: 'demo/q2-enterprise-pitch',
      color: 'gold' as const,
    },
    {
      team: 'Developers',
      pattern: (
        <>
          feat<span className="text-eleos-amber">/</span>… or fix<span className="text-eleos-amber">/</span>…
        </>
      ),
      example: 'feat/salesforce-integration',
      color: 'tiel' as const,
    },
  ]

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-12 sm:py-16">
        {/* Top bar */}
        <TopBar />

        {/* Hero section */}
        <Hero />

        {/* Core Rules section */}
        <section className="mt-20 mb-20">
          <SectionHead
            eyebrow="The five"
            title={
              <>
                Core rules <em>everyone</em> follows.
              </>
            }
            support="Memorize these. They're what keep main calm while three teams work in parallel."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {rules.map((rule, idx) => (
              <RuleCard
                key={idx}
                num={rule.num}
                title={rule.title}
                description={rule.description}
              />
            ))}
          </div>
        </section>

        {/* Quick reference section */}
        <section className="mt-20 mb-20">
          <SectionHead
            eyebrow="Quick reference"
            title={
              <>
                Useful Claude Code <em>prompts.</em>
              </>
            }
            support="Copy these verbatim. Specific phrasing helps Claude Code do the right thing the first time."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {prompts.map((prompt, idx) => (
              <PromptCard
                key={idx}
                task={prompt.task}
                ask={prompt.ask}
                fullWidth={prompt.fullWidth}
              />
            ))}
          </div>
        </section>

        {/* Branch Naming section */}
        <section className="mt-20 mb-20">
          <SectionHead
            eyebrow="Branch naming"
            title={
              <>
                Name branches so they <em>tell their own story.</em>
              </>
            }
            support="A glance at the prefix should answer: who owns this, and what's it for?"
          />

          <BranchTable rows={branchRows} />
        </section>

        {/* Per-team Playbook section */}
        <section className="mt-20 mb-20">
          <SectionHead
            eyebrow="Per-team playbook"
            title={
              <>
                Pick your team. <em>Read your lane.</em>
              </>
            }
            support="Same repo, three jobs. Click a tab to see the workflow for your team."
          />

          <TeamSwitcher />

          {/* Reviewer callout */}
          <ReviewerCallout />
        </section>

        {/* Footer banner */}
        <FooterBanner />

        {/* Doc footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-8 border-t stroke-hairline text-2xs text-eleos-fog font-sans">
          <div>Eleos Health · Engineering Handbook</div>
          <div>Owner: Platform · Last updated April 2026</div>
        </div>
      </div>
    </main>
  )
}
