// ── Default DAP suggestions ───────────────────────────────────────────────────
export const SUGGESTIONS_DATA = [
  { section: 'Data', cards: [
    { field: 'Session Focus', content: 'Client presented concerns about ongoing conflict with manager at work. Reported difficulty sleeping and elevated anxiety. Behavioral activation homework was reviewed and partially completed.', type: 'text', showActions: true },
    { field: 'Client Engagement', chips: ['Engaged', 'Motivated', 'Verbally expressive'], type: 'chips' },
    { field: 'Homework Compliance', content: 'Partial — completed 3 of 5 planned exposures.', type: 'text' },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Progress', content: 'Client demonstrated improved insight into avoidance patterns. GAD symptoms remain present but client reports using coping strategies more consistently.', type: 'text', showActions: true },
    { field: 'Risk', chips: ['No SI/HI reported', 'Safety plan reviewed'], type: 'chips' },
    { field: 'Mood', content: 'Anxious, improving', type: 'text' },
  ]},
  { section: 'Plan', cards: [
    { field: 'Next Steps', content: 'Continue weekly CBT sessions. Focus on cognitive restructuring around workplace conflict. Review sleep hygiene strategies at next session.', type: 'text', showActions: true },
    { field: 'Homework', chips: ['Thought record ×3/week', 'Sleep log'], type: 'chips' },
    { field: 'Follow-up', content: 'Schedule in 1 week', type: 'text' },
  ]},
];

// ── Psychiatry / Med Management suggestions ───────────────────────────────────
export const PSYCH_SUGGESTIONS_DATA = [
  { section: 'Chief Complaint', cards: [
    { field: 'Chief Complaint', content: 'Routine follow-up for medication management and to address ongoing stressors.', type: 'text', showActions: true },
  ]},
  { section: 'History of Illness', cards: [
    { field: 'History of Illness', content: 'Patient is a female who presents for a follow-up visit. She reports significant ongoing stress since the last visit. She was unable to find new housing due to high costs, describing the situation as "real expensive." Work remains "pretty stressful" as new hires are still in training and have not yet alleviated her workload. Her husband has returned from deployment, and the family is adjusting to having him home. The children are on summer break, which she describes as "super crazy." Patient reports her depression is a 6/10 and her anxiety is a 7/10. She identifies her anxiety as a trigger for smoking and reports it is exacerbated by her children screaming and by criticism from her boss, which causes her to "shut down" and engage in excessive worry. She continues to use marijuana a few times per week for stress and sleep, finding it calming. She avoids her prescribed sleep medication because it makes her feel "some kind of way." She reports sleeping 7-8 hours but still feels tired. The patient also reports recent use of non-prescribed pain medication for back pain, with use increasing from weekly to near-daily. Patient denies any suicidal or homicidal ideation, psychosis (seeing or hearing things), chest pain, shortness of breath, or nausea/vomiting.', type: 'text', showActions: true },
  ]},
  { section: 'Medication History and Side Effects', cards: [
    { field: 'Medication History and Side Effects', content: 'Current medications discussed: Unspecified sleep medication (reported non-adherence), Sertraline (to be discontinued), non-prescribed pain medication (brought home by husband), marijuana. Medical issues discussed: Back pain. Patient reports that her unspecified sleep medication makes her feel "some kind of way," leading to non-adherence. She denies other adverse effects from current medications.', type: 'text', showActions: true },
  ]},
  { section: 'Family and Social History', cards: [
    { field: 'Family and Social History', content: 'Patient reports ongoing stress related to being unable to find affordable housing. She is employed, but finds her job stressful. Her husband recently returned from deployment, and she notes it is good to have his help with their children, who are currently home for summer break.', type: 'text', showActions: true },
  ]},
  { section: 'Mental Status', cards: [
    { field: 'Mental Status', content: 'Behavior: Cooperative with the interview, maintains good eye contact. No psychomotor agitation or retardation noted. Speech: Normal rate, rhythm, and volume. Coherent and articulate. Mood: Reports feeling "not too depressed" and "anxious." Rates depression a 6/10 and anxiety a 7/10. Affect: Congruent with reported mood, though somewhat constricted and notable for worry. Thought Process: Linear, logical, and goal-directed. Thought Content: Preoccupied with psychosocial stressors (housing, work, family). Reports excessive worry, particularly after negative interactions at work. Denies suicidal ideation, homicidal ideation, delusions, or paranoia. Insight/Judgment: Insight into stressors is fair. Judgment is impaired regarding her use of non-prescribed pain medication and other substances as coping mechanisms.', type: 'text', showActions: true },
  ]},
  { section: 'Interventions', cards: [
    { field: 'Interventions', content: 'Psychoeducation was provided on the risks of using non-prescribed pain medication, including dependence and potential withdrawal, with strong recommendation to see her PCP. The various options for nicotine replacement therapy were discussed, with specific instructions on the proper use of nicotine gum (chew and park method). The psychiatrist also provided information on the potential side effects (nausea, headache) of the new antidepressant. Brief counseling on nutrition, including meal prepping and adequate hydration, was offered.', type: 'text', showActions: true },
  ]},
  { section: 'Therapeutic Interventions', cards: [
    { field: 'Therapeutic Interventions', content: 'The psychiatrist utilized supportive psychotherapy to explore the patient\'s feelings about current life stressors. Motivational interviewing techniques were employed to assess her readiness to change her smoking habits and to address her use of non-prescribed pain medication. The patient engaged well in the discussion.', type: 'text', showActions: true },
  ]},
  { section: 'Summary', cards: [
    { field: 'Summary', content: 'The patient continues to manage multiple psychosocial stressors, including housing instability, work pressure, and family adjustments following her husband\'s return from deployment. She reports significant anxiety, which appears to be a primary driver for her continued use of tobacco, marijuana, and alcohol, as well as recent escalating use of non-prescribed opioid pain medication. The treatment plan was adjusted to better target anxiety symptoms by switching her primary antidepressant and providing a PRN anxiolytic. Nicotine replacement therapy was initiated to support smoking cessation efforts, and she was strongly counseled to see her PCP for her back pain.', type: 'text', showActions: true },
  ]},
  { section: 'Plan', cards: [
    { field: 'Plan', content: '1. Discontinue Sertraline. 2. Start Citalopram 20 mg by mouth once daily to better target symptoms of anxiety and depression. 3. Start Hydroxyzine (Vistaril) 25 mg, take 1 to 2 tablets by mouth every 6 hours as needed for anxiety. 4. Start Nicotine gum 4 mg, chew 1 piece every hour as needed for cravings. Do not exceed 20 pieces in 24 hours. 5. Patient was strongly counseled to schedule an appointment with her primary care provider for evaluation of her back pain and to discontinue use of non-prescribed pain medication. She was advised of the risk of withdrawal. 6. Return to clinic in 4-6 weeks for follow-up to assess medication efficacy and tolerability.', type: 'text', showActions: true },
  ]},
];

// ── Audio-session suggestions (James Edwards capture flow) ────────────────────
export const AUDIO_SUGGESTIONS_DATA = [
  { section: 'Data', cards: [
    { field: 'Session Focus', content: 'Client discussed a recent relapse following a stressful family gathering. Reported increased depressive symptoms and substance cravings over the past week. High-risk triggers were identified from session transcript and reviewed together.', type: 'text', showActions: true },
    { field: 'Client Engagement', chips: ['Initially resistant', 'Opened up mid-session', 'Motivated toward end'], type: 'chips' },
    { field: 'Homework Compliance', content: 'Partial — maintained sobriety log but did not contact sponsor as planned.', type: 'text' },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Progress', content: 'Client remains in early recovery with significant ambivalence. PHQ-9 score: 12 (moderate). Recent relapse is a setback; continued engagement in treatment is a positive indicator. Coping skill use is inconsistent.', type: 'text', showActions: true },
    { field: 'Risk', chips: ['No SI/HI reported', 'Substance use risk elevated', 'Safety plan reviewed and updated'], type: 'chips' },
    { field: 'Mood', content: 'Discouraged, intermittently hopeful', type: 'text' },
  ]},
  { section: 'Plan', cards: [
    { field: 'Next Steps', content: 'Increase session frequency to twice weekly for the next month. Coordinate with prescribing physician regarding medication adjustment. Address family dynamics contributing to relapse risk in upcoming sessions.', type: 'text', showActions: true },
    { field: 'Homework', chips: ['Daily mood log', 'Call sponsor ×3/week', 'Practice grounding technique daily'], type: 'chips' },
    { field: 'Follow-up', content: 'Schedule in 3 days', type: 'text' },
  ]},
];

// ── Case Management suggestions ───────────────────────────────────────────────
export const CASE_MGMT_SUGGESTIONS_DATA = [
  { section: 'Subjective', cards: [
    { field: 'Subjective', content: 'Client stated, "It has been hard to leave the house." He shared a history of experiencing these feelings during this season.', type: 'text', showActions: true },
  ]},
  { section: 'Objective', cards: [
    { field: 'Objective', content: 'The session took place at the client\'s home, where he appeared receptive to discussion about his difficulties.', type: 'text', showActions: true },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Assessment', content: 'Client is struggling with feelings of depression, particularly during the current season, but he denied any desire to harm himself.', type: 'text', showActions: true },
  ]},
  { section: 'Plan', cards: [
    { field: 'Plan', content: 'Case Manager will refer client to a virtual support group for individuals struggling with depression. The case manager will follow up with the client next week to evaluate if he was able to start attending the group.', type: 'text', showActions: true },
  ]},
];

// ── Treatment Plan suggestions — Trisha Platts ────────────────────────────────
export const TREATMENT_PLAN_SUGGESTIONS_DATA = [
  { section: 'Presenting Problems', cards: [
    { field: 'Substance Use', content: 'The client reports a history of substance use that is interfering with her ability to regain custody of her son. She expresses ambivalence about change, stating she doesn\'t believe it is a \'big issue,\' but acknowledges she needs to work on it. She identifies her friends and her partner, Justin, as triggers for use.', type: 'text', showActions: true },
    { field: 'Educational And Vocational Barriers', content: 'The client has obtained her GED but expresses a desire for further education to \'get a better job\' upon release and provide for her son. She identifies financial cost and time management, particularly balancing work, school, and parenting, as significant barriers.', type: 'text', showActions: true },
    { field: 'Parenting Stress', content: 'The client reports feeling \'really overwhelmed taking care of\' her son, Jake, and indicates there is \'a lot of stress around that\' for her.', type: 'text', showActions: true },
    { field: 'Antisocial Peer Associations', content: 'The client\'s social network, including her friends and partner, appear to be connected to her substance use and \'offending\' behavior. The client states that when she is around them, she uses substances.', type: 'text', showActions: true },
  ]},
  { section: 'Treatment Goals', cards: [
    { field: 'Achieve Higher Education', content: 'The client\'s long-term goal is to obtain a two-year associate\'s degree to secure a career that is both fulfilling (\'help people\') and provides sufficient income to independently support her son, Jake.', type: 'text', showActions: true },
    { field: 'Reduce Harm From Substance Use', content: 'The client and provider agreed on the goal to \'significantly reduce\' substance use. While the client is not committed to abstinence, she is willing to work towards this goal to improve her chances of regaining custody of her son.', type: 'text', showActions: true },
  ]},
  { section: 'Interventions or Services', cards: [
    { field: 'Educational Case Management', content: 'Provider will assist the client by researching college entrance exam requirements, providing a pass for extra computer time for research, and offering support in completing college applications.', type: 'text', showActions: true },
    { field: 'Motivational Interviewing', content: 'Provider will use motivational interviewing techniques, including a cost-benefit analysis and exploring the client\'s self-rated motivation (5/10), to address ambivalence and build intrinsic motivation for reducing substance use.', type: 'text', showActions: true },
    { field: 'Referral To On-Site Programming', content: 'Provider will provide information about on-site substance use support groups and will explore options for the client to participate in the facility\'s substance abuse treatment wing.', type: 'text', showActions: true },
    { field: 'Accountability And Progress Monitoring', content: 'Provider will follow up on the client\'s completion of assigned tasks and will verify attendance at support group meetings by checking in with the group facilitator.', type: 'text', showActions: true },
  ]},
  { section: 'Measurable Objectives', cards: [
    { field: 'Explore Educational Options', content: 'By the next session, the client will use approved computer time to research potential college options, including a local community college, to identify programs of interest.', type: 'text', showActions: true },
    { field: 'Prepare For College Entrance', content: 'Within the next 30 days, the client will work with provider to identify and prepare for a college entrance or placement exam.', type: 'text', showActions: true },
    { field: 'Increase Motivation For Change', content: 'By the next session, the client will complete a cost-benefit analysis worksheet, focusing on identifying the positive outcomes of changing her substance use and the negative consequences of continuing her use.', type: 'text', showActions: true },
    { field: 'Engage In Sober Support', content: 'Before the next weekly session, the client will attend two on-site support group meetings to begin building a pro-social support network.', type: 'text', showActions: true },
  ]},
];

// ── Assessment suggestions ────────────────────────────────────────────────────
export const ASSESSMENT_SUGGESTIONS_DATA = [
  { section: 'Initial Information', cards: [
    { field: 'Presenting Problem', content: 'The client is a 23-year-old female university student presenting for an initial assessment due to concerns about anxiety and alcohol use. She reports that her anxiety, which she describes as "nervousness," has been a long-standing issue since her early teens and is now impacting multiple areas of her life, including academics. She also identifies a pattern of drinking alcohol to cope with social anxiety, which has led to negative consequences such as blackouts and poor academic performance. The client states she is seeking help now because things have "not been fantastic" and she is worried they will "get worse."', type: 'text', showActions: true },
  ]},
  { section: 'Mental Health Current and History', cards: [
    { field: 'Anxiety Symptoms And History', content: 'The client reports experiencing symptoms of anxiety since approximately age 13 or 14. She describes these symptoms as a persistent "nervousness" related to various life stressors, including social situations, school, work, and graduating college. She currently rates her anxiety as a 6 out of 10. She reports the most recent peak in anxiety (10/10) occurred last weekend. When her anxiety is high, she sometimes experiences a low or "down" mood. The client feels her anxiety is "trickling into every area of her life now."', type: 'text', showActions: true },
    { field: 'Previous Mental Health Treatment', content: 'The client has a history of brief mental health treatment. A few years ago, she saw a counselor for approximately five or six sessions and a psychiatrist once or twice. She states she was told she had "some sort of anxiety disorder," possibly a general one. The client reports that she was not "on board with the whole therapy thing at that point" and did not believe it would help, so she discontinued treatment. She now feels she is in a different state of mind and is ready to engage in and commit to therapy, stating, "I want the help now."', type: 'text', showActions: true },
  ]},
  { section: 'Medical - Current and History', cards: [
    { field: 'Current Health Status', content: 'The client reports being in good physical health. She is physically active, engaging in activities such as going to the gym and practicing yoga. She denies any current serious or chronic medical conditions.', type: 'text', showActions: true },
    { field: 'Medical History And Medications', content: 'The client\'s only reported surgical history is an appendectomy. She states her only current medication is an oral contraceptive ("the pill"). She denies any other prescribed medications for physical or mental health conditions.', type: 'text', showActions: true },
  ]},
  { section: 'Substance Use - Current and History', cards: [
    { field: 'Alcohol Use History And Pattern', content: 'The client reports first using alcohol at age 14. Her use has progressed from social experimentation to a primary coping mechanism for anxiety. She states she drinks when going out with friends, and while it helps her "relax" and "have fun," she is concerned because she sometimes drinks more than intended, leading to negative consequences. These consequences include making "bad decisions," experiencing hangovers that impact her ability to attend or perform in her college classes, and occasional blackouts. The last reported blackout occurred approximately one month ago. She states that her drinking is more frequent now than when she was younger and is used as a "tool to get through the anxiety."', type: 'text', showActions: true },
  ]},
  { section: 'ASAM', cards: [
    { field: 'Dimension 1: Acute Intoxication And/Or Withdrawal Potential', content: 'Substance(s) used: Alcohol. Date & time of most-recent use: Not specified. Route of administration: Oral. Typical quantity/pattern: Reports drinking when going out, sometimes to excess, resulting in hangovers and occasional blackouts. Current signs of intoxication: None observed during the interview. History of withdrawal symptoms: Not assessed. Prior detox/withdrawal complications: Not assessed.', type: 'text', showActions: true },
    { field: 'Dimension 2: Biomedical Conditions & Complications', content: 'Current medical conditions: None reported. Acute medical complaints: None reported. Chronic illnesses impacting care: None reported. Surgeries/hospitalizations: History of appendectomy. Infectious disease status (HIV/HBV/HCV): Not assessed. Pain issues: None reported. Pregnancy status: Not pregnant; the client reports using oral contraceptives.', type: 'text', showActions: true },
    { field: 'Dimension 3: Emotional, Behavioral, Or Cognitive Conditions & Complications', content: 'Active psychological / behavioral / emotional / cognitive conditions: the client reports significant anxiety, describing it as nervousness that impacts her functioning. Past psychiatric diagnoses: Reports being told she had "some sort of anxiety disorder" by a previous counselor. Reported or observed cognitive functioning: Appears intact; thought process is linear and organized. Reported self-harm or homicidal thoughts/behaviors: Denies any history of suicidal or homicidal ideation. Psychotropic medications & response: None currently or historically reported. Stabilizing factors: Reports a supportive boyfriend. Reported or observed management of ADLs: Appears to be managing ADLs without difficulty. Stated connection between current signs/symptoms and SUD: the client explicitly states she uses alcohol to manage her social anxiety symptoms, saying it helps her "relax and have fun."', type: 'text', showActions: true },
    { field: 'Dimension 4: Readiness To Change', content: 'Internal motivation statements: "I realize now that I\'m not handling it as well as I thought I was," "It\'s affecting other areas of my life," and "I want the help now." External pressures (legal, family, work): University professors have confronted her about poor academic performance and showing up to class with a hangover. Change goals voiced by the client: To lessen her anxiety and to reduce her alcohol consumption. Confidence in the ability to change (0-10): Not explicitly rated. Importance of change (0-10): Not explicitly rated, but the client contrasts her current motivation with her past lack of readiness for treatment.', type: 'text', showActions: true },
    { field: 'Dimension 5: Relapse, Continued Use, Or Continued Problem Potential', content: 'Longest period of abstinence: Not specified, but reports periods of being "off and on" with her anxiety and drinking. The client\'s description of recent cravings or triggers: Identifies social situations and feelings of anxiety as primary triggers for drinking. Coping skills the client reports using: Primarily uses alcohol to cope with anxiety. Situations the client identifies as difficult or that precede use: Reports that when she tries to go out without drinking, she feels "uncomfortable," "tense," and "confused." The client\'s reported history of overdose or relapse: No overdose history reported; reports occasional blackouts, with the last one about a month ago. Consequences of use mentioned by the client (medical, legal, social): Poor academic performance, being confronted by professors, making "bad decisions," and hangovers. What the client says she knows about her personal triggers: Identifies social situations and anxiety as triggers.', type: 'text', showActions: true },
    { field: 'Dimension 6: Recovery/Living Environment', content: 'Current living situation: Lives in a university dorm on campus and returns to her parents\' home most weekends. Supportive household members: Parents are aware of her anxiety and provide financial support. The client reports a supportive boyfriend of six months. Evidence of peer/social supports (sober or using): Reports having two close college friends she can rely on. Other social contacts are part of the "going out" and drinking environment. Employment/financial stability: Not currently employed consistently; is financially supported by her parents. Transportation access: Appears to have adequate transportation, traveling between campus and home regularly. Threats to safety: Reports a history of emotional abuse from her father, which causes distress.', type: 'text', showActions: true },
  ]},
  { section: 'Risk Assessment', cards: [
    { field: 'Risk To Self And Others', content: 'The client explicitly denies any history of suicidal ideation, plans, or intent, stating "never" when asked. She also denies any history of homicidal ideation, stating she is a "nice person." No history of suicide attempts was reported. No self-harm behaviors were discussed. Protective factors include future-oriented goals (graduating, getting a job) and a supportive relationship with her boyfriend.', type: 'text', showActions: true },
  ]},
  { section: 'Psychosocial Assessment', cards: [
    { field: 'Relationships And Social Support', content: 'The client has been in a relationship with her boyfriend for six months, whom she describes as supportive and aware of her struggles with anxiety. She identifies two close friends from college whom she feels she can rely on. Her broader social circle is associated with a university party culture. Her relationship with her older sister is distant, described as a "Merry Christmas, Happy Easter kind of relationship."', type: 'text', showActions: true },
    { field: 'Spiritual Beliefs', content: 'The client identifies as Catholic and reports a belief in God. She does not consider herself to be actively practicing but states that her faith is "there." She identifies prayer as a potential resource she could draw upon for strength during treatment.', type: 'text', showActions: true },
  ]},
  { section: 'Family - Current and History', cards: [
    { field: 'Family Composition And Dynamics', content: 'The client\'s immediate family consists of her mother, father, and one older sister. She resides on campus during the week and returns to her parents\' home on weekends. The relationship with her parents is strained, particularly with her father. Her relationship with her sister, a successful doctor, is described as distant and superficial. She reports a dynamic of being unfavorably compared to her sibling by her father.', type: 'text', showActions: true },
    { field: 'History Of Emotional Abuse', content: 'The client reports a history of significant emotional abuse from her father. She provided examples of harsh and invalidating statements he has made, such as "I can\'t believe you\'re my daughter" and telling her not to identify herself as her daughter in public. She states that this constant comparison to her "ideal" sister has been a source of significant distress and does not "foster a great relationship." She reports she has become "numb" to these comments over time, but they still feel "annoying" and painful.', type: 'text', showActions: true },
  ]},
  { section: 'Housing / Financial / Food / Transportation', cards: [
    { field: 'Financial And Housing Stability', content: 'The client is currently a full-time university student and is financially dependent on her parents. She lives in a dormitory on campus during the school week and returns to her parents\' home on most weekends. While she is not happy with this financial arrangement and desires to be independent, she states it "works for now." No issues related to housing instability, food insecurity, or lack of transportation were reported.', type: 'text', showActions: true },
  ]},
  { section: 'Education / Employment / Legal - Current and History', cards: [
    { field: 'Education And Employment', content: 'The client is a senior in college pursuing a degree in education with the goal of becoming a teacher. Her academic performance is currently a source of stress, as her anxiety and the consequences of her alcohol use (e.g., hangovers, missing class) are negatively impacting her grades. She reports that her professors have begun to confront her about her performance. She has past work experience in babysitting and retail but is not working much currently due to her academic commitments.', type: 'text', showActions: true },
    { field: 'Legal History', content: 'The client reports one past incident of legal involvement at age 14 or 15. She was caught shoplifting with friends while under the influence of alcohol. The incident involved the police and her parents being called. She believes she may have a criminal record as a result of this event but reports no subsequent legal issues.', type: 'text', showActions: true },
  ]},
  { section: 'Functioning', cards: [
    { field: 'Functional Impairment', content: 'The client\'s functioning is most significantly impaired in the academic domain. Symptoms of anxiety and the consequences of alcohol use are directly impacting her ability to attend class and maintain her grades, jeopardizing her goal of graduation. Socially, she relies on alcohol to manage anxiety, which suggests an impairment in her ability to navigate social situations without substance use. Her ability to manage ADLs and IADLs appears intact. Cognitively, her ability to understand, remember, and apply information seems unimpaired outside the context of substance use.', type: 'text', showActions: true },
  ]},
  { section: 'MSE', cards: [
    { field: 'Mental Status Examination', content: 'The client was cooperative and engaged throughout the interview. Mood appeared euthymic with underlying anxiety. Affect was congruent with the topics discussed and appropriate in range, though it became more constricted and she appeared sad when discussing her father\'s comments. Speech was clear, with a normal rate, rhythm, and volume. Thought process was consistently linear, logical, and goal-directed. There was no evidence of delusions, hallucinations, or other perceptual disturbances. Insight is assessed as fair to good; she demonstrates an awareness of her anxiety and problematic alcohol use and expresses a clear motivation for change. Judgment appears to be impaired when under the influence of alcohol, as evidenced by her reports of making "bad decisions," but was intact during the session.', type: 'text', showActions: true },
  ]},
  { section: 'Strengths / Barriers', cards: [
    { field: 'Client Strengths', content: 'The client demonstrates significant strengths, including being articulate, intelligent, and insightful about her presenting problems. She is highly motivated for treatment at this time, stating, "I\'m ready now." She identifies herself as a "hard worker" and has a supportive boyfriend and two close friends. She is future-oriented, with clear goals of graduating college and becoming a teacher.', type: 'text', showActions: true },
    { field: 'Barriers To Treatment', content: 'Potential barriers include a long-standing pattern of using alcohol as a primary coping mechanism for anxiety. The history of emotional abuse and invalidation from her father may present challenges in developing self-worth and trust. Her distant relationship with her family may limit her sources of familial support.', type: 'text', showActions: true },
  ]},
  { section: 'Supervision Capacity', cards: [
    { field: 'Dependents', content: 'The client has no dependents; this domain is not applicable.', type: 'text', showActions: true },
  ]},
  { section: 'Adverse Childhood Events', cards: [
    { field: 'Emotional Abuse', content: 'The client endorsed experiencing emotional abuse from her father during her adolescence. She reported he would make humiliating and insulting comments, such as, "I can\'t believe you\'re my daughter," and would compare her unfavorably to her older sister. This was reported to be a recurring pattern that caused significant emotional distress. She stated the emotional impact now is that she is "numb" to it.', type: 'text', showActions: true },
  ]},
  { section: 'Assessments Completed', cards: [
    { field: 'Assessments', content: 'No formal assessment tools were administered during this initial intake session.', type: 'text', showActions: true },
  ]},
  { section: 'Treatment Plan/Goals', cards: [
    { field: 'Client Goals For Treatment', content: 'The client identified three primary goals for treatment: 1) To lessen the symptoms and impact of her anxiety. 2) To reduce her alcohol consumption and develop healthier coping strategies. 3) To successfully navigate her final year of college and graduate.', type: 'text', showActions: true },
  ]},
  { section: 'Assessment Disposition', cards: [
    { field: 'Disposition', content: 'A specific disposition or plan for the next session was not explicitly discussed at the conclusion of the interview.', type: 'text', showActions: true },
  ]},
  { section: 'Interpretive Summary', cards: [
    { field: 'Interpretive Summary', content: 'The client is a 23-year-old female college senior presenting with symptoms of long-standing anxiety and a pattern of maladaptive alcohol use, which she identifies as a coping mechanism for social distress. These interconnected issues are causing significant impairment in her academic functioning and personal well-being, prompting her to seek services. A key contributing factor to her distress appears to be a history of paternal emotional invalidation and unfavorable comparisons to her sibling, which has likely impacted her self-concept. Although a previous, brief course of therapy was unsuccessful due to a stated lack of readiness, the client now presents as highly motivated and ready to engage in treatment. Her strengths include strong self-awareness, intelligence, and a supportive network that includes her boyfriend and close friends. Her stated goals are to reduce anxiety, moderate her drinking, and successfully complete her education. The focus of treatment will be to address these goals by developing healthier coping skills, exploring the function of her alcohol use, and processing the impact of her family dynamics on her current mental health.', type: 'text', showActions: true },
  ]},
];

// ── Anger Management Group suggestions ───────────────────────────────────────
export const ANGER_GROUP_SUGGESTIONS_DATA = [
  { section: 'Overall Summary', cards: [
    { field: 'Overall Summary', content: 'The anger management support group session, facilitated by this writer, began with introductions and a brief overview of group rules, emphasizing confidentiality and respectful communication. This writer then initiated a check-in activity, asking participants to identify with an animal and explain their choice. This transitioned into a discussion of the reasons for attending the group, with participants disclosing their anger management related concerns. A common theme emerged around the impact of emotions on personal well-being, relationships, and family dynamics, particularly for those with children. This writer validated the participants\' disclosures, acknowledged their vulnerability, and highlighted the courage it takes to seek support. The session concluded with this writer prompting participants to reflect on their personal goals for the group.', type: 'text', showActions: true },
  ]},
  { section: 'Tyler', cards: [
    { field: 'Tyler', content: 'Tyler chose a turtle during the check-in activity, expressing feelings of boredom and slowness. When asked to elaborate on why he was attending the group, he disclosed that his wife had been frustrating him. When the writer asked him to clarify what he meant by "bored," Tyler reiterated that those were his wife\'s words and explained that his daily routine involved caring for his children. He also expressed that it wasn\'t necessarily wrong for him to be angry, and acknowledged that it is probably better to figure out why he was lashing out and address that issue. Later, when it was mentioned that children can serve as a motivating factor to remain in the group, Tyler expressed that his motivation was rooted in his desire for a brighter future, and better emotional regulation.', type: 'text', showActions: true },
  ]},
  { section: 'Connor', cards: [
    { field: 'Connor', content: 'Connor chose his cat, Bella, because of her constant happiness, a state he desired for himself. He shared that he joined the group to stop lashing out at family, explaining that although he doesn\'t believe he drinks excessively, he has been unable to stop when he has tried which leads to outburst of anger. He expressed having two daughters whose mother passed away a few years prior and felt a need to invest more energy in them. Connor described drinking as his "me time" after his daughters go to bed and acknowledged that this habit might be indicative of a deeper emotional need. He stated that his drinking affects his energy levels and contributes to poor sleep and fatigue. Connor also said that his kids are a motivator for him to be a better father and example. He also wanted to commit to raising his children correctly and is trying to do so by participating in treatment. This writer pointed out to the group that Connor and another group member both have children and asked how they feel being in treatment while also caring for and modeling behavior for their children.', type: 'text', showActions: true },
  ]},
  { section: 'Jeff', cards: [
    { field: 'Jeff', content: 'Jeff chose a shark, stating his love for the ocean and sharks. When asked why he was in the group, he did not immediately respond. Later in the group session, this writer observed that Jeff appeared somewhat hesitant about being in the group and asked him how he felt. Jeff confirmed that his husband wanted him to attend treatment because he recognized he had a problem. While Jeff acknowledged that taking the outburst of anger were probably not the best and that figuring out the root cause may be beneficial, he said he did not believe that his anger had negatively impacted him or put his children in danger.', type: 'text', showActions: true },
  ]},
  { section: 'Allison', cards: [
    { field: 'Allison', content: 'Allison chose a jellyfish during the check-in, appreciating their beauty and the ocean environment. She identified feelings of fear as her primary concern, explaining it leads to anger and other emotions she can\'t control. Allison recognized that caffeine use wasn\'t healthy and expressed a goal of cutting back or eliminating it from her life. She agreed with another group participant about taking a step towards growth by attending group therapy. She appreciated how addressing her fear and anger brought awareness to the underlying issues, which motivated her to seek help now. Allison also expressed gratitude for the group environment. This writer commended another participant for her self-awareness in recognizing a potential problem early on and for taking steps to address it. This intervention resonated with Allison.', type: 'text', showActions: true },
  ]},
  { section: 'Participant 1', cards: [
    { field: 'Participant 1', content: 'Participant 1 shared an animal in response to the icebreaker prompt but did not elaborate beyond a brief statement. They did not verbally contribute to the remainder of the group discussion and did not respond to follow-up prompts.', type: 'text', showActions: true },
  ]},
];

// ── SUD Group suggestions ─────────────────────────────────────────────────────
export const SUD_GROUP_SUGGESTIONS_DATA = [
  { section: 'Group Summary', cards: [
    { field: 'Group Summary', content: 'Therapist facilitated the first session of an 8-week substance abuse support group. The stated purpose was to provide a confidential space for members to address substance use issues. Therapist established group norms, including confidentiality and respectful communication. Interventions included using an icebreaker question to build rapport, psychoeducation on group logistics, and direct questioning to explore members\' reasons for attending and their motivations for change. Therapist also utilized normalization by commending participants for attending and sharing her own recovery status to foster connection. The session concluded with a directive for participants to reflect on their personal goals for the group.', type: 'text', showActions: true },
  ]},
  { section: 'Lisette', cards: [
    { field: 'Client Response to Intervention(s)', content: 'The patient was engaged and responsive. She identified as a turtle in an icebreaker, stating she feels tired and slow. She reported that her drinking escalated recreationally after a breakup and moving away from her family, and it has now become a daily craving she cannot control. She stated she wants to get better for herself and to have a brighter future.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'The patient reported escalating alcohol use to the point of daily cravings and an inability to go for long periods without drinking (Dimension 1). She identified external stressors, such as a breakup and isolation from family, as triggers for her initial increased use (Dimension 6). Her stated motivation is internal, wanting a \'brighter\' future for herself (Dimension 4).', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'The patient affirmed another participant\'s statement, agreeing that seeking help was a significant step forward rather than pretending to have her drinking under control.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Plans For Next Steps', content: 'No next steps were discussed.', type: 'text', showActions: true },
  ]},
  { section: 'Bethany', cards: [
    { field: 'Client Response to Intervention(s)', content: 'The patient was engaged and actively participated. She responded to the icebreaker, stating she would be a jellyfish. She identified her presenting issue as an addiction to caffeine that began in college and which she now recognizes as unhealthy. She expressed a desire to regain a sense of control over her life as her primary motivation for change.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'The patient reported a compulsive use of caffeine that she feels she is no longer in control of (Dimension 1). She expressed a strong desire to cut back or quit, citing a need to feel in control as her motivation (Dimension 4). She also demonstrated insight by acknowledging her concern that this pattern could lead to addiction to other substances, such as alcohol, in the future (Dimension 5).', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'The patient agreed with another participant, stating that addressing her caffeine use now could prevent a more harmful addiction from developing later.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Plans for Next Steps', content: 'The patient stated a plan to \'cut back on it or try to cut it out\' of her life.', type: 'text', showActions: true },
  ]},
  { section: 'Tara', cards: [
    { field: 'Client Response to Intervention(s)', content: 'The patient participated in all activities but appeared ambivalent about treatment. She stated she was present because her husband discovered her using his pain medication. She relayed her husband\'s belief that she uses due to boredom as a stay-at-home mother. When questioned by therapist, the patient conceded it was best to address why she was using the pills. She also identified not wanting her children to witness her substance use as a motivating factor.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'The patient disclosed non-prescribed use of her husband\'s pain medication (Dimension 1). Her presence in treatment is due to external pressure from her spouse, although she also identified an internal motivation to be a good parent (Dimension 4). She reported \'boredom\' as a potential driver for her use, suggesting a possible underlying issue related to life satisfaction (Dimension 3). Her recovery environment includes her husband, who prompted her treatment, and her children, whom she does not want to be aware of her use (Dimension 6).', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'No significant peer interactions were noted.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Plans for Next Steps', content: 'The patient stated she should \'figure out why I was taking them and address that\'.', type: 'text', showActions: true },
  ]},
  { section: 'John', cards: [
    { field: 'Client Response to Intervention(s)', content: 'The patient was open and engaged. He shared that he wants to stop drinking alcohol but finds himself unable to stop on his own. He is a widower with two daughters and stated his primary motivation is to have more energy for them. He described a nightly drinking pattern that leads to poor sleep and fatigue, which he characterized as a \'sad little me time\'.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'The patient reported an inability to control his alcohol consumption and has been unsuccessful in attempts to quit on his own (Dimension 1). His use results in fatigue, which impacts his functioning (Dimension 2). The patient is a widower, indicating potential co-occurring grief (Dimension 3). He expressed strong motivation for change centered on his desire to be a more present and energetic father for his two daughters (Dimension 4). His recovery environment includes being the sole parent to two children (Dimension 6).', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'In response to a group question about parenting, the patient stated that his children are a primary reason for his being in treatment.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Next Steps', content: 'No next steps were discussed.', type: 'text', showActions: true },
  ]},
  { section: 'Participant 1', cards: [
    { field: 'Client Response to Intervention(s)', content: 'Participant 1 participated in the icebreaker activity and provided a brief response to the prompt but did not elaborate further. They did not verbally engage in subsequent group discussion and did not respond to questions regarding substance use history or motivation for treatment. No additional information was shared during this session.', type: 'text', showActions: true },
    { field: 'ASAM-Relevant Disclosures', content: 'No ASAM-relevant disclosures were made.', type: 'text', showActions: true },
    { field: 'Significant Peer Interactions', content: 'No significant peer interactions were reported.', type: 'text', showActions: true },
    { field: 'Explicitly Stated Plans for Next Steps', content: 'No next steps were discussed or identified by the participant.', type: 'text', showActions: true },
  ]},
];

// ── Larry Quinn suggestions (recovery / partner / boundary-setting) ────────────
// Key Moments format (default). DAP format toggled via "Use my EHR note headers" (avatar menu).
export const LARRY_QUINN_SUGGESTIONS_DATA = [
  { section: 'Key Moments', cards: [
    { field: 'Relationship & Living Situation', content: 'The therapist and client discussed the client\'s relationship with his partner, including their current living situation and the possibility of her moving back in.', type: 'text', showActions: true },
    { field: 'Codependency & Early Recovery', content: 'The therapist shared concerns about the potential challenges of a codependent dynamic, especially during early recovery, and emphasized the importance of both the client and his partner maintaining their individual recovery.', type: 'text', showActions: true },
  ]},
  { section: 'Interventions', cards: [
    { field: 'Boundary Setting', content: 'Client was encouraged to establish clear boundaries with his partner and explored what those boundaries might look like in practice, highlighting their importance for both his own well-being and that of his family.', type: 'text', showActions: true },
    { field: 'Motivational Interviewing', content: 'Motivational interviewing techniques were used to strengthen the client\'s commitment to recovery and to support him in taking actionable steps toward his goals.', type: 'text', showActions: true },
    { field: 'Psychoeducation', content: 'The therapist provided psychoeducation on the benefits of family sessions for couples in recovery, particularly in improving communication and relationship functioning.', type: 'text', showActions: true },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Engagement & Receptivity', content: 'The client appeared engaged, open, and receptive throughout the session. He demonstrated a clear commitment to his recovery and a willingness to take necessary steps to support both himself and his family.', type: 'text', showActions: true },
    { field: 'Insight', content: 'The client showed insight into the importance of setting boundaries, particularly within his relationship, as a way to foster a more stable and healthy environment.', type: 'text', showActions: true },
  ]},
  { section: 'Plan', cards: [
    { field: 'Treatment & Sobriety', content: 'The client will continue participating in his current treatment and maintaining sobriety.', type: 'text', showActions: true },
    { field: 'Boundaries', content: 'He will establish and uphold clear boundaries regarding his partner\'s potential move-in, with an emphasis on her commitment to treatment and sobriety.', type: 'text', showActions: true },
    { field: 'Family Therapy', content: 'Additionally, the client will consider participating in family therapy sessions to further strengthen relationship dynamics and communication.', type: 'text', showActions: true },
  ]},
];

// ── Larry Quinn DAP suggestions (shown when "Use My EHR Note Headers" is ON) ──
export const LARRY_QUINN_DAP_DATA = [
  { section: 'Data', cards: [
    { field: 'Data', content: "The therapist and client discussed the client's relationship with his partner, including their current living situation and the possibility of her moving back in. The therapist shared concerns about the potential challenges of a codependent dynamic, especially during early recovery. Therapist placed emphasis on the importance of both the client and his partner maintaining their individual recovery, noting that this would support both their personal well-being and the health of their relationship. Client was encouraged to establish clear boundaries with his partner and explored what those boundaries might look like in practice, highlighting their importance for both his own well-being and that of his family. Motivational interviewing techniques were used to strengthen the client's commitment to recovery and to support him in taking actionable steps toward his goals. The therapist also provided psychoeducation on the benefits of family sessions for couples in recovery, particularly in improving communication and relationship functioning.", type: 'text', showActions: true },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Assessment', content: "The client appeared engaged, open, and receptive throughout the session. He demonstrated a clear commitment to his recovery and a willingness to take necessary steps to support both himself and his family. The client showed insight into the importance of setting boundaries, particularly within his relationship, as a way to foster a more stable and healthy environment.", type: 'text', showActions: true },
  ]},
  { section: 'Plan', cards: [
    { field: 'Plan', content: "The client will continue participating in his current treatment and maintaining sobriety. He will establish and uphold clear boundaries regarding his partner's potential move-in, with an emphasis on her commitment to treatment and sobriety. Additionally, the client will consider participating in family therapy sessions to further strengthen relationship dynamics and communication.", type: 'text', showActions: true },
  ]},
];

// ── Progress Note suggestions (Jacob Rosen case management) ───────────────────
export const PROGRESS_NOTE_SUGGESTIONS_DATA = [
  { section: 'Progress Note', cards: [
    { field: 'Note Addresses Which Objective', content: 'The purpose of this session was to evaluate the client\'s mental status, support him in managing depressive symptoms, and discuss coping strategies.', type: 'text', showActions: true },
    { field: 'Describe Details of the Case Management Service', content: 'The session took place at a local park near the client\'s home. The client expressed symptoms of increased depression, stating, "It has been hard to leave the house." He shared a history of seasonal mood shifts, particularly during winter. The discussion included utilizing the DBT Wise Mind approach to assist him in accessing both intuitive and rational thinking when making decisions.', type: 'text', showActions: true },
    { field: 'Explain Linkage to Services', content: 'The Wise Mind technique is integral in helping the client balance emotional responses with logical reasoning, which can enhance his decision-making and problem-solving capabilities.', type: 'text', showActions: true },
    { field: 'Clinical Observations', content: 'During the mental status exam, the client\'s mood was noted to be depressed. Nevertheless, he denied any suicidal ideation (SI) and agreed to a safety plan.', type: 'text', showActions: true },
    { field: 'Client Responses', content: 'The client demonstrated willingness to reach out for support as needed, indicating a degree of proactive engagement in his treatment process.', type: 'text', showActions: true },
    { field: 'Progress Towards Recovery Plan Objectives', content: 'Despite ongoing struggles with depression, the client has shown progress by being open about his feelings and agreeing to utilize coping strategies, including the safety planning discussed during the session.', type: 'text', showActions: true },
    { field: 'Timelines for Next Service', content: 'The client agreed to reach out for additional support as he navigates his depressive symptoms moving forward.', type: 'text', showActions: true },
  ]},
];

// ── Jacob Rosen audio session suggestions ─────────────────────────────────────
export const JACOB_AUDIO_SUGGESTIONS_DATA = [
  { section: 'Key Moments', cards: [
    { field: 'Relationship & Living Situation', content: 'The therapist and client discussed the client\'s relationship with his partner, including their current living situation and the possibility of her moving back in.', type: 'text', showActions: true },
    { field: 'Codependency & Early Recovery', content: 'The therapist shared concerns about the potential challenges of a codependent dynamic, especially during early recovery, and emphasized the importance of both the client and his partner maintaining their individual recovery.', type: 'text', showActions: true },
  ]},
  { section: 'Interventions', cards: [
    { field: 'Boundary Setting', content: 'Client was encouraged to establish clear boundaries with his partner and explored what those boundaries might look like in practice, highlighting their importance for both his own well-being and that of his family.', type: 'text', showActions: true },
    { field: 'Motivational Interviewing', content: 'Motivational interviewing techniques were used to strengthen the client\'s commitment to recovery and to support him in taking actionable steps toward his goals.', type: 'text', showActions: true },
    { field: 'Psychoeducation', content: 'The therapist provided psychoeducation on the benefits of family sessions for couples in recovery, particularly in improving communication and relationship functioning.', type: 'text', showActions: true },
  ]},
  { section: 'Assessment', cards: [
    { field: 'Engagement & Receptivity', content: 'The client appeared engaged, open, and receptive throughout the session. He demonstrated a clear commitment to his recovery and a willingness to take necessary steps to support both himself and his family.', type: 'text', showActions: true },
    { field: 'Insight', content: 'The client showed insight into the importance of setting boundaries, particularly within his relationship, as a way to foster a more stable and healthy environment.', type: 'text', showActions: true },
  ]},
  { section: 'Plan', cards: [
    { field: 'Treatment & Sobriety', content: 'The client will continue participating in his current treatment and maintaining sobriety.', type: 'text', showActions: true },
    { field: 'Boundaries', content: 'He will establish and uphold clear boundaries regarding his partner\'s potential move-in, with an emphasis on her commitment to treatment and sobriety.', type: 'text', showActions: true },
    { field: 'Family Therapy', content: 'Additionally, the client will consider participating in family therapy sessions to further strengthen relationship dynamics and communication.', type: 'text', showActions: true },
  ]},
];

// ── Add Summary Panel — tag options and text summary ─────────────────────────
export const TAG_OPTIONS = {
  Data: ['Session attended', 'Client engaged', 'Client resistant', 'Homework reviewed', 'Homework not completed', 'Psychoeducation provided', 'Skills practice', 'Self-report: mood improved', 'Self-report: mood declined'],
  Assessment: ['Progress noted', 'Goals on track', 'Risk assessed – low', 'Risk assessed – moderate', 'Safety plan reviewed', 'Substance use discussed', 'Mood stabilizing', 'Insight improving', 'Barriers identified'],
  Plan: ['Continue weekly sessions', 'Follow-up in 2 weeks', 'Homework assigned', 'Safety plan updated', 'Referral submitted', 'Consult psychiatry', 'Review at next session', 'Increase session frequency'],
};

export const TAG_FILTERS = {
  Data: [
    { label: 'All',        tags: null },
    { label: 'Engagement', tags: ['Session attended', 'Client engaged', 'Client resistant'] },
    { label: 'Homework',   tags: ['Homework reviewed', 'Homework not completed'] },
    { label: 'Skills',     tags: ['Psychoeducation provided', 'Skills practice'] },
    { label: 'Mood',       tags: ['Self-report: mood improved', 'Self-report: mood declined'] },
  ],
  Assessment: [
    { label: 'All',      tags: null },
    { label: 'Progress', tags: ['Progress noted', 'Goals on track', 'Insight improving'] },
    { label: 'Risk',     tags: ['Risk assessed – low', 'Risk assessed – moderate', 'Safety plan reviewed'] },
    { label: 'Mood',     tags: ['Mood stabilizing', 'Substance use discussed'] },
    { label: 'Barriers', tags: ['Barriers identified'] },
  ],
  Plan: [
    { label: 'All',      tags: null },
    { label: 'Sessions', tags: ['Continue weekly sessions', 'Follow-up in 2 weeks', 'Review at next session', 'Increase session frequency'] },
    { label: 'Homework', tags: ['Homework assigned'] },
    { label: 'Safety',   tags: ['Safety plan updated', 'Referral submitted'] },
    { label: 'Clinical', tags: ['Consult psychiatry'] },
  ],
};

export const TEXT_SUMMARY_BULLETS = [
  '• Cln met w ct at local park near ct home',
  '• Ct expressed sx of ^ depression, "It has been hard to leave the house"',
  '• Ct shared hx of seasonal mood shifts in winter',
  '• Cln validated ct and discussed DBT Wise Mind',
  '• Ct denied SI and agreed to safety plan',
  '• Ct will reach out for support as needed',
];
