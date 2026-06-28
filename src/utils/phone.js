/** Turkmenistan mobile: 8 digits, operator prefix 61|62|63|64|65|71|12 */
export const TURKMEN_MOBILE_OPERATORS = ['61', '62', '63', '64', '65', '71', '12'];

export const TURKMEN_MOBILE_DIGITS_REGEX = /^(61|62|63|64|65|71|12)\d{6}$/;

export const TURKMEN_COUNTRY_CODE = '993';

export const TURKMEN_PHONE_DIGIT_LENGTH = 8;

/**
 * Normalize raw phone input into an 8-digit local number.
 * Strips leading "+993", "993", or "8" automatically (paste-friendly).
 */
export function normalizePhoneInput(value) {
  let digits = String(value ?? '').replace(/\D/g, '');

  // Strip country code +993 / 993
  if (digits.startsWith(TURKMEN_COUNTRY_CODE)) {
    digits = digits.slice(3);
  }
  // Strip old Soviet trunk prefix 8
  else if (digits.startsWith('8') && digits.length > 8) {
    digits = digits.slice(1);
  }

  return digits.slice(0, TURKMEN_PHONE_DIGIT_LENGTH);
}

export function formatTurkmenPhoneForApi(digits) {
  return `+${TURKMEN_COUNTRY_CODE}${digits}`;
}
