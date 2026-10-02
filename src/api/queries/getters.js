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

export const getEmployeeLoanDetailsApi = async (params = {}) => {
  return await api.getPrivate('/employee/get-employee-loan-details', params);
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
  // There's no get-by-guid endpoint, so walk the pages until the country turns
  // up — the first page alone misses countries once the list grows past it.
  const limit = 100;
  const maxPages = 50;
  for (let page = 1; page <= maxPages; page++) {
    const res = await getCountriesApi({ page, limit });
    const raw = res?.data;
    const countries = Array.isArray(raw?.data?.data)
      ? raw.data.data
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
          ? raw
          : [];
    const country = countries.find((c) => c.guid === countryGuid);
    if (country) return { data: country.custom_fields || [] };

    const totalPages =
      raw?.data?.totalPages ?? raw?.totalPages ?? raw?.meta?.totalPages ?? raw?.data?.meta?.totalPages;
    if (countries.length < limit || (totalPages != null && page >= totalPages)) break;
  }
  return { data: [] };
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

export const getAllVisaPaymentApi = async (params = {}) => {
  return await api.getPrivate('/visa-payment/getAll-visa-payment', params);
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

// Every letter (referral letters and "other" letters) whose ÝH number falls in
// [start_number, end_number]; a stock batch's letters are fetched with its range.
export const getLettersByDocumentRangeApi = async (params = {}) => {
  return await api.getPrivate('/refferal-letter/get-by-document-number-range', params);
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
  return await api.getPrivate('/cafeteria/get-all-cafeteria', params);
};

export const getCafeteriaSummaryApi = async (params = {}) => {
  return await api.getPrivate('/cafeteria/get-cafeteria-summary', params);
};

export const getAllTotalCalculationsApi = async (params = {}) => {
  return await api.getPrivate('/total-calculations/get-all-total-calculations', params);
};

export const getAllCategoriesApi = async (params = {}) => {
  return await api.getPrivate('/category/get-all-category', params);
};

export const getAllReferralCountriesApi = async (params = {}) => {
  return await api.getPrivate('/refferal-country/get-all-refferal-country', params);
};

export const getAllSalariesApi = async (params = {}) => {
  return await api.getPrivate('/salary/get-all-salaries', params);
};

export const getSalarySummaryApi = async (params = {}) => {
  return await api.getPrivate('/salary/get-salary-summary', params);
};

export const getSalaryMonthStatusApi = async (params = {}) => {
  return await api.getPrivate('/salary/get-month-status', params);
};

export const getSalaryEmployeesApi = async (params = {}) => {
  return await api.getPrivate('/salary/get-employees', params);
};

// Dashboard aggregates over tbl_total_calculations. Every endpoint takes a
// period (`period_preset` or `start_date` + `end_date`), `currency` and, except
// the offices one, an optional `office_guid`.

// KPI cards: sales count, sale, net (cost), credit and profit, USD and TMT, vs the previous period.
export const getDashboardCardsApi = async (params = {}) => {
  return await api.getPrivate('/dashboard/admin-vs-maliya-vs-office-cards', params);
};

// Per day / month sale, net and profit, with a running profit (`last_profit`).
export const getDashboardChartApi = async (params = {}) => {
  return await api.getPrivate('/dashboard/admin-vs-maliya-chart-data', params);
};

// Money out per period: cost of sales, salaries and kassa expenses.
export const getDashboardMoneyOutApi = async (params = {}) => {
  return await api.getPrivate('/dashboard/money-out', params);
};

// Sales split by payment status.
export const getDashboardStatusApi = async (params = {}) => {
  return await api.getPrivate('/dashboard/admin-by-status', params);
};

// Operator ranking; `currency` is required, `category_guid` narrows it to one service.
export const getDashboardOperatorsApi = async (params = {}) => {
  return await api.getPrivate('/dashboard/admin-vs-maliya-operators', params);
};

export const getDashboardCategoriesApi = async (params = {}) => {
  return await api.getPrivate('/dashboard/maliya-by-categories', params);
};

// One service (`category_guid`) or all: totals, change vs the previous period and a sale / profit chart.
export const getDashboardCategoryAnalyticsApi = async (params = {}) => {
  return await api.getPrivate('/dashboard/admin-category-grifik', params);
};

// Every office's sale, net and profit in one currency, ranked by share of sales.
export const getDashboardOfficesApi = async (params = {}) => {
  return await api.getPrivate('/dashboard/offices-by-office', params);
};
