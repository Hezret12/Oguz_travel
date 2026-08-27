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

export const updateHarPaymentApi = async (data) => {
  return await api.patchPrivate('/har-payment/update-har-payment', data);
};

export const updateTtpPaymentApi = async (data) => {
  return await api.patchPrivate('/ttp-payment/update-ttp-payment', data);
};

export const updateTurkishPaymentApi = async (data) => {
  return await api.patchPrivate('/turkish-payment/update-turkish-payment', data);
};

export const updateTaskApi = async (data) => {
  if (data instanceof FormData) {
    return await api.patchFormDataPrivate("/messages/update-task", data);
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
    return await api.patchFormDataPrivate("/messages/update-task", formData);
  }

  return await api.patchPrivate("/messages/update-task", data);
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

export const updateReportShareApi = async (data) => {
  return await api.patchPrivate('/report-share/update-report-share', data);
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
  return await api.patchPrivate(`/cafeteria/update/${data.guid || data.id}`, data);
};

export const updateTotalCalculationApi = async (data) => {
  return await api.patchPrivate('/total-calculations/update-total-calculation', data);
};

// ==================== FINANCE / INVENTORY MODULE ====================
export const updatePurchaseLotApi = async (data) => {
  try {
    const res = await api.patchPrivate(`/finance/lots/${data.guid || data.id}`, data);
    if (res?.data) return res;
  } catch {
    // Graceful fallback
  }
  const { mockPurchaseLots } = await import('../mock/financeMockData');
  const index = mockPurchaseLots.findIndex((l) => l.guid === (data.guid || data.id));
  if (index !== -1) {
    mockPurchaseLots[index] = { ...mockPurchaseLots[index], ...data };
    return { data: mockPurchaseLots[index] };
  }
  return { data };
};
