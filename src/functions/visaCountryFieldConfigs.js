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

/**
 * Keys an intake record already owns — its own columns plus the form's own inputs.
 *
 * A custom field whose key is one of these cannot work: `field_key` is slugified from the
 * label, so a field labelled "Status" becomes `status` and would then share a form name with
 * the visa status select — filling it would overwrite the record's status on save. Values also
 * live in `custom_field_values`, which never holds these.
 *
 * The four keys the intake form adopts (`client_guid`, `accepted_opr_guid`, `application_date`,
 * `note`) are deliberately absent: a field named after one of them becomes that standard field
 * instead, which is what the country was configuring.
 */
const RESERVED_FIELD_KEYS = new Set([
  "guid",
  "index_number",
  "actions",
  "status",
  "client_name",
  "passport_number",
  "passport_count",
  "client_passport_count",
  "passporthistory",
  "passportexpirydate",
  "passportcountryofissue",
  "phone_number",
  "dateofbirth",
  "operator_rec",
  "operator_fullname",
  "office",
  "office_guid",
  "office_fullname",
  "office_shortname",
  "country",
  "country_guid",
  "country_name",
  "custom_field_values",
  "createdat",
  "updatedat",
]);

export const isReservedFieldKey = (key) =>
  RESERVED_FIELD_KEYS.has(String(key ?? "").toLowerCase().trim());

export const isClientField = (field) => {
  const key = typeof field === "string" ? field : field?.fieldKey || field?.field_key || field?.custom_field?.field_key;
  if (!key) return false;
  const lower = String(key).toLowerCase().trim();
  return lower === "client_guid" || lower === "client";
};

export const isNotesField = (field) => {
  const key = typeof field === "string" ? field : field?.fieldKey || field?.field_key || field?.custom_field?.field_key;
  if (!key) return false;
  const lower = String(key).toLowerCase().trim();
  return lower === "note" || lower === "notes" || lower === "bellik" || lower === "примечание";
};

export const isOperatorField = (field) => {
  const key = typeof field === "string" ? field : field?.fieldKey || field?.field_key || field?.custom_field?.field_key;
  if (!key) return false;
  const lower = String(key).toLowerCase().trim();
  return lower === "accepted_opr_guid" || lower === "operator" || lower === "operator_guid";
};

export const ensureAllVisaFields = (apiFields = []) => {
  const fields = Array.isArray(apiFields)
    ? apiFields
        .filter(Boolean)
        .map((f) => {
          const cf = f.custom_field || {};
          const fieldKey = f.fieldKey || f.field_key || cf.fieldKey || cf.field_key || f.guid;
          const label = f.field_label || f.label || f.labelTm || cf.field_label || cf.label || cf.labelTm || fieldKey;
          const fieldType = f.fieldType || f.field_type || cf.fieldType || cf.field_type || "text";
          const options = f.options || cf.options || [];

          return {
            ...cf,
            ...f,
            fieldKey,
            label,
            fieldType,
            options,
          };
        })
    : [];

  const clientField = fields.find(isClientField) || DEFAULT_VISA_FIELDS[0];
  const opr1Field = fields.find(isOperatorField) || DEFAULT_VISA_FIELDS[1];
  const appDateField =
    fields.find((f) => f.fieldKey === "application_date") || DEFAULT_VISA_FIELDS[2];
  const notesField = fields.find(isNotesField) || DEFAULT_VISA_FIELDS[3];

  // A reserved key is dropped here rather than in each consumer, so the table and the intake
  // form always agree on which fields exist — a field the form renders but the table cannot
  // show (or that would overwrite a record's own column) is worse than one that is missing.
  const dynamicFields = fields.filter(
    (f) =>
      f.fieldKey &&
      !isClientField(f) &&
      !isNotesField(f) &&
      !isOperatorField(f) &&
      !isReservedFieldKey(f.fieldKey) &&
      f.fieldKey !== "application_date",
  );

  return [
    { ...clientField, fieldKey: "client_guid" },
    { ...opr1Field, fieldKey: "accepted_opr_guid" },
    { ...appDateField, fieldKey: "application_date" },
    ...dynamicFields,
    { ...notesField, fieldKey: "note", label: notesField.label || DEFAULT_VISA_FIELDS[3].label, fieldType: "text", multiline: true },
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
