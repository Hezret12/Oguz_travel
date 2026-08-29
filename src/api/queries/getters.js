import { axiosInstance } from "../axiosIntance";
import Cookies from 'js-cookie';
import { api } from '../service/apiHelper';


export const refreshTokenApi = async () => {
  const refreshToken = Cookies.get('refreshToken');
  return axiosInstance.post('/auth/refresh', {
    refreshToken: refreshToken,
  });
};

export const getMeApi = async () => {
  const accessToken = Cookies.get('accessToken');
  const bearer = 'Bearer ' + accessToken;
  return axiosInstance.get('/auth/me', {
    headers: {
      Authorization: bearer,
    },
  });
};


export const getAllDepartmentApi = async (params = {}) => {
  return await api.getPrivate('/department/get-all-departments', params);
};

export const getAllPositionApi = async (params = {}) => {
  return await api.getPrivate('/position/get-all-postions', params);
};

export const getAllOfficeApi = async (params = {}) => {
  return await api.getPrivate('/office/get-all-offices', params);
};

export const getAllEmployeeApi = async (params = {}) => {
  return await api.getPrivate('/employee/get-all-employees', params);
};

export const getEmployeesForPositionApi = async (params = {}) => {
  return await api.getPrivate('/employee/get-employees-for-position', params);
};

export const getAllStatusApi = async (params = {}) => {
  return await api.getPrivate('/tstatus/get-all-tstatus', params);
};

export const getAllClientsApi = async (params = {}) => {
  return await api.getPrivate('/client/get-all-client', params);
};

export const getAllB2BApi = async (params = {}) => {
  return await api.getPrivate('/b2b/get-all-b2b', params);
};

export const getCountriesApi = async (params = {}) => {
  return await api.getPrivate('/countries/get-all-country', params);
};

export const getCustomFieldsApi = async (params = {}) => {
  const queryParams = { limit: 40, page: 1, ...params };
  const data = await api.getPrivate('/custom_fields/get-all-field', queryParams);
  return data
};

export const getAllVisaFieldsApi = async (params = {}) => {
  const queryParams = { limit: 40, ...params };
  return await api.getPrivate('/custom_fields/get-by-country', queryParams);
};

export const getCountryVisaFieldsApi = async (countryGuid) => {
  if (!countryGuid) return { data: [] };
  const res = await getCountriesApi({ limit: 100 });
  const raw = res?.data;
  const countries = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
  const country = countries.find((c) => c.guid === countryGuid);
  return { data: country?.custom_fields || [] };
};

export const getAllReceivingsApi = async (params = {}) => {
  const res = await api.getPrivate('/receivings/get-all-receiving', params);
  return res;
};

export const getAllUsersApi = async (params = {}) => {
  return await api.getPrivate('/user/get-all-user', params);
};

export const getAllPaymentStatusApi = async (params = {}) => {
  return await api.getPrivate('/ticket-payment/get-all-ticket-payment', params);
};

export const getAllTurkishAirlinesApi = async (params = {}) => {
  return await api.getPrivate('/turkish-airlines/get-tukish-airlines', params);
};

export const getAllVisaPackagesApi = async (params = {}) => {
  return await api.getPrivate('/visa-package/get-visa-packages', params);
};

export const getAllVisaCategoriesApi = async (params = {}) => {
  return await api.getPrivate('/visa-category/get-all-visa-categories', params);
};

export const getAllReferralLettersApi = async (params = {}) => {
  return await api.getPrivate('/refferal-letter/get-all-refferal-letter', params);
};

export const getAllVisasApi = async (params = {}) => {
  return await api.getPrivate('/visa/get-visa', params);
};

export const getAllPackageByIndexApi = async (index) => {
  return await api.getPrivate('/visa-package/get-visa-packages-byindex', index);
};

export const getAllTranslationsApi = async (params = {}) => {
  return await api.getPrivate('/general-translation/get-trans-search-filter', params);
};

export const getAllTranslatorsApi = async (params = {}) => {
  return await api.getPrivate('/translator/get-all-translators', params);
};

export const getAllTransPaymentApi = async (params = {}) => {
  return await api.getPrivate('/trans-payment/get-all-trans-payment', params);
};

// Outbound Tab GET APIs
export const getAllHotelsApi = async (params = {}) => {
  return await api.getPrivate('/hotel/get-hotels', params);
};

export const getAllAirwaysApi = async (params = {}) => {
  return await api.getPrivate('/airway/get-airways', params);
};

export const getAllRailwaysApi = async (params = {}) => {
  return await api.getPrivate('/railway/get-railways', params);
};

export const getAllToursApi = async (params = {}) => {
  return await api.getPrivate('/tour/get-tours', params);
};

export const getAllTransfersApi = async (params = {}) => {
  return await api.getPrivate('/transfer/get-transfers', params);
};

export const getAllPackagesApi = async (params = {}) => {
  return await api.getPrivate('/package/get-packages', params);
};

export const getAllHarPaymentApi = async (params = {}) => {
  return await api.getPrivate('/har-payment/get-all-har-payment', params);
};

export const getAllTtpPaymentApi = async (params = {}) => {
  return await api.getPrivate('/ttp-payment/get-all-ttp-payment', params);
};

export const getTurkishAirlinesReportApi = async (params = {}) => {
  return await api.getPrivate('/turkish-airlines/get-tukish-airlines-report', params);
};

export const getTurkishAirlinesStatusMonthApi = async (params = {}) => {
  return await api.getPrivate('/turkish-airlines/get-turkish-status-month', params);
};

export const getAllTurkishPaymentApi = async (params = {}) => {
  return await api.getPrivate('/turkish-payment/get-all-turkish-payment', params);
};

export const getTurkishQuarterApi = async (params = {}) => {
  return await api.getPrivate('/turkish-airlines/get-turkish-quarter', params);
};

export const getEmployeeCommentsApi = async (params = {}) => {
  return await api.getPrivate('/employee-comment/get-comments', params);
};

export const getAllTasksApi = async (params = {}) => {
  return await api.getPrivate('/messages/get-all-tasks', params);
};

export const getAllNotificationsApi = async (params = {}) => {
  return await api.getPrivate('/messages/get-all-notification', params);
};

export const getAllReportsApi = async (params = {}) => {
  return await api.getPrivate('/report/get-all-report', params);
};

export const getAllReportSharesApi = async (params = {}) => {
  return await api.getPrivate('/report-share/get-all-report-shares', params);
};

export const getUserProfileApi = async () => {
  return await api.getPrivate('/user/get-user-profile');
};

export const getOneUserProfileApi = async (guid) => {
  if (!guid) return null;
  return await api.getPrivate(`/user/getOne-profile/${guid}`);
};

export const getAllVisaDocsApi = async (params = {}) => {
  return await api.getPrivate('/visa-docs/get-visa-docs', params);
};

export const getOneVisaDocApi = async (guid) => {
  return await api.getPrivate(`/visa-docs/get-visa-doc/${guid}`);
};

export const getAllCafeteriaTransactionsApi = async (params = {}) => {
  return await api.getPrivate('/cafeteria/get-all', params);
};

export const getCafeteriaSummaryApi = async (params = {}) => {
  return await api.getPrivate('/cafeteria/summary', params);
};

// ==================== FINANCE / INVENTORY MODULE ====================
export const getAllPurchaseLotsApi = async (params = {}) => {
  try {
    const res = await api.getPrivate('/finance/lots', params);
    if (res?.data) return res;
  } catch {
    // Graceful fallback for UI preview
  }
  const { mockPurchaseLots } = await import('../mock/financeMockData');
  const page = Number(params?.page || 1);
  const limit = Number(params?.limit || 40);
  const search = params?.search?.toLowerCase()?.trim();
  const serviceType = params?.service_type;
  const status = params?.status;

  let filtered = [...mockPurchaseLots];
  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.lot_number?.toLowerCase()?.includes(search) ||
        item.name?.toLowerCase()?.includes(search) ||
        item.supplier?.name?.toLowerCase()?.includes(search)
    );
  }
  if (serviceType) {
    filtered = filtered.filter((item) => item.service_type === serviceType);
  }
  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    data: {
      data: paginatedData,
      totalItems,
      totalPages,
      currentPage: page,
    },
  };
};

export const getFinanceSummaryApi = async (params = {}) => {
  try {
    const res = await api.getPrivate('/finance/summary', params);
    if (res?.data) return res;
  } catch {
    // Graceful fallback
  }
  const { mockPurchaseLots, mockCashBoxes } = await import('../mock/financeMockData');

  const unconsumedAssetTotal = mockPurchaseLots.reduce(
    (acc, lot) => acc + (lot.total_quantity - lot.consumed_quantity) * lot.unit_cost,
    0
  );
  const totalCostPurchased = mockPurchaseLots.reduce((acc, lot) => acc + lot.total_cost, 0);
  const realizedCogs = mockPurchaseLots.reduce((acc, lot) => acc + lot.consumed_quantity * lot.unit_cost, 0);
  const totalCashBalanceUSD = mockCashBoxes.reduce((acc, cb) => {
    if (cb.currency === 'USD') return acc + cb.current_balance;
    if (cb.currency === 'TMT') return acc + cb.current_balance / 19.5;
    return acc;
  }, 0);

  return {
    data: {
      inventoryValuation: [
        { service_type: 'VISA_SLOT', remaining_units: 103, unconsumed_asset_value: 5015.00, currency: 'USD' },
        { service_type: 'HOTEL_ALLOTMENT', remaining_units: 32, unconsumed_asset_value: 3840.00, currency: 'USD' },
      ],
      realization: [
        { service_type: 'VISA_SLOT', total_consumed_units: 57, total_realized_cogs: 2835.00, total_realized_revenue: 5200.00, realized_gross_profit: 2365.00 },
        { service_type: 'HOTEL_ALLOTMENT', total_consumed_units: 18, total_realized_cogs: 2160.00, total_realized_revenue: 3500.00, realized_gross_profit: 1340.00 },
      ],
      unconsumedAssetTotal,
      totalCostPurchased,
      realizedCogs,
      totalCashBalanceUSD,
    },
  };
};

export const getAllCashTransactionsApi = async (params = {}) => {
  try {
    const res = await api.getPrivate('/finance/transactions', params);
    if (res?.data) return res;
  } catch {
    // Graceful fallback
  }
  const { mockFinanceTransactions } = await import('../mock/financeMockData');
  const page = Number(params?.page || 1);
  const limit = Number(params?.limit || 40);
  const search = params?.search?.toLowerCase()?.trim();
  const txType = params?.transaction_type;

  let filtered = [...mockFinanceTransactions];
  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.transaction_number?.toLowerCase()?.includes(search) ||
        item.description?.toLowerCase()?.includes(search) ||
        item.counterparty_name?.toLowerCase()?.includes(search)
    );
  }
  if (txType) {
    filtered = filtered.filter((item) => item.transaction_type === txType);
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    data: {
      data: paginatedData,
      totalItems,
      totalPages,
      currentPage: page,
    },
  };
};

export const getAllCashBoxesApi = async (params = {}) => {
  try {
    const res = await api.getPrivate('/finance/cash-boxes', params);
    if (res?.data) return res;
  } catch {
    // Graceful fallback
  }
  const { mockCashBoxes } = await import('../mock/financeMockData');
  return { data: mockCashBoxes };
};

export const getAllSuppliersApi = async (params = {}) => {
  try {
    const res = await api.getPrivate('/finance/suppliers', params);
    if (res?.data) return res;
  } catch {
    // Graceful fallback
  }
  const { mockSuppliers } = await import('../mock/financeMockData');
  return { data: mockSuppliers };
};

export const getLotConsumptionHistoryApi = async (lotGuid) => {
  try {
    const res = await api.getPrivate(`/finance/lots/${lotGuid}/consumptions`);
    if (res?.data) return res;
  } catch {
    // Graceful fallback
  }
  const { mockConsumptionLedger } = await import('../mock/financeMockData');
  const items = mockConsumptionLedger.filter((c) => c.lot_guid === lotGuid);
  return { data: items };
};

export const getAllTotalCalculationsApi = async (params = {}) => {
  return await api.getPrivate('/total-calculations/get-all-total-calculations', params);
};

export const getAllFinanceCategoriesApi = async (params = {}) => {
  try {
    const res = await api.getPrivate('/finance-category/get-all-categories', params);
    if (res?.data) return res;
  } catch {
    // Graceful fallback
  }
  const { getAllFinanceCategories } = await import('../../functions/financeCategories');
  return { data: getAllFinanceCategories() };
};
