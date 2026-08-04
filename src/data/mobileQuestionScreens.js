// The six cosmetic check-in screens shown between capture and suggestions in Mobile Mode.
// Sourced from the reference mobile prototype's documented screen progression
// (physicalPresentation -> moodAffect -> interventions -> topicsAddressed ->
// progressTowardsGoals -> nextSteps). Answers here are for demo feel only —
// they don't feed the generated note/suggestions.
export const MOBILE_QUESTION_SCREENS = [
  {
    key: 'physicalPresentation',
    title: 'Physical Presentation',
    type: 'multi',
    options: ['Well-groomed', 'Disheveled', 'Appropriate dress', 'Inappropriate dress', 'Good hygiene', 'Poor hygiene', 'Relaxed', 'Tense'],
  },
  {
    key: 'moodAffect',
    title: 'Mood & Affect',
    type: 'single',
    options: ['Euthymic', 'Anxious', 'Depressed', 'Irritable', 'Elevated', 'Labile', 'Congruent', 'Incongruent'],
  },
  {
    key: 'interventions',
    title: 'Interventions',
    type: 'multi',
    options: ['Cognitive Behavioral Therapy', 'Solution-Focused Therapy', 'Motivational Interviewing', 'Psychoeducation', 'Crisis Intervention', 'Supportive Counseling', 'Other'],
    allowOtherText: true,
  },
  {
    key: 'topicsAddressed',
    title: 'Topics Addressed',
    type: 'multi',
    options: ['Anxiety', 'Depression', 'Relationships', 'Substance Use', 'Trauma', 'Anger Management', 'Coping Skills', 'Goal Setting'],
  },
  {
    key: 'progressTowardsGoals',
    title: 'Progress Towards Goals',
    type: 'single',
    options: ['Excellent progress', 'Good progress', 'Some progress', 'Little progress', 'No progress', 'Regression'],
  },
  {
    key: 'nextSteps',
    title: 'Next Steps',
    type: 'multi',
    options: ['Continue current treatment plan', 'Adjust medication', 'Increase session frequency', 'Decrease session frequency', 'Referral to specialist', 'Discharge planning', 'Crisis plan update', 'Goal revision'],
  },
];
