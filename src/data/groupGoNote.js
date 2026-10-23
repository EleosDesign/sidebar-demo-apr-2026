// Authorized Test Client reference rows; not AI suggestion destinations.
export const GROUP_GO_OBJECTIVES = [
  { goal: '1', id: '1.01', text: 'Client will develop and use at least two skills and strategies to help manage thoughts that cause anxiety' },
  { goal: '2', id: '2.01', text: 'Client will journal 4 x weekly about situations that caused anxiety' },
];
export const GROUP_GO_STATUSES = ['', 'Achieved', 'Deterioration', 'Moderate Improvement', 'No Change', 'Discontinued', 'Some Improvement'];
export const GROUP_GO_RESPONSE_LABEL = 'Describe the client’s response to the intervention, progress made towards goals and client’s strengths. If progress is not being made, describe reasons and barriers to progress';
export const supportsGroupGO = ehr => ehr === 'streamline' || ehr === 'calmhsa';
export const groupNoteForEhr = ehr => supportsGroupGO(ehr) ? 'GroupGONote' : 'GroupNote';
