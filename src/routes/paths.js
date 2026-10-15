export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  TASKS: '/tasks',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  CLIENTS: '/clients',
  INTAKE: '/intake',
  TRANSLATION: '/translation',
  REFERRAL_LETTERS: '/referal-letters',
  OUTBOUND: '/outbound',
  INBOUND: '/inbound',
  CAFETERIA: '/cafeteria',
  PACKAGES: '/packages', // Public/All-staff read-only visa package documents

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

  VISA: {
    APPLICATIONS: '/visa/applications',
    PACKAGE: '/visa/package', // Visa package management (admin / editor)
  },

  REPORTS: {
    TURKISH_AIRLINES: '/reports/turkish-airlines',
  },

  FINANCE: {
    ROOT: '/finance',
    CASH_FLOW: '/finance/cash-flow',
    OFFICES: '/finance/offices',
    OFFICE_CASH: '/finance/office-cash',
    SALARY: '/finance/salary',
  },

  PROFESSIONAL_TRANSLATION: {
    ROOT: '/professional-translation',
    OFFICE: '/professional-translation/office',
    DEPARTMENT: '/professional-translation/department',
    POSITION: '/professional-translation/position',
    TRANSLATOR: '/professional-translation/translator',
    CATEGORY: '/professional-translation/category',
    REFERRAL_COUNTRY: '/professional-translation/referral-country',
  },
};
