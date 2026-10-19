export const DEFAULT_PRE_SESSION_BRIEF = {
  scheduledDate: 'Apr 8, 2026',
  dateRange: 'Aug 2024 – Apr 2026',
  sections: [
    {
      heading: 'Recent Trends',
      items: [
        'Work-related anxiety increased across last 4 sessions — remains primary focus',
        'Sleep difficulties correlating with workplace stress — tracking via sleep log',
        'Avoidance patterns identified around conflict conversations with manager',
      ],
      sources: ['Mar 26, 2026', 'Mar 19, 2026'],
    },
    {
      heading: 'Key Updates Since Last Session',
      items: [
        'Behavioral activation homework partially completed — review barriers',
        'Client reports using breathing techniques during stressful work meetings',
        'Continued CBT work on negative thought patterns around performance',
      ],
      sources: ['Mar 26, 2026'],
    },
    {
      heading: 'Active Goals',
      items: [
        'Reduce anxiety symptoms — 50% progress',
        'Improve conflict management at work — 35% progress',
        'Build consistent sleep routine — 45% progress',
      ],
      sources: ['Feb 2026'],
    },
    {
      heading: 'Suggested Focus Areas',
      items: [
        'Follow up on behavioral activation homework completion',
        'Explore cognitive distortions around manager relationship',
        'Review sleep log and reinforce sleep hygiene strategies',
      ],
      sources: ['Mar 26, 2026', 'Feb 2026'],
    },
  ],
};

const PATRICIA_PRE_SESSION_BRIEF = {
  sessionNumber: 12,
  scheduledDate: 'Oct 20, 2026',
  dateRange: 'Aug 2026 – Sep 2026',
  sections: [
    {
      heading: 'Recent Trends',
      items: [
        'Work-related anxiety increased across last 4 therapy sessions — remains primary focus of therapy',
        'Sleep difficulties correlating with workplace stress — tracking via sleep log',
        'Avoidance patterns identified around conflict conversations with manager',
      ],
      sources: ['Sep 26, 2026', 'Sep 19, 2026'],
    },
    {
      heading: 'Key Updates Since Last Session',
      items: [
        'Zoloft 50mg po QD for anxiety started on Sept 28, 2026',
        'Ambien 5mg po QHS for sleep started on Sept 28, 2026',
        'Client reports using breathing techniques during stressful work meetings',
        'Continued CBT work on negative thought patterns around performance',
      ],
      sources: ['Sept 28, 2026'],
    },
    {
      heading: 'Active Goals',
      items: [
        'Reduce anxiety symptoms — 50% progress',
        'Improve conflict management at work — 35% progress',
        'Build consistent sleep routine — 45% progress',
      ],
      sources: ['Sep 2026'],
    },
    {
      heading: 'Suggested Focus Areas',
      items: [
        'Follow up on Zoloft and Ambien effectiveness and side effects',
        'Explore cognitive distortions around manager relationship',
        'Review sleep log and reinforce sleep hygiene strategies',
      ],
      sources: ['Sept 26, 2026', 'Aug 2026'],
    },
  ],
};

export const CLIENT_PRE_SESSION_BRIEFS = {
  'Marlene Oviedo': PATRICIA_PRE_SESSION_BRIEF,
  'Patricia Rodriguez': PATRICIA_PRE_SESSION_BRIEF,
};

export const CLIENT_MEDICATION_REPLIES = {
  'Marlene Oviedo': 'Marlene Oviedo is documented as taking Zoloft 50mg po QD for anxiety and Ambien 5mg po QHS for sleep. Both medications were started on Sept 28, 2026. Follow up on their effectiveness and any side effects during the next session.',
  'Patricia Rodriguez': 'Patricia Rodriguez is documented as taking Zoloft 50mg po QD for anxiety and Ambien 5mg po QHS for sleep. Both medications were started on Sept 28, 2026. Follow up on their effectiveness and any side effects during the next session.',
};
