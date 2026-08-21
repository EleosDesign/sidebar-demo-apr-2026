const INTERVENTION_PHRASES = [
  'client was encouraged to establish clear boundaries with his partner and explored what those boundaries might look like in practice',
  'motivational interviewing techniques',
  'provided psychoeducation',
];

const progressPattern = /\b(?:managing urges|progress|improved?|improvement|declined?|regressed?|regression|unchanged|no change|stable|stability)\b/i;
const responsePattern = /\b(?:client|he|she|they)\b[^.!?\n]{0,80}\b(?:responded|reported|stated|shared|agreed|demonstrated|engaged|receptive|nodded|shrugged)\b/i;
const nextStepPattern = /\b(?:will|plans? to|agreed to|homework|continue|follow[- ]?up)\b/i;
const nextAppointmentPattern = /(?:\b(?:next|follow[- ]?up)\b[^.!?\n]{0,60}\b(?:appointment|session|schedule)\b|\b(?:appointment|session|schedule)\b[^.!?\n]{0,60}\b(?:next|follow[- ]?up)\b)/i;

const SERVICE_CODE_DETAIL = 'CPT 90847 (Family Therapy w/patient) listed but requires the partner/family member to be physically (or virtually) in the session. Suggested code is 90837 (60 Minute Individual Therapy).';

export function evaluateNoteQuality(noteValues = {}, sections = [], serviceCodePassed = false) {
  const entries = Object.entries(noteValues);
  const allText = entries.map(([, value]) => value ?? '').join(' ');
  const normalizedText = allText.toLowerCase();
  const wordCount = allText.trim() ? allText.trim().split(/\s+/).length : 0;
  const complete = wordCount > 10;
  const sectionById = new Map(sections.map(section => [section.id, section]));
  const hasResponseField = entries.some(([id, value]) => {
    const section = sectionById.get(id);
    return `${id} ${section?.label ?? ''}`.toLowerCase().includes('response') && String(value ?? '').trim();
  });

  const checks = [
    {
      title: 'Completeness',
      passed: complete,
      passedDetail: 'All sections meet the minimum content requirement.',
      failedDetail: `This document hasn't met the minimum content requirement. ${11 - wordCount} more word${wordCount === 10 ? '' : 's'} needed.`,
    },
    {
      title: 'Uniqueness',
      passed: complete,
      passedDetail: 'Content appears sufficiently detailed and unique.',
      failedDetail: 'The document is too similar to previous documents submitted by this provider.',
    },
    {
      title: 'Progress Mentioned',
      passed: progressPattern.test(allText),
      passedDetail: 'Specific progress documentation or goal indicators are present.',
      failedDetail: 'Note lacks specific progress documentation or goal indicators.',
    },
    {
      title: 'Golden Thread',
      passed: complete,
      passedDetail: 'Therapeutic service match and goal/objective linkage criteria have been met.',
      failedDetail: 'Therapeutic service match and goal/objective linkage criteria were not met.',
    },
    {
      title: 'Intervention Used',
      passed: INTERVENTION_PHRASES.some(phrase => normalizedText.includes(phrase)),
      passedDetail: 'At least one recognized intervention was documented.',
      failedDetail: 'No interventions found; action oriented, scope aligned, and clinical need relevance are all False.',
    },
    {
      title: 'Client Response to Intervention',
      passed: Boolean(hasResponseField || responsePattern.test(allText)),
      passedDetail: 'Client response has been documented after intervention.',
      failedDetail: 'No client response documented after intervention.',
    },
    {
      title: 'Compliant Plan',
      passed: nextStepPattern.test(allText) || nextAppointmentPattern.test(allText),
      passedDetail: 'Next step or next appointment has been documented.',
      failedDetail: 'Both criteria were not met: no next step or next appointment documented.',
    },
    {
      title: 'Service Code Match',
      passed: serviceCodePassed,
      passedDetail: 'Service code is appropriate for the documented session.',
      failedDetail: SERVICE_CODE_DETAIL,
      custom: true,
    },
  ];

  return {
    openItems: checks.filter(check => !check.passed).map(check => ({
      id: check.title,
      title: check.title,
      detail: check.failedDetail,
      custom: check.custom,
    })),
    completedItems: checks.filter(check => check.passed).map(check => ({
      label: check.title,
      detail: check.passedDetail,
      custom: check.custom,
    })),
  };
}
