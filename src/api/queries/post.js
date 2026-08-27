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

export const createCountryApi = async (data) => {
  return await api.postPrivate("/countries/add-country", data);
};

export const addReceivingApi = async (data) => {
  return await api.postPrivate("/receivings/add-receiving", data);
};

export const addCustomFieldApi = async (data) => {
  return await api.postPrivate("/custom_fields/add-custom-field", data);
};

export const addVisaDocApi = async (data) => {
  return await api.postPrivate("/visa-docs/add-visa-doc", data);
};

export const addCafeteriaTransactionApi = async (data) => {
  return await api.postPrivate("/cafeteria/add", data);
};

// ==================== FINANCE / INVENTORY MODULE ====================
export const addPurchaseLotApi = async (data) => {
  try {
    const res = await api.postPrivate("/finance/lots", data);
    if (res?.data) return res;
  } catch {
    // Graceful fallback for UI preview
  }
  const { mockPurchaseLots, mockSuppliers, mockCashBoxes, mockFinanceTransactions } = await import('../mock/financeMockData');
  const supplier = mockSuppliers.find((s) => s.guid === data.supplier_guid) || { guid: data.supplier_guid, name: "Supplier Partner" };
  const totalCost = Number(data.total_quantity) * Number(data.unit_cost);
  const initialPaid = Number(data.initial_paid_amount || 0);

  const newLot = {
    guid: `lot-${Date.now()}`,
    lot_number: data.lot_number || `LOT-${Date.now().toString(36).toUpperCase()}`,
    name: data.name,
    supplier_guid: data.supplier_guid,
    supplier,
    service_type: data.service_type || "VISA_SLOT",
    unit_type: data.unit_type || "slot",
    total_quantity: Number(data.total_quantity),
    consumed_quantity: 0,
    remaining_quantity: Number(data.total_quantity),
    unit_cost: Number(data.unit_cost),
    total_cost: totalCost,
    currency: data.currency || "USD",
    purchase_date: data.purchase_date || new Date().toISOString().slice(0, 10),
    expiry_date: data.expiry_date || null,
    status: "ACTIVE",
    payment_status: initialPaid >= totalCost ? "TOLENDI" : (initialPaid > 0 ? "PARTIAL" : "KREDIT"),
    total_paid: initialPaid,
    created_at: new Date().toISOString(),
  };

  mockPurchaseLots.unshift(newLot);

  if (initialPaid > 0 && data.cash_box_guid) {
    const box = mockCashBoxes.find((b) => b.guid === data.cash_box_guid);
    if (box) box.current_balance -= initialPaid;
    mockFinanceTransactions.unshift({
      guid: `tx-${Date.now()}`,
      transaction_number: `TX-${Date.now().toString(36).toUpperCase()}`,
      transaction_type: "SUPPLIER_PAYMENT",
      category: "LOT_PURCHASE",
      cash_box_guid: data.cash_box_guid,
      cash_box: box || { name: "Baş Kassa (USD)", currency: data.currency },
      counterparty_type: "SUPPLIER",
      counterparty_name: supplier.name,
      related_lot_number: newLot.lot_number,
      amount: initialPaid,
      currency: data.currency || "USD",
      exchange_rate: 19.5,
      converted_amount_tmt: initialPaid * 19.5,
      payment_method: data.payment_method || "CASH",
      transaction_date: new Date().toISOString(),
      description: `Initial payment for lot ${newLot.lot_number}`,
    });
  }

  return { data: newLot };
};

export const addCashTransactionApi = async (data) => {
  try {
    const res = await api.postPrivate("/finance/transactions", data);
    if (res?.data) return res;
  } catch {
    // Graceful fallback
  }
  const { mockFinanceTransactions, mockCashBoxes } = await import('../mock/financeMockData');
  const box = mockCashBoxes.find((b) => b.guid === data.cash_box_guid) || { name: "Kassa", currency: data.currency || "TMT" };
  const amount = Number(data.amount || 0);

  if (data.transaction_type === "INCOME" || data.transaction_type === "CLIENT_PAYMENT") {
    box.current_balance += amount;
  } else {
    box.current_balance -= amount;
  }

  const newTx = {
    guid: `tx-${Date.now()}`,
    transaction_number: `TX-${Date.now().toString(36).toUpperCase()}`,
    transaction_type: data.transaction_type,
    category: data.category || "OVERHEAD",
    cash_box_guid: data.cash_box_guid,
    cash_box: box,
    counterparty_type: data.counterparty_type || "OTHER",
    counterparty_name: data.counterparty_name || "Direct Client / Counterparty",
    amount,
    currency: data.currency || "USD",
    exchange_rate: Number(data.exchange_rate || 1.0),
    converted_amount_tmt: amount * Number(data.exchange_rate || 1.0),
    payment_method: data.payment_method || "CASH",
    transaction_date: data.transaction_date || new Date().toISOString(),
    description: data.description || "",
  };

  mockFinanceTransactions.unshift(newTx);
  return { data: newTx };
};

export const consumeLotApi = async (data) => {
  try {
    const res = await api.postPrivate("/finance/consume", data);
    if (res?.data) return res;
  } catch {
    // Graceful fallback
  }
  return { data: { success: true } };
};

export const addTotalCalculationApi = async (data) => {
  return await api.postPrivate('/total-calculations/add-total-calculation', data);
};
