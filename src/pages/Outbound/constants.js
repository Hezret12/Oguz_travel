// Tab definitions
export const OUTBOUND_TABS = [
  { key: "hotel", labelKey: "outbound.hotel" },
  { key: "airway", labelKey: "outbound.airway" },
  { key: "railway", labelKey: "outbound.railway" },
  { key: "tour", labelKey: "outbound.tour" },
  { key: "transfer", labelKey: "outbound.transfer" },
  { key: "package", labelKey: "outbound.package" },
];

// Source / System options (Hotel default)
export const SOURCE_OPTIONS = [
  { value: "Trip", label: "Trip" },
  { value: "B2B", label: "B2B" },
  { value: "Ratehap", label: "Ratehap" },
  { value: "Booking", label: "Booking" },
  { value: "Halal booking", label: "Halal Booking" },
  { value: "Agoda", label: "Agoda" },
];

// Partner options (Package tab)
export const PARTNER_OPTIONS = [
  { value: "B2B", label: "B2B" },
  { value: "TRP", label: "TRP" },
  { value: "GG", label: "GG" },
  { value: "TRF", label: "TRF" },
  { value: "PS", label: "PS" },
];

// Ticket type options
export const TICKET_TYPE_OPTIONS = [
  { value: "ONE_WAY", label: "One Way" },
  { value: "ROUND_TRIP", label: "Round Trip" },
];

// Meal plan options (Hotel)
export const MEAL_PLAN_OPTIONS = [
  { value: "RO", label: "RO (Room Only)" },
  { value: "BB", label: "BB (Bed & Breakfast)" },
  { value: "HB", label: "HB (Half Board)" },
  { value: "FB", label: "FB (Full Board)" },
  { value: "AI", label: "AI (All Inclusive)" },
];

// Train type options (Railway)
export const TRAIN_TYPE_OPTIONS = [
  { value: "AFROSIYAB", label: "Afrosiyab" },
  { value: "HIGH-SPEED", label: "High-Speed" },
  { value: "STANDARD", label: "Standard" },
];

// Car type options (Transfer)
export const CAR_TYPE_OPTIONS = [
  { value: "ECONOMY", label: "Economy" },
  { value: "COMFORT", label: "Comfort" },
  { value: "BUSINESS", label: "Business" },
  { value: "MINIVAN", label: "Minivan" },
];

// Payment status options with localization support
export const getPaymentOptions = (t) => [
  { value: 1, label: t ? t("outbound.paid") : "Tölendi" },
  { value: 2, label: t ? t("outbound.credit") : "Kredit" },
  { value: 3, label: t ? t("outbound.refunded") : "Gaýtaryldy" },
];

export const PAYMENT_OPTIONS = [
  { value: 1, label: "Tölendi" },
  { value: 2, label: "Kredit" },
  { value: 3, label: "Gaýtaryldy" },
];



