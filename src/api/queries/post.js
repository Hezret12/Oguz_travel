import { api } from "../service/apiHelper";

export const loginApi = async (data) => {
  const response = await api.post("/auth/signin", data);
  return response;
};

export const addEmployeeApi = async (data) => {
  const response = await api.postPrivate(
    "/employee/add-employee",
    data,
  );
  return response;
};

export const addUserApi = async (data) => {
  const response = await api.postPrivate(
    "/user/add-user",
    data,
  );
  return response;
};

export const addClientsApi = async (data) => {
  const response = await api.postPrivate(
    "/client/add-client",
    data,
  );
  return response;
};

export const addB2BApi = async (data) => {
  const response = await api.postPrivate(
    "/b2b/add-b2b",
    data,
  );
  return response;
};


export const addPaymentApi = async (data) => {
  const response = await api.postPrivate(
    "/ticket-payment/add-ticket-payment",
    data,
  );
  return response;
};

export const addTurkishAirlinesApi = async (data) => {
  const response = await api.postPrivate(
    "/turkish-airlines/add-turkish-airlines",
    data,
  );
  return response;
};

export const addVisaPackageApi = async (data) => {
  const response = await api.postPrivate(
    "/visa-package/add-visa-package",
    data,
  );
  return response;
};

export const addVisaCategoryApi = async (data) => {
  const response = await api.postPrivate(
    "/visa-category/add-visa-category",
    data,
  );
  return response;
};

export const addReferralLetterApi = async (data) => {
  const response = await api.postPrivate(
    "/refferal-letter/add-refferal-letter",
    data,
  );
  return response;
};

export const addVisaApi = async (data) => {
  const response = await api.postPrivate(
    "/visa/add-visa",
    data,
  );
  return response;
};

export const addTranslationApi = async (data) => {
  const response = await api.postPrivate(
    "/general-translation/add-translation",
    data,
  );
  return response;
};

export const addTranslatorApi = async (data) => {
  const response = await api.postPrivate(
    "/translator/add-translator",
    data,
  );
  return response;
};

// Outbound Tab POST APIs
export const addHotelApi = async (data) => {
  return await api.postPrivate('/hotel/add-hotel', data);
};

export const addAirwayApi = async (data) => {
  return await api.postPrivate('/airway/add-airway', data);
};

export const addRailwayApi = async (data) => {
  return await api.postPrivate('/railway/add-railway', data);
};

export const addTourApi = async (data) => {
  return await api.postPrivate('/tour/add-tour', data);
};

export const addTransferApi = async (data) => {
  return await api.postPrivate('/transfer/add-transfer', data);
};

export const addPackageApi = async (data) => {
  return await api.postPrivate('/package/add-package', data);
};

export const addTransPaymentApi = async (data) => {
  const response = await api.postPrivate(
    "/trans-payment/add-trans-payment",
    data,
  );
  return response;
};

export const addHarPaymentApi = async (data) => {
  const response = await api.postPrivate(
    "/har-payment/add-har-payment",
    data,
  );
  return response;
};

