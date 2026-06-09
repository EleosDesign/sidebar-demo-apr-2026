// ── Default note field values shown on the EHR ────────────────────────────────
export const INITIAL_NOTE_VALUES = {
  'Data/Goal:': "Client presented on time and appeared mildly anxious. Reported a difficult week at work — ongoing conflict with supervisor related to performance review. States he has been avoiding responding to manager's emails for 3 days. Identified this as a pattern consistent with prior sessions. Sleep disrupted, averaging 5 hrs/night. Denied SI/HI.",
  'Intervention/Response:': 'Utilized cognitive restructuring to examine evidence for/against belief that "any confrontation will end badly." Client was able to generate two alternative outcomes with prompting. Introduced behavioral activation — scheduled a 10-min draft email task for Wednesday.',
  'Assessment/Level of Participation:': 'Client engaged and motivated. Good insight into avoidance pattern. Moderate anxiety, improving from last session.',
  'Plan:': '',
};

// ── Maps generic section names to EHR note field labels ──────────────────────
export const SECTION_TO_NOTE_FIELD = {
  'Data':       'Data/Goal:',
  'Assessment': 'Assessment/Level of Participation:',
  'Plan':       'Plan:',
};
