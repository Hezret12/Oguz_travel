import { api } from "../service/apiHelper";

export const loginApi = async (data) => {
  const response = await api.post("/auth/signin", data);
  return response;
};

export const logoutApi = async () => {
  const response = await api.postPrivate("/auth/logout", {});
  return response;
};

export const addEmployeeApi = async (data) => {
  if (data instanceof FormData) {
    return await api.postFormDataPrivate("/employee/add-employee", data);
  }
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
  if (data instanceof FormData) {
    return await api.postFormDataPrivate("/client/add-client", data);
  }
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

export const addTtpPaymentApi = async (data) => {
  const response = await api.postPrivate(
    "/ttp-payment/add-ttp-payment",
    data,
  );
  return response;
};

export const addTurkishPaymentApi = async (data) => {
  const response = await api.postPrivate(
    "/turkish-payment/add-turkish-payment",
    data,
  );
  return response;
};

export const addEmployeeCommentApi = async (data) => {
  return await api.postPrivate("/employee-comment/add-comment", data);
};

export const addTaskApi = async (data) => {
  if (data instanceof FormData) {
    return await api.postFormDataPrivate("/messages/add-task", data);
  }

  const rawFiles = data.images || data.attachments || [];
  const fileList = Array.isArray(rawFiles)
    ? rawFiles.filter((f) => f instanceof File)
    : [];

  if (fileList.length > 0) {
    const formData = new FormData();
    // Append files ONCE under field name 'images' for NestJS FilesInterceptor('images')
    fileList.forEach((file) => {
      formData.append("images", file);
    });

    Object.keys(data).forEach((key) => {
      // Skip file array keys (already appended above) to prevent duplicate uploads!
      if (key === "images" || key === "attachments") return;

      if (key === "assignee_guids" && Array.isArray(data.assignee_guids)) {
        data.assignee_guids.forEach((guid) => formData.append("assignee_guids", guid));
      } else if (Array.isArray(data[key])) {
        data[key].forEach((val) => formData.append(key, val));
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return await api.postFormDataPrivate("/messages/add-task", formData);
  }

  return await api.postPrivate("/messages/add-task", data);
};

export const addNotificationApi = async (data) => {
  return await api.postPrivate("/messages/add-notification", data);
};

export const addMessageApi = async (data) => {
  return await api.postPrivate("/messages/add-message", data);
};

export const addReportApi = async (data) => {
  return await api.postPrivate("/report/add-report", data);
};

export const addReportShareApi = async (data) => {
  return await api.postPrivate("/report-share/add-report-share", data);
};

