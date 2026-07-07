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
};
