/**
 * Application Route Paths
 * Structured and ordered to match the exact hierarchy of the Sidebar navigation.
 */
export const PATHS = {
  // --- System & Auth ---
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',

  // --- Sidebar Items (In Exact Display Order) ---
  // 1. Admin Dashboard
  ROOT: '/',

  // 2. Tasks (Ýumuşlar)
  TASKS: '/tasks',

  // 3. Finance (Maliýe)
  FINANCE: {
    ROOT: '/finance',
    CASH_FLOW: '/finance/cash-flow',
    OFFICES: '/finance/offices',
    OFFICE_CASH: '/finance/office-cash',
    SALARY: '/finance/salary',
    TURKISH_AIRLINES_REPORT: '/reports/turkish-airlines',
  },
  REPORTS: {
    TURKISH_AIRLINES: '/reports/turkish-airlines',
  },

  // 4. Clients (Müşderiler)
  CLIENTS: '/clients',

  // 5. Visa Applications (Wiza ýüztutmalar)
  VISA: {
    ROOT: '/visa',
    APPLICATIONS: '/visa/applications',
    PACKAGE: '/visa/package', // Wiza resminamalar dolandyryş (Operator / Editor)
  },

  // 6. Visa Intake (Resminama kabul ediş)
  INTAKE: '/intake',

  // 7. Ticket (Biled)
  TICKET: {
    ROOT: '/ticket',
    B2B: '/ticket/b2b',
    TURKISH_AIRLINES: '/ticket/turkish-airlines',
  },

  // 8. Translation (Terjime)
  TRANSLATION: '/translation',

  // 9. General Settings (Umumy sazlamalar)
  PROFESSIONAL_TRANSLATION: {
    ROOT: '/professional-translation',
    OFFICE: '/professional-translation/office',
    DEPARTMENT: '/professional-translation/department',
    POSITION: '/professional-translation/position',
    TRANSLATOR: '/professional-translation/translator',
    CATEGORY: '/professional-translation/category',
    REFERRAL_COUNTRY: '/professional-translation/referral-country',
  },

  // 10. Referral Letters (Ugradylan hatlar)
  REFERRAL_LETTERS: '/referal-letters',

  // 11. Outbound
  OUTBOUND: '/outbound',

  // 12. Inbound
  INBOUND: '/inbound',

  // 13. Wiza resminamalar (Ähli işgärlere açyk umumy sanaw / Read-only)
  PACKAGES: '/packages',

  // 14. Cafeteria (Kafeteriýa)
  CAFETERIA: '/cafeteria',

  // 15. Employee (Işgärler)
  EMPLOYEE: {
    ROOT: '/employee',
    EMPLOYEES: '/employee',
    USERS: '/employee/users',
  },

  // 16. Notifications (Duýduryşlar)
  NOTIFICATIONS: '/notifications',

  // 17. Profile (Profil)
  PROFILE: '/profile',
};
