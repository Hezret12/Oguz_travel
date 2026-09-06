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
  const response = await api.deletePrivate('/b2b/delete-b2b', guid);
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
  const response = await api.deletePrivate('/refferal-letter/delete-refferal-letter', guid);
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

export const deleteTranslationApi = async (guid) => {
  return await api.deletePrivate('/general-translation/delete-translation', guid);
};

export const deleteTranslatorApi = async (guid) => {
  return await api.deletePrivate('/translator/delete-translator', guid);
};

export const deleteEmployeeCommentApi = async (guid) => {
  return await api.deletePrivate('/employee-comment/delete-comment', guid);
};

export const deleteTaskApi = async (data) => {
  const payload = typeof data === 'object' && data !== null ? data : { guid: data };
  return await api.deletePrivate('/messages/delete-notificOrmessage', payload);
};

export const deleteNotificationApi = async (data) => {
  const payload = typeof data === 'object' && data !== null ? data : { guid: data };
  return await api.deletePrivate('/messages/delete-notificOrmessage', payload);
};

export const deleteReportApi = async (guid) => {
  const actualGuid = typeof guid === "object" ? (guid?.guid || guid?.id) : guid;
  return await api.deletePrivate('/report/delete-report', { guid: actualGuid });
};

export const deleteReportShareApi = async (guid) => {
  const actualGuid = typeof guid === "object" ? (guid?.guid || guid?.id) : guid;
  return await api.deletePrivate('/report-share/delete-report-share', { guid: actualGuid });
};

export const deleteCountryApi = async (guid) => {
  const actualGuid = typeof guid === "object" ? (guid?.guid || guid?.id) : guid;
  return await api.deletePrivate('/countries/delete-country', { guid: actualGuid });
};

export const deleteReceivingApi = async (guid) => {
  const actualGuid = typeof guid === "object" ? (guid?.guid || guid?.id) : guid;
  return await api.deletePrivate('/receivings/delete-receiving', { guid: actualGuid });
};

export const deleteCustomFieldApi = async (guid) => {
  const actualGuid = typeof guid === "object" ? (guid?.guid || guid?.id) : guid;
  return await api.deletePrivate('/custom_fields/delete-custom-field', { guid: actualGuid });
};

export const deleteVisaDocApi = async (guid) => {
  const actualGuid = typeof guid === "object" ? (guid?.guid || guid?.id) : guid;
  return await api.deletePrivate('/visa-docs/delete-visa-doc', { guid: actualGuid });
};

export const deleteCafeteriaTransactionApi = async (guid) => {
  const actualGuid = typeof guid === "object" ? (guid?.guid || guid?.id) : guid;
  return await api.deletePrivate(`/cafeteria/delete/${actualGuid}`, { guid: actualGuid });
};


export const deleteTotalCalculationApi = async (guid) => {
  const actualGuid = typeof guid === "object" ? (guid?.guid || guid?.id) : guid;
  return await api.deletePrivate('/total-calculations/delete-total-calculation', { guid: actualGuid });
};

export const deleteCategoryApi = async (guid) => {
  const actualGuid = typeof guid === "object" ? (guid?.guid || guid?.id) : guid;
  return await api.deletePrivate('/category/delete-category', { guid: actualGuid });
};

