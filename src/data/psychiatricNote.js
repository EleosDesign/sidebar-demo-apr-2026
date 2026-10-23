// Structural content for the Psychiatric Note (Streamline & CalMHSA SmartCare).
// Labels mirror the SmartCare reference captured in docs/note-references/core-note-psych/*.json.
// No clinical narrative lives here - only form structure.

export const supportsPsychiatricNote = ehr => ehr === 'streamline' || ehr === 'calmhsa';

export const PSYCH_NOTE_TABS = ['General', 'MSE', 'Medical Decision Making', 'AIMS', 'Diagnosis', 'Psychotherapy'];

export const ROS_SYSTEMS = [
  'Psychiatric', 'Musculoskeletal', 'Constitutional (wt loss, etc.)', 'Ear, Nose, Mouth, Throat',
  'Genitourinary', 'Gastrointestinal', 'Integumentary', 'Endocrine',
  'Neurological', 'Immune', 'Eyes', 'Respiratory',
  'Cardio/Vascular', 'Hem/Lymph', 'All others negative',
];

export const SUBSTANCE_USE_ITEMS = [
  'Alcohol', 'Amphetamines', 'Benzos or Prescription Meds', 'Cocaine', 'Marijuana',
  'Opiates', 'Hallucinogen', 'Inhalant', 'Others',
];

export const PAST_HISTORY_ROWS = [
  { id: 'medHistory', label: 'Medical/Psychiatric History', field: 'medicalHistoryComments' },
  { id: 'famHistory', label: 'Family History', field: 'familyHistoryComments' },
  { id: 'socHistory', label: 'Social/Substance/Legal History', field: 'socialHistoryComments' },
];

const ASSESS = ['Assessed', 'Not Assessed', 'Unable to Assess'];
const ASSESS_ALL = ['Assessed all sections below', 'Not Assessed', 'Unable to Assess'];

// Each MSE domain: radio row (assessment + WNL), then blocks.
// block kinds: checks {heading?, items, cols[]}, text {label?}, yesno {rows}, radios {label, options}, evidence
export const MSE_DOMAINS = [
  { id: 'appearance', title: 'General Appearance', assess: ASSESS,
    wnl: 'WNL – Appropriately dressed and groomed for the occasion',
    blocks: [{ kind: 'checks', items: [
      'Poorly dressed', 'Poorly groomed', 'Disheveled', 'Odiferous', 'Deformities',
      'Poor nutrition', 'Restless', 'Psychomotor retardation', 'Hyperactive/intrusive', null,
      'Evasive/distant', 'Inattentive', 'Poor eye contact', 'Hostile', 'Other'] }] },
  { id: 'speech', title: 'Speech', assess: ASSESS, wnl: 'WNL – non-pressured, with normal rate, tone, latency',
    blocks: [{ kind: 'checks', cols: 4, items: [
      'Increased latency', 'Decreased rate', 'Paucity', 'Hyperverbal',
      'Poor articulation', 'Loud', 'Soft', 'Mute',
      'Stuttering', 'Impaired prosody', 'Pressured', null, 'Other'] }] },
  { id: 'language', title: 'Language', assess: ASSESS, wnl: 'WNL - no issues naming objects or repeating phrases',
    blocks: [{ kind: 'checks', cols: 4, items: ['Difficulty naming objects', 'Difficulty repeating phrases', 'Non-Verbal', 'Other'] }] },
  { id: 'mood', title: 'Mood and Affect', assess: ASSESS, wnl: 'WNL – mood and affect euthymic and congruent',
    blocks: [
      { kind: 'inline', label: 'Mood', items: ['Happy', 'Sad', 'Anxious', 'Angry', 'Irritable', 'Elation', 'Normal', 'Other'], text: true },
      { kind: 'inline', label: 'Affect', items: ['Euthymic', 'Dysphoric', 'Anxious', 'Irritable/angry', 'Blunted/flat', 'Labile', 'Euphoric', 'Congruent w/mood', 'Other'] },
    ] },
  { id: 'attention', title: 'Attention Span and Concentration', assess: ASSESS, wnl: 'WNL-with good concentration and attention span',
    blocks: [{ kind: 'inline', items: ['Poor concentration', 'Poor attention span', 'Distractible', 'Other'] }] },
  { id: 'thought', title: 'Thought Content and Process; Cognition', assess: ASSESS_ALL,
    wnl: 'WNL for age – coherent and goal directed with no evidence of abnormal or delusional thought content',
    blocks: [
      { kind: 'inline', heading: 'Thought Process Abnormalities (leave unchecked if not present)',
        items: ['Disorganized', 'Blocking', 'Persecution', 'Broadcasting', 'Derailed', 'Thought insertion', 'Incoherent', 'Racing', 'Illogical', 'Other'], perRow: 5 },
      { kind: 'inline', heading: 'Thought Content Abnormalities (leave unchecked if not present)',
        items: ['Delusional', 'Paranoid', 'Ideas of Reference', 'Thought insertion', 'Thought withdrawal', 'Thought Broadcasting',
          'Religiosity', 'Grandiosity', 'Perseveration', 'Obsessions', 'Worthlessness', 'Loneliness', 'Guilt', 'Hopelessness', 'Helplessness', 'Other'], perRow: 6 },
      { kind: 'inline', heading: 'Cognitive Abnormalities (leave unchecked if not present)',
        items: ['Concrete', 'Unable to follow instructions', 'Poor Computation', 'Other'], text: true },
    ] },
  { id: 'associations', title: 'Associations', assess: ASSESS_ALL, wnl: 'WNL - Intact',
    blocks: [{ kind: 'inline', items: ['Loose', 'Clanging', 'Word salad', 'Circumstantial', 'Tangential', 'Other'] }] },
  { id: 'psychosis', title: 'Abnormal/Psychotic Thoughts', assess: ASSESS, wnl: 'WNL- no disturbance of perception',
    blocks: [
      { kind: 'radios', label: 'Psychosis/Disturbance of Perception', options: ['None', 'Present'] },
      { kind: 'checks', cols: 4, items: [
        'Auditory hallucinations', 'Visual hallucinations', 'Command hallucinations', 'Delusions',
        'Preoccupation w/violence', 'Olfactory hallucinations', 'Gustatory hallucinations', null,
        'Tactile hallucinations', 'Somatic hallucinations', 'Illusions', 'Other'] },
      { kind: 'risk' },
    ] },
  { id: 'orientation', title: 'Orientation', assess: ASSESS, wnl: 'WNL – Oriented to person, place, time, situation',
    blocks: [
      { kind: 'inline', label: 'Disoriented to', items: ['Person', 'Place', 'Time', 'Situation', 'Other'] },
      { kind: 'evidence', heading: 'As evidenced by responses', prompts: [
        'How would you describe the situation we are in?', 'What is your full name?',
        'Where are we right now? (city, state, building)', 'What is the full date today?(date, month, year) and season of the year'] },
    ] },
  { id: 'knowledge', title: 'Fund of Knowledge', assess: ASSESS, wnl: 'Fund of knowledge WNL for developmental level',
    blocks: [
      { kind: 'inline', items: ['Unaware of current events', 'Unaware of past history', 'Vocabulary inappropriate for age', 'Other'] },
      { kind: 'inline', heading: 'As evidenced by age appropriate',
        items: ['Vocabulary', 'Fund of knowledge', 'Responses to questions', 'School Performance', 'IQ (If testing results are available)', 'Other'] },
    ] },
  { id: 'insight', title: 'Insight and Judgement', assess: ASSESS, wnl: 'WNL for developmental level',
    blocks: [
      { kind: 'inline', items: ['Excellent', 'Good', 'Fair', 'Poor', 'Grossly Impaired', 'Substance related', 'Other'] },
      { kind: 'inline', heading: 'As evidenced by age appropriate',
        items: ['Awareness of problem', 'Acceptance of help', 'Understanding cause and effect', 'Self-defeating/endangering behavior W/O Regard to consequences', 'Denial/Blames Others', 'Other'] },
    ] },
  { id: 'memory', title: 'Memory', assess: ASSESS, wnl: 'WNL – Immediate, recent, and remote memory intact',
    blocks: [{ kind: 'memory', rows: ['Immediate', 'Recent', 'Remote'] }, { kind: 'inline', items: ['Other'] }] },
  { id: 'muscle', title: 'Muscle Strength/Tone', assess: ASSESS, wnl: 'WNL',
    blocks: [{ kind: 'inline', items: ['Atrophy', 'Abnormal Movements', 'Other'] }] },
  { id: 'gait', title: 'Gait and Station', assess: ASSESS, wnl: 'WNL',
    blocks: [{ kind: 'inline', items: ['Restlessness', 'Staggered', 'Shuffling', 'Unstable', 'Other'] }] },
];

export const RISK_ROWS = [
  ['Current suicide ideation', 'Current suicidal plan'],
  ['Current suicidal intent', 'Means to carry out attempt'],
  ['Current homicidal ideation', 'Current homicidal plans'],
  ['Current homicidal intent', 'Means to carry out attempt'],
];

export const AIMS_SECTIONS = [
  { title: 'Facial and Oral Movements', rows: [
    ['facialExpression', 'Muscle of Facial Expression (e.g., movements of forehead, eyebrows, periorbital area, cheeks; including frowning, blinking,smiling, grimacing)'],
    ['lipsPerioral', 'Lips and Perioral Area (e.g., puckering, pouting, smacking)'],
    ['jaw', 'Jaw (e.g., biting, clenching, chewing, mouth opening, lateral movement)'],
    ['tongue', 'Tongue (e.g., Rate only increase in movement both in and out of mouth, NOT inability to sustain movement)'],
  ] },
  { title: 'Extremity Movements', rows: [
    ['extremitiesUpper', 'Upper (arms, wrists, hands, fingers) Include choreic movements, (i.e. rapid, objectively purposeless,irregular, spontaneous),athetoid movements (I.e. slow, irregular, complex, serpentine)Do NOT include tremor (i.e. repetitive, regular, rhythmic)'],
    ['extremitiesLower', 'Lower (legs, knees, ankles, toes) e.g., lateral knee movement, foot tapping, heel dropping, foot squirming, inversion and eversion of foot'],
  ] },
  { title: 'Trunk Movements', rows: [
    ['neckShouldersHips', 'Neck, Shoulders, hips (e.g., rocking, twisting, squirming, pelvic gyrations)'],
  ] },
  { title: 'Global Judgement', rows: [
    ['severityMovements', 'Severity of Abnormal Movements'],
    ['incapacitation', 'Incapacitation Due to Abnormal Movements'],
    ['awareness', 'Patient’s Awareness of Abnormal Movements Rate Only Patient’s Report'],
  ] },
];

export const AIMS_SCALE_OPTIONS = ['', '0 = None', '1 = Minimal, maybe extreme normal', '2 = Mild', '3 = Moderate', '4 = Severe'];

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

export const MDM_DATA_REVIEWED_TOP = ['Review labs/other tests', 'Order labs/other tests', 'Review/summarized old records'];
export const MDM_DATA_REVIEWED_ROWS = [
  'Obtain history from someone other than the patient',
  'Independent Interpretation of a test performed by another physician/other qualified health care professional (not separately reported)',
  'Discussion of management or test interpretation with external physician/other qualified health care professional/appropriate source (not separately reported)',
];

export const MDM_RISK_ITEMS = [
  'Over the Counter Drugs', 'Prescription Drug Management',
  'Diagnosis or treatment significantly limited by social determinants of health', 'Drug therapy requiring intensive monitoring for toxicity',
  'Decision regarding hospitalization', 'Limited quantities of medication for safety reasons',
  'Other',
];

export const ORDER_COLUMNS = ['Order Name', 'Labs', 'Frequency', 'Start Date', 'Diagnosis', 'Clinic/Location'];
export const MED_COLUMNS = ['Drug Name', 'Instructions', 'Start', 'End', 'Refills', 'Prescriber', 'Comments'];
export const MED_TABLES = ['Current Medications', 'Self-Reported Medications', 'Discontinued Medications'];

export const COUNSELING_ACTIVITIES = [
  'Discussed the nature and course of the illness', 'Discussed treatment options',
  'Discussed potential medication side-effects', 'Discussed medication risks and benefits',
  'Discussed pros and cons of hospitalization', 'Discussed laboratory testing results',
  'Discussed pros and cons of out of home placement', 'Discussed behavioral strategies to handle difficult symptoms',
  'Education provided on how to interact with school and other agencies', 'Discussed psychological testing results',
  'Discussed risk factors and strategies to reduce them', 'Education provided on the importance of adherence to treatment recommendations',
  'Education provided on the importance of medication compliance', 'Instructions given on how to start or discontinue a medication',
  'Instructions given on how to remedy medication side-effects', 'Brief alcohol counseling provided',
  'Instructions given on how to enhance the benefits of the medications', 'Discussed PMP report findings with patient',
  'Other',
];

export const NON_COUNSELING_ACTIVITIES = [
  'Completed Documentation', 'Ordered Medications', 'Ordered Labs', 'Consulted with other medical staff',
  'Research', 'Other', 'Reviewed PMP Report',
];

export const DIAGNOSIS_LIST_COLUMNS = ['Order', 'DSM 5/ ICD 10', 'SNOMED', 'R/O', 'ICD/ DSM Description', 'SNOMED Description', 'Type', 'Severity', 'Source', 'Comments'];
