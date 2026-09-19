export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  TASKS: '/tasks',
  NOTIFICATIONS: '/notifications',
  EMPLOYEE: {
    ROOT: '/employee',
    EMPLOYEES: '/employee',
    USERS: '/employee/users',
  },
  TICKET: {
    ROOT: '/ticket',
    B2B: '/ticket/b2b',
    TURKISH_AIRLINES: '/ticket/turkish-airlines',
  },
  CLIENTS: '/clients',
  VISA: {
    ROOT: '/visa',
    APPLICATIONS: '/visa/applications',
    PACKAGE: '/visa/package',
    INTAKE: '/intake',
  },
  INTAKE: '/intake',
  TRANSLATION: '/translation',
  REFERRAL_LETTERS: '/referal-letters',
  OUTBOUND: '/outbound',
  REPORTS: {
    ROOT: '/reports',
    TURKISH_AIRLINES: '/reports/turkish-airlines',
    REFERRAL_LETTER: '/reports/referral-letter',
  },
  CAFETERIA: '/cafeteria',
  FINANCE: {
    ROOT: '/finance',
    CASH_FLOW: '/finance/cash-flow',
    OVERVIEW: '/finance/overview',
    OFFICES: '/finance/offices',
    SALARY: '/finance/salary',
  },
  PROFILE: '/profile',
  PACKAGES: '/packages',
  PROFESSIONAL_TRANSLATION: {
    ROOT: '/professional-translation',
    OFFICE: '/professional-translation/office',
    DEPARTMENT: '/professional-translation/department',
    POSITION: '/professional-translation/position',
    TRANSLATOR: '/professional-translation/translator',
    CATEGORY: '/professional-translation/category',
  },
};

export function joinPath(...segments) {
  return `/${segments.filter(Boolean).join('/')}`;
}

