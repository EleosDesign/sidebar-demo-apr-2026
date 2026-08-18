// Keys must match EhrContext's clientName format ("Last, First").
// String value = forced + locked. Array value = restricted options list.
// noteType uses note-structures.json keys (e.g. 'ProgressNote'), noteTypeLabel is the UI display name.
export const CLIENT_LOCK_RULES = {
  'Quinn, Larry': {
    sessionType: 'Individual Therapy',
    setting: ['In Person', 'Telehealth'],
    noteType: 'DAP',
    noteTypeLabel: 'Progress Note',
  },
  'Murphy, Calvin': {
    sessionType: 'Case Management',
    setting: 'In Person',
    noteType: 'SOAP',
    noteTypeLabel: 'SOAP Note',
    activityType: 'Case Management',
    population: 'Adult',
  },
  'Rodriguez, Patricia': {
    sessionType: 'Medication Management',
    setting: ['In Person', 'Telehealth'],
    noteType: 'PsychiatricMedical',
    noteTypeLabel: 'Medication Management',
  },
  'Rivera, Ashlyn': {
    sessionType: 'BPS Assessment',
    setting: 'In Person',
    noteType: 'BPSAssessment',
    noteTypeLabel: 'BPS Assessment',
    activityType: 'BPS Assessment',
    population: 'Adult',
  },
  'Group, Anger Management': {
    noteType: 'GroupNote',
    noteTypeLabel: 'Group Note',
  },
  'Group, SUD': {
    noteType: 'GroupNote',
    noteTypeLabel: 'Group Note',
  },
};
