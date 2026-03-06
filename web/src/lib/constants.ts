export const ROUTES = {
  HOME: '/',
  PRIORITY_LIST: '/priority-list',
  MAP: '/map',
  PROPERTIES: '/properties',
  SEGMENTS: '/segments',
  ADMIN: '/admin',
} as const;

export const SEGMENT_COLOURS: Record<string, string> = {
  'Long Holder': '#ff1200',
  'Active Looker': '#0043ff',
  'Investor': '#cc8800',
  'Downsizer': '#006633',
  'Upgrader': '#0066aa',
  'Recent Mover': '#446688',
  'Off-Market Potential': '#aa3300',
  'Distressed': '#880000',
};

export const COMPLIANCE = {
  CONTACT_COOLDOWN_DAYS: 14,
  DNC_SEGMENTS: ['Distressed'],
  REVERIFICATION_DAYS: 90,
} as const;