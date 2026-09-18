import dayjs from "dayjs";

const round2 = (value) => Math.round(value * 100) / 100;

export const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const BONUS_TYPE = { FIXED: "fixed", PERCENT: "percent" };

// 1 000 sales at 10% → 100.
export const calculatePercentBonus = (sales, percent) =>
  round2((toNumber(sales) * toNumber(percent)) / 100);

export const resolveBonus = (values = {}) =>
  values.bonus_type === BONUS_TYPE.PERCENT
    ? calculatePercentBonus(values.sales_amount, values.bonus_percent)
    : toNumber(values.bonus);

// Mirrors SalaryService.normalize/calculate on the backend (the "Aýlyk" sheet):
//   BONUS   = SATUW × % / 100, or a fixed amount
//   JEMI    = OKLAD × IŞLÄN / IŞ GÜN + BONUS
//   BERMELI = JEMI − KART − AWANS − Kofe KREDIT − KARZ
// The server recomputes these on save; this is only for the live preview.
export const calculateSalary = (values = {}) => {
  const baseSalary = toNumber(values.base_salary);
  const workDays = toNumber(values.work_days);
  const workedDays = toNumber(values.worked_days);
  const ratio = workDays > 0 ? workedDays / workDays : 1;
  const earned = round2(baseSalary * ratio);
  const bonus = resolveBonus(values);
  const total = round2(earned + bonus);
  const deductions = round2(
    toNumber(values.card_amount) +
      toNumber(values.advance) +
      toNumber(values.cafeteria_credit) +
      toNumber(values.loan),
  );
  const payable = round2(total - deductions);
  return {
    baseSalary,
    workDays,
    workedDays,
    earned,
    bonus,
    total,
    deductions,
    payable,
    remaining: round2(payable - toNumber(values.paid_amount)),
  };
};

// Month names are always Turkmen, whatever the UI language.
export const TK_MONTHS = [
  "Ýanwar",
  "Fewral",
  "Mart",
  "Aprel",
  "Maý",
  "Iýun",
  "Iýul",
  "Awgust",
  "Sentýabr",
  "Oktýabr",
  "Noýabr",
  "Dekabr",
];

// "2026-09" → "Sentýabr 2026".
export const formatMonthTk = (month) => {
  const d = dayjs(`${month}-01`);
  return d.isValid() ? `${TK_MONTHS[d.month()]} ${d.year()}` : "";
};

// Month form values are "YYYY-MM" or an ISO string from the date picker.
export const toMonthKey = (value) => {
  const d = dayjs(value);
  return d.isValid() ? d.format("YYYY-MM") : "";
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Zero renders as "-" like the Excel sheet so deductions stand out.
export const formatMoney = (value, { dashZero = true } = {}) => {
  const num = toNumber(value);
  if (dashZero && num === 0) return "-";
  return moneyFormatter.format(num);
};

// Paid only once explicitly settled: "mark paid" and the month lock set
// paid_date. Amounts alone never make a row paid.
export const isSalaryPaid = (row) => Boolean(row?.paid_date);

// Form values (strings from inputs) → API payload.
export const buildSalaryPayload = (values) => ({
  month: toMonthKey(values.month),
  employee_guid: values.employee_guid,
  base_salary: toNumber(values.base_salary),
  work_days: Math.trunc(toNumber(values.work_days)),
  worked_days: Math.trunc(toNumber(values.worked_days)),
  card_amount: toNumber(values.card_amount),
  advance: toNumber(values.advance),
  cafeteria_credit: toNumber(values.cafeteria_credit),
  loan: toNumber(values.loan),
  ...(values.bonus_type === BONUS_TYPE.PERCENT
    ? {
        sales_amount: toNumber(values.sales_amount),
        bonus_percent: toNumber(values.bonus_percent),
        bonus: calculatePercentBonus(values.sales_amount, values.bonus_percent),
      }
    : { sales_amount: null, bonus_percent: null, bonus: toNumber(values.bonus) }),
  paid_amount: toNumber(values.paid_amount),
  paid_date: values.paid_date ? dayjs(values.paid_date).format("YYYY-MM-DD") : null,
  note: values.note || "",
});

export const isPercentRow = (row) =>
  row?.bonus_percent !== null && row?.bonus_percent !== undefined;

const asInput = (value) =>
  value === null || value === undefined ? "" : String(Number(value));

// API row → form values.
export const salaryToFormValues = (row) => ({
  month: row?.month || dayjs().format("YYYY-MM"),
  employee_guid: row?.employee_guid || row?.employee?.guid || "",
  base_salary: asInput(row?.base_salary),
  work_days: asInput(row?.work_days),
  worked_days: asInput(row?.worked_days),
  card_amount: asInput(row?.card_amount),
  advance: asInput(row?.advance),
  cafeteria_credit: asInput(row?.cafeteria_credit),
  loan: asInput(row?.loan),
  bonus: asInput(row?.bonus),
  bonus_type: isPercentRow(row) ? BONUS_TYPE.PERCENT : BONUS_TYPE.FIXED,
  sales_amount: asInput(row?.sales_amount),
  bonus_percent: asInput(row?.bonus_percent),
  paid_amount: asInput(row?.paid_amount),
  paid_date: row?.paid_date || null,
  note: row?.note || "",
});
