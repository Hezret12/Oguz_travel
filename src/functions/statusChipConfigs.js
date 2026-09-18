export const SALE_STATUS_CONFIG = {
  SALE: { label: "Sale", color: "#16a34a" },
  REISSUE: { label: "Reissue", color: "#2563eb" },
  REFUND: { label: "Refund", color: "#dc2626" },
};

export const PAYMENT_STATUS_CONFIG = {
  TOLENDI: { label: "Tölendi", labelKey: "paymentPaid", color: "#16a34a" },
  KREDIT: { label: "Kredit", labelKey: "paymentCredit", color: "#dc2626" },
  TRUE: { label: "Tölendi", labelKey: "paymentPaid", color: "#16a34a" },
  FALSE: { label: "Kredit", labelKey: "paymentCredit", color: "#dc2626" },
  1: { label: "Tölendi", labelKey: "paymentPaid", color: "#16a34a" },
  2: { label: "Kredit", labelKey: "paymentCredit", color: "#dc2626" },
  0: { label: "Kredit", labelKey: "paymentCredit", color: "#dc2626" },
};

export const OUTBOUND_PAYMENT_STATUS_CONFIG = {
  1: { label: "Tölendi", labelKey: "paymentPaid", color: "#16a34a" },
  2: { label: "Kredit", labelKey: "paymentCredit", color: "#d97706" },
  3: { label: "Gaýtaryldy", labelKey: "paymentRefunded", color: "#dc2626" },
  TOLENDI: { label: "Tölendi", labelKey: "paymentPaid", color: "#16a34a" },
  KREDIT: { label: "Kredit", labelKey: "paymentCredit", color: "#d97706" },
  GAYTARYLDY: { label: "Gaýtaryldy", labelKey: "paymentRefunded", color: "#dc2626" },
  TRUE: { label: "Tölendi", labelKey: "paymentPaid", color: "#16a34a" },
  FALSE: { label: "Kredit", labelKey: "paymentCredit", color: "#d97706" },
};

export const TRANSLATION_STATUS_CONFIG = {
  TRUE: { label: "Gyssagly", labelKey: "statusUrgent", color: "#e11d48" },
  FALSE: { label: "Adaty", labelKey: "statusNormal", color: "#0284c7" },
  "0": { label: "Gaýtaryldy", labelKey: "paymentRefunded", color: "#ea580c" },
};

export const VISA_CATEGORY_CONFIG = {
  TOURISM: { label: "Tourism", color: "#0891b2" },
  BUSINESS: { label: "Business", color: "#7c3aed" },
  STUDENT: { label: "Student", color: "#2563eb" },
  TRANSIT: { label: "Transit", color: "#64748b" },
  FAMILY: { label: "Family", color: "#db2777" },
  WORK: { label: "Work", color: "#ea580c" },
  MEDICAL: { label: "Medical", color: "#16a34a" },
  "PV-1": { label: "PV-1", color: "#0284c7" },
};

export const PROCESSED_STATUS_CONFIG = {
  TRUE: { label: "Işlenen", color: "#16a34a" },
  FALSE: { label: "Işlenmedik", color: "#dc2626" },
};

export const TASK_STATUS_CONFIG = {
  1: { label: "To Do", color: "#64748b" },
  2: { label: "In Progress", color: "#2563eb" },
  3: { label: "Completed", color: "#16a34a" },
};

export const NOTIFICATION_STATUS_CONFIG = {
  TRUE: { label: "Okaldy", color: "#16a34a" },
  FALSE: { label: "Okalmadyk", color: "#d97706" },
};

export const REFERRAL_REPORT_STATUS_CONFIG = {
  SATYLDY: { label: "Satyldy", color: "#16a34a" },
  "ZYÝAN ÝETEN": { label: "Zyýan ýeten", color: "#ea580c" },
  ÝITIRILEN: { label: "Ýitirilen", color: "#dc2626" },
  // Compatibility aliases
  "SATIS YAPILDI": { label: "Satyldy", color: "#16a34a" },
  "TÖLEG EDILDI": { label: "Satyldy", color: "#16a34a" },
  "GARAŞYLÝAR": { label: "Zyýan ýeten", color: "#ea580c" },
  "ÝATYRYLDY": { label: "Ýitirilen", color: "#dc2626" },
};

export const VISA_STATUS = Object.freeze({
  PROCESS: "PROCESS",
  DONE: "DONE",
  FAIL: "FAIL",
});

export const VISA_STATUS_CONFIG = {
  [VISA_STATUS.PROCESS]: { label: "Işlenýär", color: "#2563eb" },
  [VISA_STATUS.DONE]: { label: "Tamamlandy", color: "#16a34a" },
  [VISA_STATUS.FAIL]: { label: "Ýatyryldy", color: "#dc2626" },
};

export const CAFETERIA_TYPE_CONFIG = {
  INCOME: { label: "Girdeji", color: "#16a34a" },
  EXPENSE: { label: "Çykdajy", color: "#dc2626" },
  TRUE: { label: "Girdeji", color: "#16a34a" },
  FALSE: { label: "Çykdajy", color: "#dc2626" },
  "1": { label: "Girdeji", color: "#16a34a" },
  "0": { label: "Çykdajy", color: "#dc2626" },
};

export const EMPLOYEE_ACTIVE_CONFIG = {
  TRUE: { label: "Işjeň", labelKey: "employee.active", color: "#16a34a" },
  FALSE: { label: "Işjeň däl", labelKey: "employee.inactive", color: "#94a3b8" },
};

export const SALARY_PAID_STATUS_CONFIG = {
  TRUE: { label: "Tölendi", labelKey: "salary.paid", color: "#16a34a" },
  FALSE: { label: "Tölenmedi", labelKey: "salary.notPaid", color: "#dc2626" },
};

export const PURCHASE_LOT_STATUS_CONFIG = {
  ACTIVE: { label: "Işjeň", color: "#16a34a" },
  EXHAUSTED: { label: "Gutarýan / Gutardy", color: "#64748b" },
  EXPIRED: { label: "Möhleti geçen", color: "#dc2626" },
  CANCELLED: { label: "Ýatyryldy", color: "#94a3b8" },
};

export const FINANCE_TRANSACTION_TYPE_CONFIG = {
  INCOME: { label: "Girdeji", color: "#16a34a" },
  EXPENSE: { label: "Çykdajy", color: "#dc2626" },
  SUPPLIER_PAYMENT: { label: "Üpjün edijä töleg", color: "#2563eb" },
  CLIENT_PAYMENT: { label: "Müşderi tölegi", color: "#0891b2" },
  TRANSFER: { label: "Geçirim", color: "#7c3aed" },
};

export const FINANCE_SERVICE_TYPE_CONFIG = {
  VISA_SLOT: { label: "Wiza Kwotasy", color: "#0891b2" },
  HOTEL_ALLOTMENT: { label: "Otel Basyşy", color: "#db2777" },
  FLIGHT_QUOTA: { label: "Uçuş Bloki", color: "#2563eb" },
  TOUR_PACKAGE: { label: "Tur Bukjasy", color: "#7c3aed" },
  TRANSFER: { label: "Transfer", color: "#ea580c" },
};

