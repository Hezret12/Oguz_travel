import { axiosInstance } from "../axiosIntance";
import Cookies from 'js-cookie';
import { api } from '../service/apiHelper';


export const renewAccessTokenApi = async () => {
  const refreshToken = Cookies.get('refreshToken');
  const bearer = 'Bearer ' + refreshToken;
  return axiosInstance.get('/auth/renew-access-token', {
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
  return await api.getPrivate('/referral-letter/get-all-referral-letters', params);
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