import { api } from "../service/apiHelper";


export const updateEmployeeApi = async (data) => {
  const response = await api.patchPrivate(`/employee/update-employee`, data);
  return response;
};

export const updateUserApi = async (data) => {
  const response = await api.patchPrivate(`/user/update-user`, data);
  return response;
};

export const updateClientApi = async (data) => {
  const response = await api.patchPrivate(`/client/update-client`, data);
  return response;
};

export const updateB2BApi = async (data) => {
  const response = await api.patchPrivate(`/b2b/update-b2b`, data);
  return response;
};

export const updateTurkishAirlinesApi = async (data) => {
  const response = await api.patchPrivate(`/turkish-airlines/update-turkish-airlines`, data);
  return response;
};

export const updateTicketPaymentApi = async (data) => {
  const response = await api.patchPrivate(`/ticket-payment/update-ticket-payment`, data);
  return response;
};

export const updateVisaPackageApi = async (data) => {
  const response = await api.patchPrivate(`/visa-package/update-visa-package`, data);
  return response;
};

export const updateVisaCategoryApi = async (data) => {
  const response = await api.patchPrivate(`/visa-category/update-visa-category`, data);
  return response;
};

export const updateReferralLetterApi = async (data) => {
  const response = await api.patchPrivate(`/referral-letter/update-referral-letter`, data);
  return response;
};

export const updateVisaApi = async (data) => {
  const response = await api.patchPrivate(`/visa/update-visa`, data);
  return response;
};

export const updateTranslatorApi = async (data) => {
  const response = await api.patchPrivate(`/translator/update-translator`, data);
  return response;
};

export const updateTranslationApi = async (data) => {
  const response = await api.patchPrivate(`/general-translation/update-translation`, data);
  return response;
};

export const updateTransPaymentApi = async (data) => {
  const response = await api.patchPrivate(`/trans-payment/update-trans-payment`, data);
  return response;
};

// Outbound Tab PATCH APIs
export const updateHotelApi = async (data) => {
  return await api.patchPrivate('/hotel/update-hotel', data);
};

export const updateAirwayApi = async (data) => {
  return await api.patchPrivate('/airway/update-airway', data);
};

export const updateRailwayApi = async (data) => {
  return await api.patchPrivate('/railway/update-railway', data);
};

export const updateTourApi = async (data) => {
  return await api.patchPrivate('/tour/update-tour', data);
};

export const updateTransferApi = async (data) => {
  return await api.patchPrivate('/transfer/update-transfer', data);
};

export const updatePackageApi = async (data) => {
  return await api.patchPrivate('/package/update-package', data);
};
