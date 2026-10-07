/**
 * ÝH (ýollama haty / putýowka) serial numbers are printed as exactly 7 digits with leading
 * zeros ("0075360", "0369569"). They are kept and sent as strings so the zeros survive.
 */
export const YH_NUMBER_LENGTH = 7;

const YH_PATTERN = new RegExp(`^[0-9]{${YH_NUMBER_LENGTH}}$`);

/** Drops the spaces that come with pasted numbers (" 0111685"). */
export const normalizeYhNumber = (value) => String(value ?? "").replace(/\s+/g, "");

/** A valid serial: exactly 7 digits and not all zeros. */
export const isYhNumber = (value) => {
  const text = normalizeYhNumber(value);
  return YH_PATTERN.test(text) && Number(text) > 0;
};

/**
 * The serial in its printed 7-digit form. Numbers (range math) and records saved without their
 * leading zeros ("75360") are padded back; anything longer or non-numeric is returned as-is so
 * a wrong value stays visible instead of being silently changed.
 */
export const formatYhNumber = (value) => {
  const text = normalizeYhNumber(value);
  return /^[0-9]+$/.test(text) && text.length < YH_NUMBER_LENGTH
    ? text.padStart(YH_NUMBER_LENGTH, "0")
    : text;
};

/**
 * A pasted or finished entry as a serial: only its digits, extra leading zeros dropped and a
 * short number padded, so "13", " 0000013" and "00000013" all become "0000013". A number with
 * more than 7 significant digits is left as typed, so it shows as invalid instead of being cut.
 */
export const completeYhNumber = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const significant = digits.replace(/^0+/, "");
  return significant.length <= YH_NUMBER_LENGTH ? significant.padStart(YH_NUMBER_LENGTH, "0") : digits;
};

/** Input props for a serial field: numeric keyboard, at most 7 characters. */
export const YH_INPUT_PROPS = { inputProps: { maxLength: YH_NUMBER_LENGTH, inputMode: "numeric" } };
