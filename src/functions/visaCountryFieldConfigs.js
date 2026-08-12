export const DEFAULT_VISA_FIELDS = [
  {
    fieldKey: "client_guid",
    labelTm: "Müşderi",
    labelRu: "ФИО клиента",
    labelEn: "Client full name",
    fieldType: "client_autocomplete",
    isDefault: true,
    gridSize: 12,
    aliases: ["clientfullname", "client_guid", "client", "müşderi", "фио клиента", "клиент"],
  },
  {
    fieldKey: "application_date",
    labelTm: "Arza berlen senesi",
    labelRu: "Дата подачи",
    labelEn: "Application date",
    fieldType: "date",
    isDefault: true,
    gridSize: 4,
    aliases: ["applicationdate", "application_date", "arza senesi", "дата подачи", "дата заявления"],
  },
  {
    fieldKey: "operator_guid",
    labelTm: "Operator",
    labelRu: "Оператор",
    labelEn: "Operator",
    fieldType: "autocomplete",
    optionsKey: "employees",
    isDefault: true,
    gridSize: 4,
    aliases: ["operator", "operator_guid", "оператор", "сотрудник", "assignment_operator"],
  },
  {
    fieldKey: "operator2_guid",
    labelTm: "Kabul ediji (Operator)",
    labelRu: "Оператор 2",
    labelEn: "Operator 2",
    fieldType: "autocomplete",
    optionsKey: "employees",
    isDefault: true,
    gridSize: 4,
    aliases: ["operator2", "operator2_guid", "receiver_operator", "kabul ediji", "оператор 2"],
  },
  {
    fieldKey: "birth_date",
    labelTm: "Doglan senesi",
    labelRu: "Дата рождения",
    labelEn: "Date of birth",
    fieldType: "date",
    isDefault: true,
    gridSize: 4,
    aliases: ["dateofbirth", "birth_date", "doglan senesi", "дата рождения", "дата рожд", "дата рожд."],
  },
  {
    fieldKey: "passport_number",
    labelTm: "Pasport belgisi",
    labelRu: "Номер паспорта",
    labelEn: "Passport number",
    fieldType: "text",
    isDefault: true,
    gridSize: 4,
    aliases: ["passportnumber", "passport_number", "pasport belgisi", "номер паспорта", "паспорт №"],
  },
  {
    fieldKey: "visa_category",
    labelTm: "Wiza görnüşi",
    labelRu: "Категория визы",
    labelEn: "Visa category",
    fieldType: "select",
    optionsKey: "visaCategories",
    isDefault: true,
    gridSize: 4,
    aliases: ["visatype", "visa_category", "wiza görnüşi", "категория визы", "тип визы"],
  },
  {
    fieldKey: "notes",
    labelTm: "Bellikler",
    labelRu: "Примечание",
    labelEn: "Notes",
    fieldType: "text",
    isDefault: true,
    gridSize: 12,
    multiline: true,
    rows: 2,
    aliases: ["bellik", "bellikler", "primecaniye", "заметки", "примечание"],
  },
];

export const isClientField = (field) => {
  if (!field) return false;
  const key = (field.fieldKey || "").toLowerCase();
  const tm = normalizeFieldString(field.labelTm || "");
  const ru = normalizeFieldString(field.labelRu || "");
  return (
    key === "client_guid" ||
    key === "client" ||
    key === "musderi" ||
    tm === "musderi" ||
    ru === "клиент"
  );
};

export const isNotesField = (field) => {
  if (!field) return false;
  const key = (field.fieldKey || "").toLowerCase();
  const tm = normalizeFieldString(field.labelTm || "");
  const ru = normalizeFieldString(field.labelRu || "");
  return (
    key === "notes" ||
    key === "note" ||
    key === "bellikler" ||
    key === "bellik" ||
    key === "primecaniye" ||
    tm.includes("bellik") ||
    ru.includes("примеч") ||
    ru.includes("замет")
  );
};

export const isOperator2Field = (field) => {
  if (!field) return false;
  const key = (field.fieldKey || "").toLowerCase();
  const tm = normalizeFieldString(field.labelTm || "");
  const ru = normalizeFieldString(field.labelRu || "");
  return (
    key === "operator2_guid" ||
    key === "operator2" ||
    key === "receiver_operator" ||
    tm.includes("kabul ediji") ||
    tm.includes("operator2") ||
    tm.includes("operator 2") ||
    ru.includes("оператор 2") ||
    ru.includes("оператор2")
  );
};

export const isOperatorField = (field) => {
  if (!field) return false;
  if (isOperator2Field(field)) return false;
  const key = (field.fieldKey || "").toLowerCase();
  const tm = normalizeFieldString(field.labelTm || "");
  const ru = normalizeFieldString(field.labelRu || "");
  return (
    key === "operator_guid" ||
    key === "operator" ||
    key === "assignment_operator" ||
    tm === "operator" ||
    ru === "оператор"
  );
};

export const isOfficeField = (field) => {
  if (!field) return false;
  const key = (field.fieldKey || "").toLowerCase();
  const tm = normalizeFieldString(field.labelTm || "");
  const ru = normalizeFieldString(field.labelRu || "");
  return (
    key === "office_guid" ||
    key === "office" ||
    tm === "edara" ||
    ru === "офис" ||
    ru === "филиал"
  );
};

export const ensureAllVisaFields = (apiFields = []) => {
  const fields = Array.isArray(apiFields) ? [...apiFields] : [];

  let clientField = fields.find((f) => isClientField(f));
  if (!clientField) {
    clientField = DEFAULT_VISA_FIELDS.find((f) => f.fieldKey === "client_guid");
  } else {
    clientField = { ...clientField, fieldKey: "client_guid" };
  }

  let notesField = fields.find((f) => isNotesField(f));
  if (!notesField) {
    notesField = DEFAULT_VISA_FIELDS.find((f) => f.fieldKey === "notes");
  } else {
    notesField = { ...notesField, fieldKey: "notes", multiline: true };
  }

  const defaultMiddleFields = DEFAULT_VISA_FIELDS.filter(
    (f) => !isClientField(f) && !isNotesField(f)
  ).map((def) => {
    const match = fields.find(
      (f) =>
        f.fieldKey === def.fieldKey ||
        (def.fieldKey === "operator_guid" && isOperatorField(f)) ||
        (def.fieldKey === "operator2_guid" && isOperator2Field(f)) ||
        (def.fieldKey === "office_guid" && isOfficeField(f))
    );
    return match ? { ...match, fieldKey: def.fieldKey } : def;
  });

  const defaultKeys = new Set([
    ...DEFAULT_VISA_FIELDS.map((f) => f.fieldKey),
    "operator",
    "operator2",
    "office",
  ]);

  const dynamicFields = fields.filter(
    (f) =>
      !isClientField(f) &&
      !isNotesField(f) &&
      !isOperatorField(f) &&
      !isOperator2Field(f) &&
      !isOfficeField(f) &&
      !defaultKeys.has(f.fieldKey)
  );

  return [clientField, ...defaultMiddleFields, ...dynamicFields, notesField];
};

export const sortVisaFields = ensureAllVisaFields;

export const CANONICAL_RECURRING_FIELDS = [
  {
    fieldKey: "docs_submitted_by",
    labelTm: "Tabşyran",
    labelRu: "Кем сдано",
    labelEn: "Handed over by",
    fieldType: "autocomplete",
    optionsKey: "employees",
    isDefault: false,
    gridSize: 4,
    aliases: [
      "кем здана", "кем сдана", "кем сдано", "кем здано",
      "zdana", "sdana", "tabşyryldy", "kim tabşyrdy", "tabşyran"
    ],
  },
  {
    fieldKey: "docs_submitted_date",
    labelTm: "Tabşyrylan senesi",
    labelRu: "Дата сдачи",
    labelEn: "Submitted date",
    fieldType: "date",
    isDefault: false,
    gridSize: 4,
    aliases: [
      "zdana senesi", "zdan senesi", "дата сдачи", "дата подачи документов",
      "tabsyrylan senesi", "tabşyrylan senesi"
    ],
  },
  {
    fieldKey: "form_filled_date",
    labelTm: "Forma doldurylan senesi",
    labelRu: "Дата заполнения анкеты",
    labelEn: "Form filled date",
    fieldType: "date",
    isDefault: false,
    gridSize: 4,
    aliases: ["анкета заполн", "дата заполнения анкеты", "forma doldurylan senesi"],
  },
  {
    fieldKey: "form_filled_by",
    labelTm: "Forma dolduran",
    labelRu: "Кем заполнена анкета",
    labelEn: "Form filled by",
    fieldType: "autocomplete",
    optionsKey: "employees",
    isDefault: false,
    gridSize: 4,
    aliases: ["анкету заполнил", "kem zapolnena", "forma dolduran"],
  },
  {
    fieldKey: "telex_date",
    labelTm: "Teleks senesi",
    labelRu: "Дата телекса",
    labelEn: "Telex date",
    fieldType: "date",
    isDefault: false,
    gridSize: 4,
    aliases: ["telex date", "telex senesi", "дата телекса", "телекс дата", "телекс"],
  },
  {
    fieldKey: "telex_number",
    labelTm: "Teleks belgisi",
    labelRu: "Номер телекса",
    labelEn: "Telex number",
    fieldType: "text",
    isDefault: false,
    gridSize: 4,
    aliases: ["telex number", "telex belgisi", "номер телекса", "телекс №"],
  },
  {
    fieldKey: "barcode",
    labelTm: "Barkod",
    labelRu: "Штрихкод",
    labelEn: "Barcode",
    fieldType: "text",
    isDefault: false,
    gridSize: 4,
    aliases: ["barcode", "barkod", "штрихкод", "штрих код", "штрих-код", "bar kod"],
  },
  {
    fieldKey: "visa_kind",
    labelTm: "Wiza görnüşi (Tizlik)",
    labelRu: "Срочность визы",
    labelEn: "Visa speed/kind",
    fieldType: "select",
    optionsKey: "visaKinds",
    isDefault: false,
    gridSize: 4,
    aliases: ["visa kind", "срочность", "виза вид", "tizlik"],
  },
  {
    fieldKey: "multiplicity",
    labelTm: "Kratnost (Geçiş sany)",
    labelRu: "Кратность визы",
    labelEn: "Visa multiplicity",
    fieldType: "select",
    optionsKey: "multiplicities",
    isDefault: false,
    gridSize: 4,
    aliases: ["multiplicity", "kratnost", "кратность", "кратность визы", "однократная", "многократная"],
  },
  {
    fieldKey: "visa_duration_days",
    labelTm: "Wiza möhleti (Gün)",
    labelRu: "Srok wizy (дней)",
    labelEn: "Visa duration (days)",
    fieldType: "number",
    isDefault: false,
    gridSize: 4,
    aliases: ["duration", "srok", "срок визы", "срок", "дней", "mohleki", "möhleti"],
  },
  {
    fieldKey: "visa_issued_date",
    labelTm: "Wiza çykan senesi",
    labelRu: "Дата выдачи визы",
    labelEn: "Visa issued date",
    fieldType: "date",
    isDefault: false,
    gridSize: 4,
    aliases: ["issued date", "дата выдачи", "виза вышла", "wiza cykan senesi"],
  },
  {
    fieldKey: "visa_received_by",
    labelTm: "Wizany alan",
    labelRu: "Кем получена виза",
    labelEn: "Visa received by",
    fieldType: "autocomplete",
    optionsKey: "employees",
    isDefault: false,
    gridSize: 4,
    aliases: ["received by", "кто получил", "визу получил", "wizany alan"],
  },
  {
    fieldKey: "expected_date",
    labelTm: "Garaşylýan sene",
    labelRu: "Ожидаемая дата",
    labelEn: "Expected date",
    fieldType: "date",
    isDefault: false,
    gridSize: 4,
    aliases: ["expected date", "ожидаемая дата", "garasylyan sene"],
  },
  {
    fieldKey: "booking_datetime",
    labelTm: "Bron wagty",
    labelRu: "Дата/время брони",
    labelEn: "Booking date/time",
    fieldType: "text",
    isDefault: false,
    gridSize: 6,
    aliases: ["booking", "бронь", "время брони", "bron wagty"],
  },
  {
    fieldKey: "travel_date",
    labelTm: "Gidilýän sene",
    labelRu: "Дата поездки",
    labelEn: "Travel date",
    fieldType: "date",
    isDefault: false,
    gridSize: 4,
    aliases: ["travel date", "дата поездки", "gidilyan sene"],
  },
  {
    fieldKey: "partner",
    labelTm: "Önümçilik hyzmatdaşy",
    labelRu: "Партнер",
    labelEn: "Partner",
    fieldType: "text",
    isDefault: false,
    gridSize: 4,
    aliases: ["partner", "партнер", "hyzmatdas"],
  },
  {
    fieldKey: "visa_queue_info",
    labelTm: "Nobat maglumaty",
    labelRu: "Информация об очереди",
    labelEn: "Queue info",
    fieldType: "text",
    isDefault: false,
    gridSize: 6,
    aliases: ["queue info", "очередь", "nobat maglumaty"],
  },
  {
    fieldKey: "is_processed",
    labelTm: "Işlenen ýagdaýy",
    labelRu: "Статус обработки",
    labelEn: "Is processed",
    fieldType: "select",
    optionsKey: "processedStatuses",
    isDefault: false,
    gridSize: 4,
    aliases: ["is processed", "статус обработки", "islenen yagdayy"],
  },
  {
    fieldKey: "queue_date",
    labelTm: "Nobat alnan senesi",
    labelRu: "Дата очереди",
    labelEn: "Queue date",
    fieldType: "date",
    isDefault: false,
    gridSize: 4,
    aliases: ["queue date", "дата очереди", "nobat senesi"],
  },
  {
    fieldKey: "schengen_country",
    labelTm: "Şengen ýurdy",
    labelRu: "Страна Шенгена",
    labelEn: "Schengen country",
    fieldType: "text",
    isDefault: false,
    gridSize: 4,
    aliases: ["sengen yurdy", "страна шенгена"],
  },
];

export const normalizeFieldString = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/з/g, "с")
    .replace(/ё/g, "е")
    .replace(/ý/g, "y")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ň/g, "n")
    .replace(/ž/g, "z")
    .replace(/\s+/g, " ");
};

export const findMatchingCatalogField = (input, catalog = []) => {
  if (!input) return null;

  if (typeof input === "object") {
    if (input.guid || input.id || input.fieldKey) return input;
  }

  const rawStr = String(input);
  const normInput = normalizeFieldString(rawStr);
  if (!normInput) return null;

  const pool = [
    ...(Array.isArray(catalog) ? catalog : []),
    ...CANONICAL_RECURRING_FIELDS,
    ...DEFAULT_VISA_FIELDS,
  ];

  for (const field of pool) {
    if (!field) continue;

    const normKey = normalizeFieldString(field.fieldKey);
    const normTm = normalizeFieldString(field.labelTm);
    const normRu = normalizeFieldString(field.labelRu);
    const normEn = normalizeFieldString(field.labelEn);

    if (
      normInput === normKey ||
      normInput === normTm ||
      normInput === normRu ||
      normInput === normEn
    ) {
      return field;
    }

    if (Array.isArray(field.aliases)) {
      for (const alias of field.aliases) {
        if (normalizeFieldString(alias) === normInput) {
          return field;
        }
      }
    }
  }

  return null;
};

export const getVisaFieldLabel = (field, currentLanguage = "tk") => {
  if (!field) return "";
  const match = findMatchingCatalogField(field) || (typeof field === "object" ? field : null);
  if (!match) return typeof field === "string" ? field : field.fieldKey || "";

  if (currentLanguage === "ru") {
    return match.labelRu || match.labelTm || match.labelEn || match.fieldKey || "";
  }
  if (currentLanguage === "en") {
    return match.labelEn || match.labelTm || match.labelRu || match.fieldKey || "";
  }
  return match.labelTm || match.labelRu || match.labelEn || match.fieldKey || "";
};

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

export const VISA_COUNTRY_OPTIONS = Object.entries(VISA_COUNTRY_CONFIGS).map(
  ([key, cfg]) => ({ value: key, label: cfg.label })
);
