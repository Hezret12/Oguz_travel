import { api } from "../service/apiHelper";


export const updateEmployeeApi = async (data) => {
  if (data instanceof FormData) {
    return await api.patchFormDataPrivate("/employee/update-employee", data);
  }
  const response = await api.patchPrivate(`/employee/update-employee`, data);
  return response;
};

export const updateUserApi = async (data) => {
  const response = await api.patchPrivate(`/user/update-user`, data);
  return response;
};

export const updateClientApi = async (data) => {
  if (data instanceof FormData) {
    return await api.patchFormDataPrivate("/client/update-client", data);
  }
  const response = await api.patchPrivate(`/client/update-client`, data);
  return response;
};

export const updatePassportApi = async (data) => {
  if (data instanceof FormData) {
    return await api.patchFormDataPrivate("/client/update-passport", data);
  }
  const response = await api.patchPrivate("/client/update-passport", data);
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
  const response = await api.patchPrivate(`/refferal-letter/update-refferal-letter`, data);
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

export const updateVisaPaymentApi = async (data) => {
  return await api.patchPrivate('/visa-payment/update-visa-payment', data);
};

export const updateHarPaymentApi = async (data) => {
  return await api.patchPrivate('/har-payment/update-har-payment', data);
};

export const updateTtpPaymentApi = async (data) => {
  return await api.patchPrivate('/ttp-payment/update-ttp-payment', data);
};

export const updateTurkishPaymentApi = async (data) => {
  return await api.patchPrivate('/turkish-payment/update-turkish-payment', data);
};

/**
 * `images`/`attachments` may mix already-saved paths (strings) and new `File`s.
 * Strings go out as `keep_images` (the backend keeps those and deletes only the dropped
 * ones), Files as multipart `images` uploads. Omitting `images` leaves them untouched,
 * which is what partial updates such as a board status change rely on.
 */
export const updateTaskApi = async (data) => {
  if (data instanceof FormData) {
    return await api.patchFormDataPrivate("/messages/update-task", data);
  }

  const { images, attachments, ...fields } = data;
  const rawImages = images ?? attachments;
  const payload = { ...fields };
  let files = [];
  if (Array.isArray(rawImages)) {
    files = rawImages.filter((item) => item instanceof File);
    payload.keep_images = rawImages.filter((item) => typeof item === "string" && item);
  }

  if (files.length === 0) {
    return await api.patchPrivate("/messages/update-task", payload);
  }

  const formData = new FormData();
  // Files go ONCE under 'images' for NestJS FilesInterceptor('images').
  files.forEach((file) => formData.append("images", file));
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // An empty list still has to reach the backend ("" → []), or it keeps the old values.
      if (value.length === 0) formData.append(key, "");
      value.forEach((item) => formData.append(key, item));
    } else if (value === null) {
      // Multipart has no null; the backend reads "" as a cleared value (e.g. due_date).
      formData.append(key, "");
    } else if (value !== undefined) {
      formData.append(key, value);
    }
  });
  return await api.patchFormDataPrivate("/messages/update-task", formData);
};

export const updateNotificationApi = async (data) => {
  return await api.patchPrivate('/messages/update-notification', data);
};

export const markNotificationReadApi = async (data) => {
  return await api.patchPrivate('/messages/notification-read', data);
};

export const updateReportApi = async (data) => {
  return await api.patchPrivate('/report/update-report', data);
};

export const updateOtherLetterApi = async (data) => {
  return await api.patchPrivate('/refferal-letter/update-other-letter', data);
};

export const updateCountryApi = async (data) => {
  return await api.patchPrivate('/countries/update-country', data);
};

export const updateReceivingApi = async (data) => {
  return await api.patchPrivate('/receivings/update-receiving', data);
};

export const updateCustomFieldApi = async (data) => {
  return await api.patchPrivate('/custom_fields/update-custom-field', data);
};

export const updateUserProfileApi = async (data) => {
  if (data instanceof FormData) {
    return await api.patchFormDataPrivate('/user/update-user-profile', data);
  }

  const rawFile = data?.avatar_file || (data?.avatar_url instanceof File ? data.avatar_url : null);
  if (rawFile instanceof File) {
    const formData = new FormData();
    formData.append('avatar_url', rawFile);

    Object.keys(data).forEach((key) => {
      if (key === 'avatar_file' || key === 'avatar_url') return;
      const val = data[key];
      if (val !== undefined && val !== null) {
        if (typeof val === 'object') {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, String(val));
        }
      }
    });
    return await api.patchFormDataPrivate('/user/update-user-profile', formData);
  }

  return await api.patchPrivate('/user/update-user-profile', data);
};

export const updateVisaDocApi = async (data) => {
  return await api.patchPrivate('/visa-docs/update-visa-doc', data);
};

export const updateCafeteriaTransactionApi = async (data) => {
  return await api.patchPrivate('/cafeteria/update-cafeteria', data);
};

export const updateTotalCalculationApi = async (data) => {
  return await api.patchPrivate('/total-calculations/update-total-calculation', data);
};

export const updateCategoryApi = async (data) => {
  return await api.patchPrivate('/category/update-category', data);
};

export const updateReferralCountryApi = async (data) => {
  return await api.patchPrivate('/refferal-country/update-refferal-country', data);
};

export const updateOfficeApi = async (data) => {
  return await api.patchPrivate('/office/update-office', data);
};

export const updateDepartmentApi = async (data) => {
  return await api.patchPrivate('/department/update-department', data);
};

export const updatePositionApi = async (data) => {
  return await api.patchPrivate('/position/update-postion', data);
};

export const updateSalaryApi = async (data) => {
  return await api.patchPrivate("/salary/update-salary", data);
};

export const lockSalaryMonthApi = async (data) => {
  return await api.patchPrivate("/salary/lock-month", data);
};

export const updateInboundExpectedApi = async (data) => {
  return await api.patchPrivate('/inbound-reports/update-expected', data);
};

export const updateInboundArrivalApi = async (data) => {
  return await api.patchPrivate('/inbound-reports/update-arrival', data);
};

export const updateInboundInvitationApi = async (data) => {
  return await api.patchPrivate('/inbound-reports/update-invitation', data);
};
