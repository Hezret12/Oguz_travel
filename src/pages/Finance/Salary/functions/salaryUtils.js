import dayjs from "dayjs";

const round2 = (value) => Math.round(value * 100) / 100;

export const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

// Mirrors SalaryService.calculate on the backend (the "Aýlyk" Excel sheet):
//   JEMI    = OKLAD × IŞLÄN / IŞ GÜN + BONUS
//   BERMELI = JEMI − KART − AWANS − Kofe KREDIT − KARZ
// The server recomputes these on save; this is only for the live preview.
export const calculateSalary = (values = {}) => {
  const baseSalary = toNumber(values.base_salary);
  const workDays = toNumber(values.work_days);
  const workedDays = toNumber(values.worked_days);
  const ratio = workDays > 0 ? workedDays / workDays : 1;
  const earned = round2(baseSalary * ratio);
  const total = round2(earned + toNumber(values.bonus));
  const deductions = round2(
    toNumber(values.card_amount) +
      toNumber(values.advance) +
      toNumber(values.cafeteria_credit) +
      toNumber(values.loan),
  );
  return { earned, total, deductions, payable: round2(total - deductions) };
};

// Month form values are "YYYY-MM" or an ISO string from the date picker.
export const toMonthKey = (value) => {
  const d = dayjs(value);
  return d.isValid() ? d.format("YYYY-MM") : "";
};

// Working days in a month = calendar days minus Sundays (July 2026 → 27,
// matching the sheet).
export const getWorkDaysInMonth = (month) => {
  const start = dayjs(toMonthKey(month)).startOf("month");
  if (!start.isValid()) return 0;
  let count = 0;
  for (let d = 0; d < start.daysInMonth(); d += 1) {
    if (start.add(d, "day").day() !== 0) count += 1;
  }
  return count;
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

export const getPaidPercent = (paid, payable) => {
  const payableNum = toNumber(payable);
  if (payableNum <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((toNumber(paid) / payableNum) * 100)));
};

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
  bonus: toNumber(values.bonus),
  paid_amount: toNumber(values.paid_amount),
  paid_date: values.paid_date ? dayjs(values.paid_date).format("YYYY-MM-DD") : null,
  note: values.note || "",
});

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
  paid_amount: asInput(row?.paid_amount),
  paid_date: row?.paid_date || null,
  note: row?.note || "",
});
