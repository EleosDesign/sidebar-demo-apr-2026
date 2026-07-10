// ── Date helpers ──────────────────────────────────────────────────────────────
export const MONTH_ABBREVS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return { month: MONTH_ABBREVS[d.getMonth()], day: String(d.getDate()) };
}

export const MONTH_FULL = {
  Jan:'January', Feb:'February', Mar:'March', Apr:'April', May:'May', Jun:'June',
  Jul:'July', Aug:'August', Sep:'September', Oct:'October', Nov:'November', Dec:'December',
};

// ── Sessions shown in "My Activities" list ────────────────────────────────────
// New clients (today–4 days ago) appear first; existing clients follow (5–8 days ago)
export const SESSION_LIST = [
  // ── New clients ─────────────────────────────────────────────────────────────
  { id: 'jacob',       ...daysAgo(0), name: 'Jacob Rosen',            time: '2:00 – 2:45 PM',     type: 'individual', sessionType: 'text',  noteType: 'Progress Note',         isActive: false, summary: 'Session addressed depressive symptoms and low motivation. Client reported minimal engagement in previously enjoyed activities. Behavioral activation plan updated — added two low-effort pleasant activities for the week.' },
  { id: 'larry',       ...daysAgo(1), name: 'Larry Quinn',            time: '9:00 – 9:45 AM',     type: 'individual', sessionType: 'audio', liveQA: true, noteType: 'Individual Audio', isActive: false, summary: 'Client discussed his partner\'s potential return to the shared home and the challenges of maintaining boundaries in early recovery. Explored codependency dynamics and the importance of both partners maintaining individual recovery. Family therapy discussed as a next step.' },
  { id: 'calvin',      ...daysAgo(1), name: 'Calvin Murphy',          time: '11:00 – 11:45 AM',   type: 'individual', sessionType: 'text',  noteType: 'Case Management',       isActive: false, summary: 'The client expressed experiencing seasonal depression and shared a winter seasonal mood shift. The client stated, "it\'s been hard to leave the house".' },
  { id: 'trisha',      ...daysAgo(2), name: 'Trisha Platts',          time: '1:00 – 1:45 PM',     type: 'individual', sessionType: 'text',  noteType: 'Treatment Plan',        isActive: false, summary: 'Client presented with ambivalence around substance use and its impact on ongoing custody proceedings for her son. Explored educational and vocational goals. Treatment plan developed targeting harm reduction, educational advancement, and improved parenting capacity.' },
  { id: 'anger-grp',   ...daysAgo(2), name: 'Anger Management Group', time: '3:00 – 4:00 PM',     type: 'group',      sessionType: 'audio', groupSuggestions: 'single', noteType: 'Anger Management Group', isActive: false, summary: '7 members present. Reviewed cognitive restructuring techniques for anger triggers. Role-played de-escalation scenarios. Two members shared successful use of time-out strategy since last session. Group cohesion strong.' },
  { id: 'jacob-audio', ...daysAgo(3), name: 'Jacob Rosen',            time: '2:00 – 2:45 PM',     type: 'individual', sessionType: 'audio', noteType: 'Individual Audio',       isActive: false, summary: 'Client discussed his relationship with his partner and the possibility of her moving back in. Explored codependency concerns in early recovery. Boundary setting and family therapy were discussed as next steps.' },
  { id: 'sud-grp',     ...daysAgo(3), name: 'SUD Group',              time: '10:00 – 11:00 AM',   type: 'group',      sessionType: 'audio', groupSuggestions: 'multiple', includesASAM: true, noteType: 'SUD Group', isActive: false, summary: '5 of 6 members attended. Topic: managing cravings in social settings. Members shared strategies including urge surfing and exit planning. One member disclosed a slip — group responded with support and non-judgment. Safety plan reviewed.' },
  { id: 'patricia',    ...daysAgo(3), name: 'Patricia Rodriguez',     time: '1:00 – 1:45 PM',     type: 'individual', sessionType: 'audio', specialty: 'psychiatry', noteType: 'Med Management', isActive: false, summary: 'Client reported increased anxiety following medication adjustment. Discussed somatic symptoms and their relationship to health anxiety. Introduced interoceptive exposure rationale. Client hesitant but willing to try graduated approach.' },
  { id: 'ashlyn',      ...daysAgo(4), name: 'Ashlyn Rivera',          time: '10:30 – 11:15 AM',   type: 'individual', sessionType: 'audio', noteType: 'Assessment',             isActive: false, summary: 'Audio session captured and transcribed. AI-generated suggestions are ready for EHR review.' },
  // ── Existing clients ────────────────────────────────────────────────────────
  { id: 'marcus',      ...daysAgo(5), name: 'Marcus Webb',            time: '10:00 – 10:45 AM',   type: 'individual', sessionType: 'text',                                       isActive: true,  summary: 'Client reported significant work-related stress and anxiety around manager conflict. Avoidance patterns discussed; behavioral activation task assigned for the week.' },
  { id: 'priya',       ...daysAgo(6), name: 'Priya Nair',             time: '2:00 – 2:45 PM',     type: 'individual', sessionType: 'audio',                                      isActive: false, summary: 'Reviewed progress on sleep hygiene goals. Client reports improvement — averaging 7 hrs/night. Discussed upcoming family visit as potential stressor. Coping strategies reviewed.' },
  { id: 'ryan',        ...daysAgo(6), name: 'Ryan Cho',               time: '4:00 – 4:45 PM',     type: 'individual', sessionType: 'text',                                       isActive: false, summary: 'Session focused on distress tolerance skills. Client practiced TIPP technique in session. Reported two episodes of self-harm urges this week; safety plan reviewed and updated.' },
  { id: 'carmen',      ...daysAgo(7), name: 'Carmen Vega',            time: '1:30 – 2:15 PM',     type: 'individual', sessionType: 'text',                                       isActive: false, summary: 'Follow-up on exposure hierarchy progress. Client completed 3 of 5 planned exposures. Reported SUDS peak of 65, returning to 20 within 15 min. Strong progress noted.' },
  { id: 'group-thu',   ...daysAgo(8), name: 'Thursday AM Group',      time: '9:00 – 10:00 AM',    type: 'group',      sessionType: 'audio',                                      isActive: false, summary: 'Group focused on interpersonal effectiveness. 6 of 8 members present. Discussion on boundary-setting in workplace relationships. Homework: identify one boundary to practice this week.' },
  { id: 'aisha',       ...daysAgo(8), name: 'Aisha Monroe',           time: '11:00 – 11:45 AM',   type: 'individual', sessionType: 'audio',                                      isActive: false, summary: 'Initial assessment session. Client presenting with moderate depression following recent job loss. PHQ-9 score: 14. Treatment goals established. Weekly CBT sessions recommended.' },
];

// ── Marked as Done list ───────────────────────────────────────────────────────
export const MARKED_DONE_LIST = [
  { id: 'done-sarah',  ...daysAgo(4),  name: 'Sarah Smith',         time: '11:00 – 11:45 AM', type: 'individual', sessionType: 'audio', summary: 'Client reported PTSD symptoms, including feeling more on edge, agitated, and upset with the staff. Discussed grounding techniques and reviewed safety plan. Progress on exposure work noted.' },
  { id: 'done-james',  ...daysAgo(6),  name: 'James Okafor',        time: '9:00 – 9:50 AM',   type: 'individual', sessionType: 'text',  summary: 'Session centered on medication adherence and mood tracking. Client missed two doses this week. Psychoeducation provided. PHQ-9 score improved from 16 to 11 since last session.' },
  { id: 'done-group2', ...daysAgo(6),  name: 'Tuesday PM Group',    time: '3:00 – 4:00 PM',   type: 'group',      sessionType: 'audio', summary: 'DBT skills group — emotion regulation module. 7 members present. Role-play exercises on opposite action. Group cohesion strong; members supported one another through check-in.' },
  { id: 'done-elena',  ...daysAgo(8),  name: 'Elena Torres',        time: '1:00 – 1:45 PM',   type: 'individual', sessionType: 'text',  summary: 'Continued work on cognitive restructuring around perfectionism. Client identified three automatic thoughts and successfully reframed two. Homework assigned: thought record for work situations.' },
  { id: 'done-david',  ...daysAgo(9),  name: 'David Nguyen',        time: '2:30 – 3:15 PM',   type: 'individual', sessionType: 'audio', summary: 'Relapse prevention session. Client has 60 days sobriety — celebrated milestone. Reviewed high-risk situations for upcoming holiday weekend. Coping plan updated collaboratively.' },
  { id: 'done-fatima', ...daysAgo(9),  name: 'Fatima Al-Rashid',    time: '4:00 – 4:45 PM',   type: 'individual', sessionType: 'text',  summary: 'Initial intake session. Presenting concerns: generalized anxiety, difficulty concentrating at work. GAD-7 score: 18. Client oriented to CBT model. Weekly sessions scheduled.' },
  { id: 'done-group3', ...daysAgo(11), name: 'Monday Wellness Grp', time: '10:00 – 11:00 AM', type: 'group',      sessionType: 'audio', summary: 'Mindfulness-based stress reduction group. 5 members. Guided body scan practice, followed by psychoeducation on stress response. Members reported reduced tension post-practice.' },
  { id: 'done-carlos', ...daysAgo(11), name: 'Carlos Rivera',       time: '2:00 – 2:45 PM',   type: 'individual', sessionType: 'audio', summary: 'Follow-up on anger management skills. Client used time-out technique twice this week — successful de-escalation both times. Partner reported positive changes at home.' },
  { id: 'done-linda',  ...daysAgo(14), name: 'Linda Park',          time: '11:00 – 11:50 AM', type: 'individual', sessionType: 'text',  summary: 'Session focused on grief processing following loss of mother. Client moved through avoidance into initial engagement with bereavement. Referred to grief support group as adjunct.' },
  { id: 'done-tony',   ...daysAgo(14), name: 'Tony Marchetti',      time: '3:30 – 4:15 PM',   type: 'individual', sessionType: 'audio', summary: 'Trauma-focused CBT session, phase 2. Narrative exposure work initiated. SUDS peaked at 72, returned to 28 by session end. Client reported sense of accomplishment afterward.' },
];

// ── Combined pool (EHR + Done) ────────────────────────────────────────────────
export const ALL_SESSIONS = [
  ...SESSION_LIST,
  ...MARKED_DONE_LIST,
];

export const INITIAL_DONE_IDS = new Set(MARKED_DONE_LIST.map(s => s.id));
