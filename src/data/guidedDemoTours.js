// Placeholder copy for the self-serve guided demo (/guided-demo). Swap in real
// marketing copy per step when available — structure (title/body/tab/target) should stay stable.
//
// `target` names a `data-tour-target` attribute the GuidedTourCard anchors to and
// puts a glowing ring around. `completesOn` / `autoAction` (Capture only, for now)
// wire the step to the eleos:tourSignal / eleos:tourApply event bus so "Next" can
// perform the real action and a real click auto-advances the tour either way.
export const GUIDED_DEMO_TOURS = {
  capture: {
    id: 'capture',
    label: 'Live Session',
    tagline: 'See Eleos listen in on a real session',
    marketingBlurb: 'Start a live session and watch Eleos capture the conversation in real time — no typing, no dictation, no post-session paperwork.',
    tab: 'capture',
    defaultClient: 'Calvin Murphy',
    steps: [
      { title: 'Start a live session', body: 'This is where a clinician kicks off a session with a client. Eleos listens in real time — no recorder, no separate app, no manual note-taking during the visit.', target: 'capture-header' },
      { title: 'Pick your setting', body: 'Session type and setting are already filled in for this demo client, but in real use a clinician can capture any modality — individual, group, telehealth, or in person.', target: 'capture-settings-fields' },
      { title: 'Hit record and go', body: 'Once recording starts, Eleos is quietly transcribing and structuring the conversation in the background. The clinician stays present with the client instead of typing.', target: 'capture-submit-button', completesOn: 'capture-started', autoAction: 'capture-start' },
      { title: 'From audio to a finished note', body: 'When the session ends, Eleos turns the conversation into a structured, EHR-ready note automatically — that’s the AI Note Summary and Quality Review journeys you can explore next.', target: null },
    ],
  },
  summary: {
    id: 'summary',
    label: 'AI Note Summary',
    tagline: 'From conversation to compliant note in minutes',
    marketingBlurb: 'See how Eleos turns a session into a fully structured clinical note, with AI-drafted suggestions a clinician can review and drop straight into their EHR.',
    tab: 'summary',
    defaultClient: 'Calvin Murphy',
    steps: [
      { title: 'A session, ready to summarize', body: 'This is a completed session ready to be turned into a note. Eleos already knows the client, the note type, and the relevant history.', target: 'summary-client-card' },
      { title: 'AI-drafted suggestions', body: 'Eleos generates section-by-section note suggestions grounded in what was actually said in the session — not generic boilerplate.', target: 'summary-suggestions-list' },
      { title: 'Add to note with one click', body: 'A clinician reviews each suggestion and adds the ones they want straight into the note — they stay in control of what goes in the chart.', target: 'summary-suggestions-list' },
      { title: 'Straight into the EHR', body: 'The finished note flows into the note fields on the right, formatted the way this EHR expects it — ready to sign.', target: null },
    ],
  },
  quality: {
    id: 'quality',
    label: 'Quality Review',
    tagline: 'Catch documentation issues before they become compliance risk',
    marketingBlurb: 'See how Eleos automatically reviews a finished note for documentation quality, compliance, and billing-support issues before it’s signed.',
    tab: 'quality',
    defaultClient: 'Larry Quinn',
    steps: [
      { title: 'Automatic quality review', body: 'Every note can be automatically checked against documentation and compliance standards — no manual audit checklist required.', target: 'quality-score-summary' },
      { title: 'Issues, explained', body: 'Eleos doesn’t just flag a problem — it explains what’s missing or risky and why it matters for compliance or billing.', target: 'quality-issues-list' },
      { title: 'Fix issues in place', body: 'A clinician can jump straight from a flagged issue to the relevant part of the note and fix it before it’s ever submitted.', target: 'quality-issues-list' },
    ],
  },
};

export const GUIDED_DEMO_TOUR_ORDER = ['capture', 'summary', 'quality'];
