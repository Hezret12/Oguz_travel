export const DEFAULT_FINANCE_SUMMARY = {
  inventoryValuation: [
    { service_type: 'VISA_SLOT', remaining_units: 103, unconsumed_asset_value: 5015.00, currency: 'USD' },
    { service_type: 'HOTEL_ALLOTMENT', remaining_units: 32, unconsumed_asset_value: 3840.00, currency: 'USD' },
  ],
  realization: [
    {
      service_type: 'VISA_SLOT',
      total_consumed_units: 57,
      total_realized_cogs_usd: 2835.00,
      total_realized_cogs_tmt: 1425.00,
      total_realized_cogs: 2835.00,
      total_realized_revenue_usd: 5200.00,
      total_realized_revenue_tmt: 2600.00,
      total_realized_revenue: 5200.00,
      realized_gross_profit_usd: 2365.00,
      realized_gross_profit_tmt: 1175.00,
      realized_gross_profit: 2365.00,
    },
    {
      service_type: 'HOTEL_ALLOTMENT',
      total_consumed_units: 18,
      total_realized_cogs_usd: 2160.00,
      total_realized_cogs_tmt: 0,
      total_realized_cogs: 2160.00,
      total_realized_revenue_usd: 3500.00,
      total_realized_revenue_tmt: 0,
      total_realized_revenue: 3500.00,
      realized_gross_profit_usd: 1340.00,
      realized_gross_profit_tmt: 0,
      realized_gross_profit: 1340.00,
    },
  ],
  incomeByType: [
    { type: 'TICKET_SALES', label: 'Bilet satuwy', amount_usd: 42500.00, amount_tmt: 18500.00, amount: 42500.00 },
    { type: 'TOUR_OUTBOUND', label: 'Tur / Outbound satuwy', amount_usd: 18200.00, amount_tmt: 0, amount: 18200.00 },
    { type: 'VISA_SERVICE', label: 'Wiza hyzmaty', amount_usd: 12800.00, amount_tmt: 6400.00, amount: 12800.00 },
    { type: 'TRANSLATION', label: 'Terjime hyzmaty', amount_usd: 0, amount_tmt: 6350.00, amount: 6350.00 },
    { type: 'HOTEL_RAIL', label: 'Otel / Demir ýol', amount_usd: 4900.00, amount_tmt: 2100.00, amount: 4900.00 },
    { type: 'OTHER_INCOME', label: 'Beýleki girdejiler', amount_usd: 1850.00, amount_tmt: 850.00, amount: 1850.00 },
  ],
  expenseByType: [
    { type: 'SALARY_COMMISSION', label: 'Aýlyk we komissiýa', amount_usd: 8500.00, amount_tmt: 39000.00, amount: 28500.00 },
    { type: 'SUBCONTRACTOR', label: 'Subpodratçy (terjime we ş.m.)', amount_usd: 3200.00, amount_tmt: 9750.00, amount: 8200.00 },
    { type: 'OFFICE_RENT', label: 'Ofis kärendesi', amount_usd: 2500.00, amount_tmt: 7800.00, amount: 6500.00 },
    { type: 'COMMUNICATION', label: 'Internet / Aragatnaşyk', amount_usd: 0, amount_tmt: 2100.00, amount: 2100.00 },
    { type: 'TRANSPORT', label: 'Ulag çykdajylary', amount_usd: 1000.00, amount_tmt: 4680.00, amount: 3400.00 },
    { type: 'OTHER_EXPENSE', label: 'Beýleki çykdajylar', amount_usd: 1350.00, amount_tmt: 5850.00, amount: 4350.00 },
  ],
  unconsumedAssetTotal: 8855,
  totalCostPurchased: 11500,
  realizedCogs: 4995,
  totalCashBalanceUSD: 18615,
};

export const DEFAULT_CASH_BOXES = [
  { guid: "cb-1", name: "Baş Kassa (USD)", currency: "USD", current_balance: 14250.00, is_active: true },
  { guid: "cb-2", name: "Kassa Aşgabat (TMT)", currency: "TMT", current_balance: 85200.00, is_active: true },
  { guid: "cb-3", name: "Bank Hasaby (TMT)", currency: "TMT", current_balance: 320000.00, is_active: true },
];

export const MONTHLY_TREND = [
  { month: "Ýan", income: 68500, expense: 46200, profit: 22300 },
  { month: "Few", income: 72000, expense: 49500, profit: 22500 },
  { month: "Mart", income: 81200, expense: 52000, profit: 29200 },
  { month: "Apr", income: 77800, expense: 51000, profit: 26800 },
  { month: "Maý", income: 84400, expense: 53500, profit: 30900 },
  { month: "Iýun", income: 86600, expense: 53050, profit: 33550 },
];

