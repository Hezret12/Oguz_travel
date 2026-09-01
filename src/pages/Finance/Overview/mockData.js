export const DEFAULT_FINANCE_SUMMARY = {
  inventoryValuation: [
    { service_type: 'VISA_SLOT', remaining_units: 103, unconsumed_asset_value: 5015.00, currency: 'USD' },
    { service_type: 'HOTEL_ALLOTMENT', remaining_units: 32, unconsumed_asset_value: 3840.00, currency: 'USD' },
  ],
  realization: [
    { service_type: 'VISA_SLOT', total_consumed_units: 57, total_realized_cogs: 2835.00, total_realized_revenue: 5200.00, realized_gross_profit: 2365.00 },
    { service_type: 'HOTEL_ALLOTMENT', total_consumed_units: 18, total_realized_cogs: 2160.00, total_realized_revenue: 3500.00, realized_gross_profit: 1340.00 },
  ],
  incomeByType: [
    { type: 'TICKET_SALES', label: 'Bilet satuwy', amount: 42500.00 },
    { type: 'TOUR_OUTBOUND', label: 'Tur / Outbound satuwy', amount: 18200.00 },
    { type: 'VISA_SERVICE', label: 'Wiza hyzmaty', amount: 12800.00 },
    { type: 'TRANSLATION', label: 'Terjime hyzmaty', amount: 6350.00 },
    { type: 'HOTEL_RAIL', label: 'Otel / Demir ýol', amount: 4900.00 },
    { type: 'OTHER_INCOME', label: 'Beýleki girdejiler', amount: 1850.00 },
  ],
  expenseByType: [
    { type: 'SALARY_COMMISSION', label: 'Aýlyk we komissiýa', amount: 28500.00 },
    { type: 'SUBCONTRACTOR', label: 'Subpodratçy (terjime we ş.m.)', amount: 8200.00 },
    { type: 'OFFICE_RENT', label: 'Ofis kärendesi', amount: 6500.00 },
    { type: 'COMMUNICATION', label: 'Internet / Aragatnaşyk', amount: 2100.00 },
    { type: 'TRANSPORT', label: 'Ulag çykdajylary', amount: 3400.00 },
    { type: 'OTHER_EXPENSE', label: 'Beýleki çykdajylar', amount: 4350.00 },
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

