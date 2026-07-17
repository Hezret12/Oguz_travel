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