// Keys must match EhrContext's clientName format ("Last, First").
// String value = forced + locked. Array value = restricted options list.
export const CLIENT_LOCK_RULES = {
  'Quinn, Larry': {
    sessionType: 'Individual Therapy',
    setting: ['In Person', 'Telehealth'],
    noteType: 'Progress Note',
  },
};
