// Structural content and helpers for Psychiatric Note (Streamline & CalMHSA SmartCare)

export const supportsPsychiatricNote = ehr => ehr === 'streamline' || ehr === 'calmhsa';

export const PSYCH_NOTE_TABS = [
  'General',
  'MSE',
  'Medical Decision Making',
  'AIMS',
  'Diagnosis',
  'Psychotherapy',
];

export const ROS_SYSTEMS = [
  { id: 'Psychiatric', label: 'Psychiatric' },
  { id: 'Musculoskeletal', label: 'Musculoskeletal' },
  { id: 'Constitutional', label: 'Constitutional (wt loss, etc.)' },
  { id: 'Ear', label: 'Ear, Nose, Mouth, Throat' },
  { id: 'Genitourinary', label: 'Genitourinary' },
  { id: 'Gastrointestinal', label: 'Gastrointestinal' },
  { id: 'Integumentary', label: 'Integumentary' },
  { id: 'Endocrine', label: 'Endocrine' },
  { id: 'Neurological', label: 'Neurological' },
  { id: 'Immune', label: 'Immune' },
  { id: 'Eyes', label: 'Eyes' },
  { id: 'Respiratory', label: 'Respiratory' },
  { id: 'Cardio', label: 'Cardio/Vascular' },
  { id: 'HemLymph', label: 'Hem/Lymph' },
  { id: 'AllOthersNegative', label: 'All others negative' },
];

export const SUBSTANCE_USE_ITEMS = [
  { id: 'Alcohol', label: 'Alcohol' },
  { id: 'Amphetamines', label: 'Amphetamines' },
  { id: 'Benzos', label: 'Benzos or Prescription Meds' },
  { id: 'Cocaine', label: 'Cocaine' },
  { id: 'Marijuana', label: 'Marijuana' },
  { id: 'Opiates', label: 'Opiates' },
  { id: 'Hallucinogen', label: 'Hallucinogen' },
  { id: 'Inhalant', label: 'Inhalant' },
  { id: 'Others', label: 'Others' },
];

export const MSE_DOMAINS = [
  {
    id: 'appearance',
    title: 'General Appearance',
    wnlText: 'WNL – Appropriately dressed and groomed for the occasion',
    items: [
      'Poorly dressed', 'Poorly groomed', 'Disheveled', 'Odiferous', 'Deformities',
      'Poor nutrition', 'Restless', 'Psychomotor retardation', 'Hyperactive/intrusive',
      'Evasive/distant', 'Inattentive', 'Poor eye contact', 'Hostile', 'Other',
    ],
  },
  {
    id: 'speech',
    title: 'Speech',
    wnlText: 'WNL – non-pressured, with normal rate, tone, latency',
    items: [
      'Increased latency', 'Decreased rate', 'Paucity', 'Hyperverbal',
      'Poor articulation', 'Loud', 'Soft', 'Mute',
      'Stuttering', 'Impaired prosody', 'Pressured', 'Other',
    ],
  },
  {
    id: 'language',
    title: 'Language',
    wnlText: 'WNL - no issues naming objects or repeating phrases',
    items: ['Difficulty naming objects', 'Difficulty repeating phrases', 'Non-Verbal', 'Other'],
  },
  {
    id: 'mood',
    title: 'Mood and Affect',
    wnlText: 'WNL – mood and affect euthymic and congruent',
    items: [
      'Mood: Happy', 'Mood: Sad', 'Mood: Anxious', 'Mood: Angry', 'Mood: Irritable', 'Mood: Normal',
      'Affect: Euthymic', 'Affect: Dysphoric', 'Affect: Anxious', 'Affect: Blunted/flat', 'Affect: Labile', 'Affect: Congruent w/mood',
    ],
  },
  {
    id: 'attention',
    title: 'Attention Span and Concentration',
    wnlText: 'WNL-with good concentration and attention span',
    items: ['Poor concentration', 'Poor attention span', 'Distractible', 'Other'],
  },
  {
    id: 'thought',
    title: 'Thought Content and Process; Cognition',
    wnlText: 'WNL for age – coherent and goal directed with no evidence of abnormal or delusional thought content',
    items: [
      'Disorganized', 'Blocking', 'Racing', 'Illogical',
      'Delusional', 'Paranoid', 'Ideas of Reference', 'Thought insertion', 'Thought Broadcasting',
      'Concrete', 'Unable to follow instructions', 'Other',
    ],
  },
  {
    id: 'associations',
    title: 'Associations',
    wnlText: 'WNL - Intact',
    items: ['Loose', 'Clanging', 'Word salad', 'Circumstantial', 'Tangential', 'Other'],
  },
  {
    id: 'psychosis',
    title: 'Abnormal/Psychotic Thoughts',
    wnlText: 'WNL- no disturbance of perception',
    items: [
      'Auditory hallucinations', 'Visual hallucinations', 'Command hallucinations', 'Delusions',
      'Preoccupation w/violence', 'Tactile hallucinations', 'Illusions', 'Other',
    ],
  },
  {
    id: 'orientation',
    title: 'Orientation',
    wnlText: 'WNL – Oriented to person, place, time, situation',
    items: ['Person', 'Place', 'Time', 'Situation', 'Other'],
  },
  {
    id: 'insight',
    title: 'Insight and Judgement',
    wnlText: 'WNL for developmental level',
    items: ['Excellent', 'Good', 'Fair', 'Poor', 'Grossly Impaired', 'Substance related', 'Other'],
  },
  {
    id: 'memory',
    title: 'Memory',
    wnlText: 'WNL – Immediate, recent, and remote memory intact',
    items: ['Immediate Impaired', 'Recent Impaired', 'Remote Impaired', 'Other'],
  },
];

export const AIMS_ITEMS = [
  { id: 'facialExpression', label: '1. Muscles of Facial Expression (e.g., movements of forehead, eyebrows, periorbital area, cheeks; include frowning, blinking, smiling, grimacing)' },
  { id: 'lipsPerioral', label: '2. Lips and Perioral Area (e.g., puckering, pouting, smacking)' },
  { id: 'jaw', label: '3. Jaw (e.g., biting, clenching, chewing, mouth opening, lateral movement)' },
  { id: 'tongue', label: '4. Tongue (rate only increase in movement both in and out of mouth, not inability to sustain movement)' },
  { id: 'extremitiesUpper', label: '5. Extremity Movements: Upper (arms, wrists, hands, fingers)' },
  { id: 'extremitiesLower', label: '6. Extremity Movements: Lower (legs, knees, ankles, toes)' },
  { id: 'neckShouldersHips', label: '7. Trunk Movements (neck, shoulders, hips)' },
  { id: 'severityMovements', label: '8. Global Judgement: Severity of abnormal movements' },
  { id: 'incapacitation', label: '9. Incapacitation due to abnormal movements' },
  { id: 'awareness', label: '10. Patient\'s awareness of abnormal movements' },
];

export const AIMS_SCALE_OPTIONS = [
  '0 = None',
  '1 = Minimal, maybe extreme normal',
  '2 = Mild',
  '3 = Moderate',
  '4 = Severe',
];

export const AIMS_SEVERITY_OPTIONS = [
  '0 = None, Normal',
  '1 = Minimal',
  '2 = Mild',
  '3 = Moderate',
  '4 = Severe',
];

export const AIMS_AWARENESS_OPTIONS = [
  '0 = No awareness',
  '1 = Aware, no distress',
  '2 = Aware, mild distress',
  '3 = Aware, moderate distress',
  '4 = Aware, severe distress',
];

export const MDM_COMPLEXITY_OPTIONS = [
  '',
  'Self-Limited or Minor Problem',
  'Stable chronic illness',
  'Acute, uncomplicated illness or injury',
  'Chronic illnesses with exacerbation, progression, or side effects of treatment',
  'Undiagnosed new problem with uncertain prognosis',
  'Acute illness with systemic symptoms',
  'Acute, complicated injury',
];

export const PSYCH_GO_OBJECTIVES = [
  { goal: '1', id: '1.01', text: 'Client will develop and use at least two skills and strategies to help manage thoughts that cause anxiety' },
  { goal: '2', id: '2.01', text: 'Client will journal 4 x weekly about situations that caused anxiety' },
];

export const PSYCH_GO_STATUSES = [
  '',
  'Achieved',
  'Deterioration',
  'Moderate Improvement',
  'No Change',
  'Discontinued',
  'Some Improvement',
];
