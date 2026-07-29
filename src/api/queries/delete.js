import { api } from "../service/apiHelper";


export const deleteEmployee = async (guid) => {
  const response = await api.deletePrivate('/employee/delete-employee', guid);
  return response;
};

export const deleteClient = async (guid) => {
  const response = await api.deletePrivate('/client/delete-client', guid);
  return response;
};

export const deleteB2BApi = async (guid) => {
  const response = await api.deletePrivate('/ticket-b2b/delete-ticket-b2b', guid);
  return response;
};

export const deleteTicketPaymentApi = async (guid) => {
  const response = await api.deletePrivate('/ticket-payment/delete-ticket-payment', guid);
  return response;
};

export const deleteTurkishAirlinesApi = async (guid) => {
  const response = await api.deletePrivate('/turkish-airlines/delete-turkish-airlines', guid);
  return response;
};

export const deleteUser = async (guid) => {
  const response = await api.deletePrivate('/user/delete-user', guid);
  return response;
};

export const deleteVisaPackageApi = async (guid) => {
  const response = await api.deletePrivate('/visa-package/delete-visa-package', guid);
  return response;
};

export const deleteReferralLetterApi = async (guid) => {
  const response = await api.deletePrivate('/referral-letter/delete-referral-letter', guid);
  return response;
};

export const deleteVisaApi = async (guid) => {
  const response = await api.deletePrivate('/visa/delete-visa', guid);
  return response;
};

export const deleteTransPaymentApi = async (guid) => {
  const response = await api.deletePrivate('/trans-payment/delete-trans-payment', guid);
  return response;
};

export const deleteHotelApi = async (payload) => {
  return await api.deletePrivate('/hotel/delete-hotel', payload);
};

export const deleteAirwayApi = async (payload) => {
  return await api.deletePrivate('/airway/delete-airway', payload);
};

export const deleteRailwayApi = async (payload) => {
  return await api.deletePrivate('/railway/delete-railway', payload);
};

export const deleteTourApi = async (payload) => {
  return await api.deletePrivate('/tour/delete-tour', payload);
};

export const deleteTransferApi = async (payload) => {
  return await api.deletePrivate('/transfer/delete-transfer', payload);
};

export const deletePackageApi = async (payload) => {
  return await api.deletePrivate('/package/delete-package', payload);
};

export const deleteHarPaymentApi = async (guid) => {
  return await api.deletePrivate('/har-payment/delete-har-payment', guid);
};

export const deleteTtpPaymentApi = async (guid) => {
  return await api.deletePrivate('/ttp-payment/delete-ttp-payment', guid);
};

export const deleteTurkishPaymentApi = async (guid) => {
  return await api.deletePrivate('/turkish-payment/delete-turkish-payment', guid);
};
