/**
 * A stock batch (`/report`: ÝH numbers `start_yh_number`..`end_yh_number`) has no foreign key
 * to its letters. Its children are whatever `/refferal-letter/get-by-document-number-range`
 * returns for that range, a mix of:
 * - referral letters (`isRefferal: true`): one ÝH number (`travel_document_number`), count 1,
 *   managed on the referral letter page;
 * - "other" letters (`isRefferal: false`): sold/damaged/lost letters recorded from here, either
 *   one number (`isOne`) or `travel_document_number`..`travel_document_number1` (`total_letter`).
 */

import {
  YH_INPUT_PROPS,
  formatYhNumber,
  isYhNumber,
  normalizeYhNumber,
} from "../../../../functions/yhNumber";

export const STOCK_LETTERS_KEY = "stockLetters";

// `status` is a free string in the backend; these are the `REFERRAL_REPORT_STATUS_CONFIG` keys.
export const LETTER_STATUS = {
  SOLD: "SATYLDY",
  DAMAGED: "ZYÝAN ÝETEN",
  LOST: "ÝITIRILEN",
};

export const getLetterStatusOptions = (t) => [
  { label: t("referralLetter.statusSold"), value: LETTER_STATUS.SOLD, color: "#16a34a" },
  { label: t("referralLetter.statusDamaged"), value: LETTER_STATUS.DAMAGED, color: "#ea580c" },
  { label: t("referralLetter.statusLost"), value: LETTER_STATUS.LOST, color: "#dc2626" },
];

// Records saved by the removed report-share API used 1/2/3.
const LEGACY_STATUS = { 1: LETTER_STATUS.SOLD, 2: LETTER_STATUS.DAMAGED, 3: LETTER_STATUS.LOST };

// Accent-insensitive key, so values typed without Turkmen letters ("Zyyan yeten") still match.
const foldStatus = (value) =>
  String(value)
    .toUpperCase()
    .replace(/Ý/g, "Y")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const STATUS_BY_FOLDED = new Map(Object.values(LETTER_STATUS).map((s) => [foldStatus(s), s]));

export const resolveLetterStatus = (value) => {
  if (value == null || value === "") return LETTER_STATUS.SOLD;
  if (LEGACY_STATUS[value]) return LEGACY_STATUS[value];
  return STATUS_BY_FOLDED.get(foldStatus(value)) ?? value;
};

export { YH_INPUT_PROPS, formatYhNumber, isYhNumber, normalizeYhNumber };

/** The batch's ÝH number bounds, or null when either end is not a number. */
export const getStockRange = (stock) => {
  const start = Number(stock?.start_yh_number);
  const end = Number(stock?.end_yh_number);
  return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : null;
};

/**
 * Query params for a batch's letters. Shared by the panel and the stock edit modal so both
 * read the same cache entry. Every row covers at least one number, so the batch size bounds
 * the row count.
 */
export const getStockLettersParams = (stock) => {
  const range = getStockRange(stock);
  if (!range) return null;
  const size = Number(stock?.total_letter) || range.end - range.start + 1;
  return { start_number: range.start, end_number: range.end, page: 1, limit: Math.max(10, size) };
};

/** Numbers of `row` ({ start, end }) that fall inside the batch; letters may overhang it. */
export const getCountInStock = (row, stockRange) => {
  if (!stockRange) return 0;
  const from = Math.max(row.start, stockRange.start);
  const to = Math.min(row.end, stockRange.end);
  return to >= from ? to - from + 1 : 0;
};

export const isOutsideStock = (row, stockRange) =>
  Boolean(stockRange) && (row.start < stockRange.start || row.end > stockRange.end);

/** Inclusive ÝH number range a letter occupies. */
export const getLetterRange = (letter) => {
  const start = Number(letter?.travel_document_number);
  const hasEnd =
    !letter?.isRefferal && !letter?.isOne && letter?.travel_document_number1 != null &&
    letter.travel_document_number1 !== "";
  return { start, end: hasEnd ? Number(letter.travel_document_number1) : start };
};

/** Letters a row uses up; mirrors the backend's `total_sum`. */
export const getLetterCount = (letter) =>
  letter?.isRefferal ? 1 : Number(letter?.total_letter || 0);

/** First free gap in the batch range (`ranges` sorted by start), so gaps left by deletes get reused. */
export const findFirstFreeRange = (stock, ranges) => {
  const start = Number(stock?.start_yh_number);
  const end = Number(stock?.end_yh_number);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  let candidate = start;
  for (const range of ranges) {
    if (range.start > candidate) return { start: candidate, end: Math.min(range.start - 1, end) };
    candidate = Math.max(candidate, range.end + 1);
  }
  return candidate <= end ? { start: candidate, end } : null;
};

/** The range occupied by another letter, or undefined. */
export const findOverlap = (ranges, from, to, ignoreGuid) =>
  ranges.find((r) => r.guid !== ignoreGuid && r.start <= to && r.end >= from);

/** Form values → `add-other-letter` / `update-other-letter` body. */
export const toOtherLetterPayload = ({ start, end, date, status, operatorGuid, receivedBy, note }) => {
  const isOne = start === end;
  return {
    isOne,
    travel_document_number: formatYhNumber(start),
    // Single letters store no end number; an empty string clears a previous one.
    travel_document_number1: isOne ? "" : formatYhNumber(end),
    total_letter: end - start + 1,
    date_time: date ? new Date(date).toISOString() : new Date().toISOString(),
    status: status || LETTER_STATUS.SOLD,
    received_opr_guid: operatorGuid,
    accepted_by: receivedBy || "",
    note: note || "",
  };
};

/** A typed ÝH field ("0000091", " 91 ") as a number, or NaN when empty/non-numeric. */
export const toYhInt = (value) => {
  const text = normalizeYhNumber(value);
  return text === "" ? NaN : Number(text);
};

/** Letters covered by a typed start..end pair; 0 when either end is missing or reversed. */
export const getRangeCount = (startValue, endValue) => {
  const start = toYhInt(startValue);
  const end = toYhInt(endValue);
  if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) return 0;
  return end - start + 1;
};

/** "0000091" for a single number, "0000091 - 0000100" for a range. */
export const formatYhRange = ({ start, end }) =>
  start === end ? formatYhNumber(start) : `${formatYhNumber(start)} - ${formatYhNumber(end)}`;

/**
 * Validators for the ÝH number fields of a letter form: the number must be a valid serial,
 * inside the batch, and free. Shared by the add and edit letter modals (`ignoreGuid` lets the
 * edited letter overlap itself).
 */
export const createYhRangeValidators = ({ t, stock, occupied = [], ignoreGuid }) => {
  const stockStart = Number(stock?.start_yh_number);
  const stockEnd = Number(stock?.end_yh_number);

  // An error message for a single number, or null when it is valid.
  const checkNumber = (value) => {
    if (!isYhNumber(value)) return t("referralLetter.letterNoInvalid");
    const num = toYhInt(value);
    if (stock && (num < stockStart || num > stockEnd)) {
      return t("referralLetter.letterNoOutOfRange", {
        start: formatYhNumber(stockStart),
        end: formatYhNumber(stockEnd),
      });
    }
    return null;
  };

  return {
    /** Single-number mode: the number itself must be free. */
    validateLetterNo: (value) => {
      const error = checkNumber(value);
      if (error) return error;
      const num = toYhInt(value);
      if (findOverlap(occupied, num, num, ignoreGuid)) return t("referralLetter.letterNoUsed");
      return true;
    },
    validateStartNo: (value) => checkNumber(value) ?? true,
    /** Range mode: checked on the end field, where both ends are known. */
    validateEndNo: (value, formValues) => {
      const error = checkNumber(value);
      if (error) return error;
      const end = toYhInt(value);
      const start = toYhInt(formValues.startNo);
      if (!Number.isInteger(start)) return true;
      if (end < start) return t("referralLetter.rangeInvalid");
      const overlap = findOverlap(occupied, start, end, ignoreGuid);
      if (overlap) {
        return t("referralLetter.rangeOverlap", {
          start: formatYhNumber(overlap.start),
          end: formatYhNumber(overlap.end),
        });
      }
      return true;
    },
  };
};
