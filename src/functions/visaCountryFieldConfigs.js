export const DEFAULT_VISA_FIELDS = [
  {
    fieldKey: "client_guid",
    label: { tk: "Müşderi", ru: "ФИО клиента", en: "Client full name" },
    fieldType: "client_autocomplete",
    isDefault: true,
    gridSize: 12,
  },
  {
    fieldKey: "accepted_opr_guid",
    label: { tk: "Tabşyryjy (Operator)", ru: "Оператор", en: "Operator" },
    fieldType: "autocomplete",
    optionsKey: "employees",
    isDefault: true,
    gridSize: 6,
  },
  {
    fieldKey: "received_opr_guid",
    label: { tk: "Kabul ediji (Operator)", ru: "Оператор 2", en: "Operator 2" },
    fieldType: "autocomplete",
    optionsKey: "employees",
    isDefault: true,
    gridSize: 6,
  },
  {
    fieldKey: "application_date",
    label: { tk: "Arza senesi", ru: "Дата подачи", en: "Application date" },
    fieldType: "date",
    isDefault: true,
    gridSize: 4,
  },
  {
    fieldKey: "note",
    label: { tk: "Bellik", ru: "Примечание", en: "Note" },
    fieldType: "text",
    isDefault: true,
    gridSize: 12,
    multiline: true,
  },
];

export const isClientField = (field) => {
  const key = typeof field === "string" ? field : field?.fieldKey;
  return key === "client_guid" || key === "client";
};

export const isNotesField = (field) => {
  const key = typeof field === "string" ? field : field?.fieldKey;
  return key === "note" || key === "notes";
};

export const isOperatorField = (field) => {
  const key = typeof field === "string" ? field : field?.fieldKey;
  return key === "accepted_opr_guid" || key === "operator" || key === "operator_guid";
};

export const isOperator2Field = (field) => {
  const key = typeof field === "string" ? field : field?.fieldKey;
  return key === "received_opr_guid" || key === "operator2" || key === "operator2_guid";
};

export const ensureAllVisaFields = (apiFields = []) => {
  const fields = Array.isArray(apiFields)
    ? apiFields
        .filter(Boolean)
        .map((f) => ({
          ...f,
          fieldKey: f.fieldKey || f.field_key || f.guid,
          label: f.field_label || f.label || f.labelTm || f.fieldKey,
          fieldType: f.fieldType || f.field_type || "text",
        }))
    : [];

  const clientField = fields.find(isClientField) || DEFAULT_VISA_FIELDS[0];
  const opr1Field = fields.find(isOperatorField) || DEFAULT_VISA_FIELDS[1];
  const opr2Field = fields.find(isOperator2Field) || DEFAULT_VISA_FIELDS[2];
  const appDateField =
    fields.find((f) => f.fieldKey === "application_date") || DEFAULT_VISA_FIELDS[3];
  const notesField = fields.find(isNotesField) || DEFAULT_VISA_FIELDS[4];

  const dynamicFields = fields.filter(
    (f) =>
      f.fieldKey &&
      !isClientField(f) &&
      !isNotesField(f) &&
      !isOperatorField(f) &&
      !isOperator2Field(f) &&
      f.fieldKey !== "application_date",
  );

  return [
    { ...clientField, fieldKey: "client_guid" },
    { ...opr1Field, fieldKey: "accepted_opr_guid" },
    { ...opr2Field, fieldKey: "received_opr_guid" },
    { ...appDateField, fieldKey: "application_date" },
    ...dynamicFields,
    { ...notesField, fieldKey: "note" },
  ];
};

export const sortVisaFields = ensureAllVisaFields;

export const slugifyFieldKey = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

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
  if (typeof input === "object" && (input.guid || input.fieldKey)) return input;

  const rawStr = String(input);
  const normInput = normalizeFieldString(rawStr);
  if (!normInput) return null;

  const pool = [...(Array.isArray(catalog) ? catalog : []), ...DEFAULT_VISA_FIELDS];
  return (
    pool.find((field) => {
      if (!field) return false;
      return (
        normalizeFieldString(field.fieldKey) === normInput ||
        normalizeFieldString(field.label?.tk) === normInput ||
        normalizeFieldString(field.label) === normInput
      );
    }) || null
  );
};

export const getVisaFieldLabel = (field, currentLanguage = "tk") => {
  if (!field) return "";
  if (typeof field === "object") {
    const lbl = field.field_label || field.label;
    if (typeof lbl === "object" && lbl !== null) {
      return lbl[currentLanguage] || lbl.tk || lbl.ru || lbl.en || field.fieldKey || "";
    }
    return lbl || field.fieldKey || "";
  }
  return String(field);
};

export const VISA_SELECT_OPTIONS = {
  visaCategories: [
    { value: "TOURISM", label: "Tourism" },
    { value: "BUSINESS", label: "Business" },
    { value: "STUDENT", label: "Student" },
    { value: "TRANSIT", label: "Transit" },
    { value: "FAMILY", label: "Family" },
    { value: "WORK", label: "Work" },
    { value: "MEDICAL", label: "Medical" },
    { value: "PV-1", label: "PV-1" },
  ],
  visaKinds: [
    { value: "EXPRESS", label: "Express" },
    { value: "REGULAR", label: "Regular" },
  ],
  multiplicities: [
    { value: "SINGLE", label: "Single" },
    { value: "DOUBLE", label: "Double" },
    { value: "MULTI", label: "Multi" },
  ],
  processedStatuses: [
    { value: "TRUE", label: "Işlenen" },
    { value: "FALSE", label: "Işlenmedik" },
  ],
};
