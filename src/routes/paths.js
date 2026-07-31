export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  AGENTS: '/agents',
  BOOKINGS: '/bookings',
  TICKET: {
    ROOT: '/ticket',
    B2B: '/ticket/b2b',
    TURKISH_AIRLINES: '/ticket/turkish-airlines',
  },
  LOGS: '/logs',
  SETTINGS: '/settings',
  CLIENTS: '/clients',
  PLANNER: '/planner',
  SEARCH: '/search',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  EMPLOYEE: {
    ROOT: '/employee',
    USERS: '/employee/users',
  },
  REPORTS: {
    ROOT: '/reports',
    TURKISH_AIRLINES: '/reports/turkish-airlines',
  },
};

export function joinPath(...segments) {
  return `/${segments.filter(Boolean).join('/')}`;
}
