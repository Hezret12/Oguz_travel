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
  return await api.getPrivate('/custom_fields/get-all-field', queryParams);
};

export const getAllVisaFieldsApi = async (params = {}) => {
  const queryParams = { limit: 40, ...params };
  return await api.getPrivate('/custom_fields/get-by-country', queryParams);
};

export const getCountryVisaFieldsApi = async () => {

};

export const getAllReceivingsApi = async (params = {}) => {
    const res = await api.getPrivate('/receivings/get-all-receivings', params);
    return res
};

export const getAllUsersApi = async (params = {}) => {
  return await api.getPrivate('/user/get-all-user', params);
};

export const getAllPaymentStatusApi = async (params = {}) => {
  return await api.getPrivate('/ticket-payment/getAll-ticket-payment', params);
};

export const getAllTurkishAirlinesApi = async (params = {}) => {
  return await api.getPrivate('/turkish-airlines/get-all-turkish-airlines', params);
};

export const getAllVisaPackagesApi = async (params = {}) => {
  return await api.getPrivate('/visa-package/get-visa-packages', params);
};

export const getAllVisaCategoriesApi = async (params = {}) => {
  return await api.getPrivate('/visa-category/get-all-visa-categories', params);
};

export const getAllReferralLettersApi = async (params = {}) => {
  return await api.getPrivate('/refferal-letter/getAll-refferal-letter', params);
};

export const getAllVisasApi = async (params = {}) => {
  return await api.getPrivate('/visa/get-visa', params);
};

export const getAllPackageByIndexApi = async (index) => {
  return await api.getPrivate('/visa-package/get-visa-packages-byindex', index);
};

export const getAllTranslationsApi = async (params = {}) => {
  return await api.getPrivate('/general-translation/get-translations', params);
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
  return await api.getPrivate('/turkish-payment/getAll-turkish-payment', params);
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
  return await api.getPrivate('/report/get-all-reports', params);
};

export const getAllReportSharesApi = async (params = {}) => {
  return await api.getPrivate('/report-share/get-all-report-shares', params);
};