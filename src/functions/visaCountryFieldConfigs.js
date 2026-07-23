/**
 * Visa Intake — Country Field Configurations
 *
 * Each country declares which subset of superset fields its table/form should show,
 * and in what order. VISA_FIELD_DEFS maps each field key to its input type, i18n
 * label key, and grid width so that DynamicVisaField and the column builder are
 * fully data-driven.
 */

// ─── Field Definitions (superset) ─────────────────────────────────────────────
// type: 'date' | 'text' | 'number' | 'select' | 'autocomplete' | 'client_autocomplete'
// labelKey: translation key under visaIntake.fields.*
// gridSize: MUI Grid size for the form (out of 12)
// optionsKey: for 'select' type — references a static options array name
export const VISA_FIELD_DEFS = {
  application_date: {
    type: 'date',
    labelKey: 'visaIntake.fields.applicationDate',
    gridSize: 4,
  },
  operator: {
    type: 'autocomplete',
    labelKey: 'visaIntake.fields.operator',
    optionsKey: 'employees',
    gridSize: 4,
  },
  client_guid: {
    type: 'client_autocomplete',
    labelKey: 'visaIntake.fields.clientFullName',
    gridSize: 12,
  },
  birth_date: {
    type: 'date',
    labelKey: 'visaIntake.fields.birthDate',
    gridSize: 4,
  },
  passport_number: {
    type: 'text',
    labelKey: 'visaIntake.fields.passportNumber',
    gridSize: 4,
  },
  visa_category: {
    type: 'select',
    labelKey: 'visaIntake.fields.visaCategory',
    optionsKey: 'visaCategories',
    gridSize: 4,
  },
  visa_kind: {
    type: 'select',
    labelKey: 'visaIntake.fields.visaKind',
    optionsKey: 'visaKinds',
    gridSize: 4,
  },
  multiplicity: {
    type: 'select',
    labelKey: 'visaIntake.fields.multiplicity',
    optionsKey: 'multiplicities',
    gridSize: 4,
  },
  visa_duration_days: {
    type: 'number',
    labelKey: 'visaIntake.fields.visaDurationDays',
    gridSize: 4,
  },
  form_filled_date: {
    type: 'date',
    labelKey: 'visaIntake.fields.formFilledDate',
    gridSize: 4,
  },
  form_filled_by: {
    type: 'autocomplete',
    labelKey: 'visaIntake.fields.formFilledBy',
    optionsKey: 'employees',
    gridSize: 4,
  },
  docs_submitted_date: {
    type: 'date',
    labelKey: 'visaIntake.fields.docsSubmittedDate',
    gridSize: 4,
  },
  docs_submitted_by: {
    type: 'autocomplete',
    labelKey: 'visaIntake.fields.docsSubmittedBy',
    optionsKey: 'employees',
    gridSize: 4,
  },
  telex_date: {
    type: 'date',
    labelKey: 'visaIntake.fields.telexDate',
    gridSize: 4,
  },
  telex_number: {
    type: 'text',
    labelKey: 'visaIntake.fields.telexNumber',
    gridSize: 4,
  },
  barcode: {
    type: 'text',
    labelKey: 'visaIntake.fields.barcode',
    gridSize: 4,
  },
  visa_issued_date: {
    type: 'date',
    labelKey: 'visaIntake.fields.visaIssuedDate',
    gridSize: 4,
  },
  visa_received_by: {
    type: 'autocomplete',
    labelKey: 'visaIntake.fields.visaReceivedBy',
    optionsKey: 'employees',
    gridSize: 4,
  },
  expected_date: {
    type: 'date',
    labelKey: 'visaIntake.fields.expectedDate',
    gridSize: 4,
  },
  booking_datetime: {
    type: 'text',
    labelKey: 'visaIntake.fields.bookingDatetime',
    gridSize: 6,
  },
  travel_date: {
    type: 'date',
    labelKey: 'visaIntake.fields.travelDate',
    gridSize: 4,
  },
  partner: {
    type: 'text',
    labelKey: 'visaIntake.fields.partner',
    gridSize: 4,
  },
  notes: {
    type: 'text',
    labelKey: 'visaIntake.fields.notes',
    gridSize: 12,
    multiline: true,
    rows: 2,
  },
  visa_queue_info: {
    type: 'text',
    labelKey: 'visaIntake.fields.visaQueueInfo',
    gridSize: 6,
  },
  is_processed: {
    type: 'select',
    labelKey: 'visaIntake.fields.isProcessed',
    optionsKey: 'processedStatuses',
    gridSize: 4,
  },
  schengen_country: {
    type: 'text',
    labelKey: 'visaIntake.fields.schengenCountry',
    gridSize: 4,
  },
  queue_date: {
    type: 'date',
    labelKey: 'visaIntake.fields.queueDate',
    gridSize: 4,
  },
};

// ─── Static Select Options ────────────────────────────────────────────────────
export const VISA_SELECT_OPTIONS = {
  visaCategories: [
    { value: 'TOURISM', label: 'Tourism' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'STUDENT', label: 'Student' },
    { value: 'TRANSIT', label: 'Transit' },
    { value: 'FAMILY', label: 'Family' },
    { value: 'WORK', label: 'Work' },
    { value: 'MEDICAL', label: 'Medical' },
    { value: 'PV-1', label: 'PV-1' },
  ],
  visaKinds: [
    { value: 'EXPRESS', label: 'Express' },
    { value: 'REGULAR', label: 'Regular' },
  ],
  multiplicities: [
    { value: 'SINGLE', label: 'Single' },
    { value: 'DOUBLE', label: 'Double' },
    { value: 'MULTI', label: 'Multi' },
  ],
  processedStatuses: [
    { value: 'TRUE', label: 'Işlenen' },
    { value: 'FALSE', label: 'Işlenmedik' },
  ],
};

// ─── Per-Country Configurations ───────────────────────────────────────────────
export const VISA_COUNTRY_CONFIGS = {
  UZB: {
    label: 'Uzbekistan',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_kind', 'multiplicity',
      'visa_duration_days', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'telex_date', 'barcode',
      'telex_number', 'travel_date', 'partner', 'notes',
    ],
  },
  RUS: {
    label: 'Russia',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_kind', 'visa_duration_days',
      'form_filled_by', 'docs_submitted_date', 'docs_submitted_by',
      'visa_issued_date', 'visa_received_by', 'travel_date',
    ],
  },
  eRUS: {
    label: 'e-Russia',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_duration_days',
      'form_filled_by', 'docs_submitted_date', 'docs_submitted_by',
      'visa_issued_date', 'visa_received_by', 'travel_date',
    ],
  },
  CHN: {
    label: 'China',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_kind', 'multiplicity',
      'visa_duration_days', 'form_filled_date', 'form_filled_by',
      'visa_issued_date', 'docs_submitted_date', 'notes',
    ],
  },
  IRN: {
    label: 'Iran',
    fields: [
      'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_kind', 'multiplicity',
      'visa_duration_days', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'visa_received_by',
    ],
  },
  BAE: {
    label: 'UAE',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'docs_submitted_date',
      'docs_submitted_by', 'expected_date', 'visa_issued_date',
    ],
  },
  VIET: {
    label: 'Vietnam',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_duration_days',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'travel_date',
    ],
  },
  THAI: {
    label: 'Thailand',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'visa_received_by',
    ],
  },
  BEL: {
    label: 'Belgium',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'visa_received_by',
    ],
  },
  IND: {
    label: 'India',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'visa_received_by',
    ],
  },
  SCH: {
    label: 'Schengen',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'schengen_country', 'visa_category', 'visa_kind',
      'multiplicity', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'queue_date', 'visa_issued_date',
      'visa_received_by', 'notes',
    ],
  },
  KAZ: {
    label: 'Kazakhstan',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'visa_received_by',
    ],
  },
  USA: {
    label: 'USA',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'booking_datetime', 'docs_submitted_by', 'docs_submitted_date',
      'visa_issued_date', 'visa_received_by',
    ],
  },
  AZE: {
    label: 'Azerbaijan',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_duration_days',
      'docs_submitted_date', 'docs_submitted_by', 'expected_date',
      'travel_date', 'visa_issued_date', 'visa_received_by',
    ],
  },
  eARMENIA: {
    label: 'e-Armenia',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_kind', 'visa_duration_days',
      'form_filled_by', 'docs_submitted_date', 'docs_submitted_by',
      'visa_issued_date', 'visa_received_by', 'travel_date',
    ],
  },
  UMRA: {
    label: 'Umra',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_kind', 'multiplicity',
      'visa_duration_days', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'telex_date', 'barcode',
      'telex_number', 'travel_date', 'partner', 'notes',
    ],
  },
  ENG: {
    label: 'England',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'visa_received_by',
    ],
  },
  SRILANKA: {
    label: 'Sri Lanka',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'visa_kind', 'multiplicity',
      'visa_duration_days', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'telex_date', 'barcode',
      'telex_number', 'travel_date', 'partner', 'notes',
    ],
  },
  TAJ: {
    label: 'Tajikistan',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'visa_received_by',
    ],
  },
  KOR: {
    label: 'South Korea',
    fields: ['operator', 'client_guid', 'visa_queue_info', 'is_processed'],
  },
  INDONESIA: {
    label: 'Indonesia',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'visa_received_by',
    ],
  },
  JAP: {
    label: 'Japan',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'expected_date',
      'visa_issued_date', 'visa_received_by',
    ],
  },
  KIR: {
    label: 'Kyrgyzstan',
    fields: [
      'application_date', 'operator', 'client_guid', 'birth_date',
      'passport_number', 'visa_category', 'form_filled_date', 'form_filled_by',
      'docs_submitted_date', 'docs_submitted_by', 'visa_issued_date',
      'visa_received_by',
    ],
  },
  ROM: {
    label: 'Romania',
    fields: ['operator', 'client_guid', 'visa_queue_info', 'is_processed'],
  },
};

// ─── Helper: list of country keys for the selector dropdown ───────────────────
export const VISA_COUNTRY_OPTIONS = Object.entries(VISA_COUNTRY_CONFIGS).map(
  ([key, cfg]) => ({ value: key, label: cfg.label })
);
