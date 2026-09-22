import { HIDDEN_CLIENT_DROPDOWN_NAMES } from './visibility.js';

// ── Clients list (sidebar Clients tab) ───────────────────────────────────────
export const CLIENTS_LIST = [
  { id: 1,  name: "Jacob Doe" },
  { id: 2,  name: "David Chen" },
  { id: 3,  name: "Maria Garcia" },
  { id: 4,  name: "Liam O'Connor" },
  { id: 5,  name: "Kenji Tanaka" },
  { id: 6,  name: "Chloe Dubois" },
  { id: 7,  name: "Anya Sharma" },
  { id: 8,  name: "Mateo Rossi" },
  { id: 9,  name: "Chloe Jacobson" },
  { id: 10, name: "Samuel Wright" },
];

// ── Client options for Capture Session dropdown ───────────────────────────────
// Keep the complete source list intact; visibility.js controls temporary hiding.
export const ALL_CLIENT_OPTIONS = [
  'Marcus Webb', 'Aisha Monroe', 'Tom Reilly', 'Carmen Vega', 'David Park',
  'Priya Nair', 'James Osei', 'Linda Torres', 'Ryan Cho',
  'Larry Quinn', 'Calvin Murphy', 'Trisha Platts',
  'Anger Management Group', 'SUD Group', 'Patricia Rodriguez', 'Ashlyn Rivera',
];

export const CLIENT_OPTIONS = ALL_CLIENT_OPTIONS.filter(
  name => !HIDDEN_CLIENT_DROPDOWN_NAMES.has(name)
);

export const CLIENT_PRONOUNS = {
  'Marcus Webb': 'He/Him',
  'Aisha Monroe': 'She/Her',
  'Tom Reilly': 'He/Him',
  'Carmen Vega': 'She/Her',
  'David Park': 'He/Him',
  'Priya Nair': 'She/Her',
  'James Osei': 'He/Him',
  'Linda Torres': 'She/Her',
  'Ryan Cho': 'He/Him',
  'Larry Quinn': 'He/Him',
  'Calvin Murphy': 'He/Him',
  'Trisha Platts': 'She/Her',
  'Patricia Rodriguez': 'She/Her',
  'Ashlyn Rivera': 'She/Her',
};

// ── Demo-mode subset (only clients/groups with wired-up content) ─────────────
export const ALL_DEMO_CLIENT_OPTIONS = [
  'Larry Quinn', 'Calvin Murphy', 'Trisha Platts',
  'Patricia Rodriguez', 'Ashlyn Rivera',
  'Anger Management Group', 'SUD Group',
];

export const DEMO_CLIENT_OPTIONS = ALL_DEMO_CLIENT_OPTIONS.filter(
  name => !HIDDEN_CLIENT_DROPDOWN_NAMES.has(name)
);

// ── Demo-mode subset of the sidebar Clients tab ──────────────────────────────
export const DEMO_CLIENTS_LIST = ALL_DEMO_CLIENT_OPTIONS.map((name, i) => ({ id: i + 1, name }));
