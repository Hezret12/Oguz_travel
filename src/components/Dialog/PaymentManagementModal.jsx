import { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Box,
  Typography,
  Chip,
  Grid,
  IconButton,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditIcon from "@mui/icons-material/Edit";

import { CustomDialog } from "./CustomDialog";
import CustomTextField from "../CustomTextField";
import CustomDatePicker from "../CustomDatePicker";
import AppAutocomplete from "../AppAutocomplete";
import { useLocale } from "../../hooks/useLocale";
import { getAllPaymentStatusApi, getAllEmployeeApi, getAllTransPaymentApi, getAllHarPaymentApi, getAllTtpPaymentApi, getAllTurkishPaymentApi } from "../../api/queries/getters";
import { deleteTicketPaymentApi, deleteTransPaymentApi, deleteHarPaymentApi, deleteTtpPaymentApi, deleteTurkishPaymentApi } from "../../api/queries/delete";
import { addPaymentApi, addTransPaymentApi, addHarPaymentApi, addTtpPaymentApi, addTurkishPaymentApi } from "../../api/queries/post";
import { updateTicketPaymentApi, updateTransPaymentApi, updateHarPaymentApi, updateTtpPaymentApi, updateTurkishPaymentApi } from "../../api/queries/patch";
import { useGet } from "../../hooks/CRUD/useGet";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { useUpdate } from "../../hooks/CRUD/useUpdate";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  TRY: "₺",
  TMT: "m",
  RUB: "₽",
  AED: "AED",
};

let localPaymentIdCounter = 0;
const getNextLocalPaymentGuid = () => {
  localPaymentIdCounter += 1;
  return `p-${localPaymentIdCounter}`;
};

const formatCurrency = (val, currencyCode = "USD") => {
  const num = Number(val || 0);
  const formattedNum = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode || "USD";
  return `${formattedNum} ${symbol}`;
};

const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return "";
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = cleanDate.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
};

const methodMap = {
  cash: "Nagt",
  card: "Karta",
  account: "Hasap",
  nagt: "Nagt",
  karta: "Karta",
  hasap: "Hasap",
};

const getMethodLabel = (method) => {
  if (!method) return "";
  const normalized = method.toLowerCase();
  return methodMap[normalized] || method;
};

export const PaymentManagementModal = ({ open, onClose, row }) => {
  const ticket = row?.original;
  const clientName = ticket?.client?.fullName || ticket?.clientId || "Client";
  const { t } = useLocale();

  const isTranslation = ticket && ("source_to_target" in ticket || "page_count" in ticket || "completed_page_count" in ticket);
  const ticketCurrency = ticket?.currency || (isTranslation ? "TMT" : "USD");
  const currencySymbol = CURRENCY_SYMBOLS[ticketCurrency] || ticketCurrency;

  const isCredit =
    ticket?.is_paid === false ||
    ticket?.payment_types === "credit" ||
    ticket?.payment_status?.toLowerCase() === "kredit";

  const [localPayments, setLocalPayments] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);

  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      amount: "",
      paymentDate: new Date().toISOString(),
      description: "",
      opr_guid: "",
    },
  });

  const amountValue = useWatch({ control, name: "amount" });

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const isTurkish = useMemo(() => {
    if (!ticket) return false;
    return (
      "ta_assignment_operator" in ticket ||
      "ta_receiver_operator" in ticket ||
      "base_fare" in ticket ||
      "ta_guid" in ticket ||
      "turkish_airline_guid" in ticket
    );
  }, [ticket]);

  const isHotel = useMemo(() => {
    if (!ticket) return false;
    return (
      "hotel_name" in ticket ||
      "room_type" in ticket ||
      "meal_plan" in ticket ||
      "hotel_guid" in ticket
    );
  }, [ticket]);

  const isRailway = useMemo(() => {
    if (!ticket) return false;
    return (
      "train_type" in ticket ||
      "railway_guid" in ticket ||
      "train_number" in ticket ||
      "car_number" in ticket
    );
  }, [ticket]);

  const isAirway = useMemo(() => {
    if (!ticket) return false;
    if ("train_type" in ticket) return false;
    return "passenger_count" in ticket || "airway_guid" in ticket;
  }, [ticket]);

  const isHAR = isHotel || isAirway || isRailway;

  const isTour = useMemo(() => {
    if (!ticket) return false;
    return "tour_name" in ticket || "tour_guid" in ticket;
  }, [ticket]);

  const isTransfer = useMemo(() => {
    if (!ticket) return false;
    return (
      "transfer_type" in ticket ||
      "machine_type" in ticket ||
      "transfer_guid" in ticket
    );
  }, [ticket]);

  const isPackage = useMemo(() => {
    if (!ticket) return false;
    return "partner" in ticket || "package_guid" in ticket;
  }, [ticket]);

  const isTTP = isTour || isTransfer || isPackage;

  const apiFn = isTranslation
    ? getAllTransPaymentApi
    : isHAR
    ? getAllHarPaymentApi
    : isTTP
    ? getAllTtpPaymentApi
    : isTurkish
    ? getAllTurkishPaymentApi
    : getAllPaymentStatusApi;

  const key = isTranslation
    ? "trans-payment"
    : isHAR
    ? "har-payment"
    : isTTP
    ? "ttp-payment"
    : isTurkish
    ? "turkish-payment"
    : "payment-status";

  const queryParams = useMemo(() => {
    const params = { page, limit };
    if (isTranslation) {
      params.translation_guid = ticket?.guid;
    } else if (isHAR) {
      if (isHotel) params.hotel_guid = ticket?.guid;
      else if (isAirway) params.airway_guid = ticket?.guid;
      else if (isRailway) params.railway_guid = ticket?.guid;
    } else if (isTTP) {
      if (isTour) params.tour_guid = ticket?.guid;
      else if (isTransfer) params.transfer_guid = ticket?.guid;
      else if (isPackage) params.package_guid = ticket?.guid;
    } else if (isTurkish) {
      params.turkish_airline_guid = ticket?.guid;
    } else {
      params.b2b_guid = ticket?.guid;
    }
    return params;
  }, [ticket?.guid, page, limit, isTurkish, isTranslation, isHAR, isHotel, isAirway, isRailway, isTTP, isTour, isTransfer, isPackage]);

  const { data: allPayments, isLoading: paymentsLoading } = useGet({
    apiFn,
    key,
    params: queryParams,
    options: {
      enabled: open && !!ticket?.guid,
    },
  });

  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
    options: {
      enabled: open,
    },
  });

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => ({
        label: emp.fullName,
        value: emp.guid,
      })),
    [employees],
  );

  const queryClient = useQueryClient();
  const rawData = queryClient.getQueryData([key, queryParams]);
  const totalPages = useMemo(() => {
    if (!rawData?.data) return 1;
    if (rawData.data.data?.meta?.totalPages !== undefined) {
      return rawData.data.data.meta.totalPages;
    }
    return rawData.data.meta?.totalPages ?? 1;
  }, [rawData]);

  const { mutate: createPayment, isPending: createLoading } = useCreate({
    apiFn: isTranslation
      ? addTransPaymentApi
      : isHAR
      ? addHarPaymentApi
      : isTTP
      ? addTtpPaymentApi
      : isTurkish
      ? addTurkishPaymentApi
      : addPaymentApi,
    key: key,
    invalidateQueries: [key, "turkish-airlines"],
    onSuccess: () => {
      reset({
        amount: "",
        paymentDate: new Date().toISOString(),
        description: "",
        opr_guid: "",
      });
    },
  });

  const { mutate: deletePayment, isPending: deleteLoading } = useDelete({
    deleteFn: isTranslation
      ? deleteTransPaymentApi
      : isHAR
      ? deleteHarPaymentApi
      : isTTP
      ? deleteTtpPaymentApi
      : isTurkish
      ? deleteTurkishPaymentApi
      : deleteTicketPaymentApi,
    queryKey: [key, queryParams],
    idKey: "guid",
    invalidateQueries: [key, "turkish-airlines"],
  });

  const { mutate: updatePayment, isPending: updateLoading } = useUpdate({
    apiFn: isTranslation
      ? updateTransPaymentApi
      : isHAR
      ? updateHarPaymentApi
      : isTTP
      ? updateTtpPaymentApi
      : isTurkish
      ? updateTurkishPaymentApi
      : updateTicketPaymentApi,
    key: key,
    idKey: "guid",
    invalidateQueries: [key, "turkish-airlines"],
    onSuccessUpdate: () => {
      handleCancelEdit();
    },
  });

  const loading = paymentsLoading || createLoading || deleteLoading || updateLoading;

  const payments = useMemo(() => {
    if (!ticket?.guid) {
      return localPayments;
    }
    const list = Array.isArray(allPayments)
      ? allPayments
      : allPayments?.data && Array.isArray(allPayments.data)
      ? allPayments.data
      : [];

    return list.filter((p) => {
      if (isTranslation) {
        return p.translation_guid === ticket.guid;
      }
      if (isHAR) {
        if (isHotel) return p.hotel_guid === ticket.guid;
        if (isAirway) return p.airway_guid === ticket.guid;
        if (isRailway) return p.railway_guid === ticket.guid;
      }
      if (isTTP) {
        if (isTour) return p.tour_guid === ticket.guid;
        if (isTransfer) return p.transfer_guid === ticket.guid;
        if (isPackage) return p.package_guid === ticket.guid;
      }
      if (isTurkish) {
        return p.turkish_airline_guid === ticket.guid || p.ta_guid === ticket.guid;
      }
      return p.b2b_guid === ticket.guid;
    });
  }, [allPayments, ticket, localPayments, isTurkish, isTranslation, isHAR, isHotel, isAirway, isRailway, isTTP, isTour, isTransfer, isPackage]);


  if (!ticket) return null;

  const salesTotal = Number(ticket.price ?? ticket.total_price ?? ticket.sale_price ?? ticket.saleFare ?? 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remaining = salesTotal - totalPaid;

  const handleEditClick = (p) => {
    setEditingPayment(p);
    reset({
      amount: p.amount,
      paymentDate: p.payment_date || p.date,
      description: p.note || p.description || "",
      opr_guid: p.opr_guid || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    reset({
      amount: "",
      paymentDate: new Date().toISOString(),
      description: "",
      opr_guid: "",
    });
  };

  const handleSavePayment = async (data) => {
    const { amount, paymentDate, description, opr_guid } = data;
    if (!amount || Number(amount) <= 0) return;

    const ticketGuid = ticket?.guid || ticket?.turkish_airline_guid || ticket?.ta_guid;
    const resolvedOprGuid =
      opr_guid ||
      ticket?.assigned_opr_guid ||
      ticket?.received_opr_guid ||
      ticket?.ta_assignment_operator?.guid ||
      ticket?.ta_receiver_operator?.guid ||
      ticket?.operator?.guid ||
      employeeOptions?.[0]?.value ||
      null;

    const nowIso = new Date().toISOString();
    const resolvedPaymentDate = paymentDate ? new Date(paymentDate).toISOString() : nowIso;

    if (editingPayment) {
      if (ticketGuid && !String(editingPayment.guid).startsWith("p-")) {
        const payload = {
          guid: editingPayment.guid,
          amount: Number(amount),
          currency: ticketCurrency,
          payment_date: resolvedPaymentDate,
          note: description?.trim() || "",
          opr_guid: resolvedOprGuid,
        };
        if (isTranslation) {
          payload.translation_guid = ticketGuid;
        } else if (isHAR) {
          payload.hotel_guid = isHotel ? ticketGuid : null;
          payload.airway_guid = isAirway ? ticketGuid : null;
          payload.railway_guid = isRailway ? ticketGuid : null;
        } else if (isTTP) {
          payload.tour_guid = isTour ? ticketGuid : null;
          payload.transfer_guid = isTransfer ? ticketGuid : null;
          payload.package_guid = isPackage ? ticketGuid : null;
        } else if (isTurkish) {
          payload.turkish_airline_guid = ticketGuid;
        } else {
          payload.b2b_guid = ticketGuid;
        }
        updatePayment(payload);
      } else {
        // Local edit fallback
        setLocalPayments((prev) =>
          prev.map((p) =>
            (p.guid || p.id) === editingPayment.guid
              ? {
                  ...p,
                  amount: Number(amount),
                  currency: ticketCurrency,
                  payment_date: resolvedPaymentDate,
                  note: description?.trim() || "",
                  opr_guid: resolvedOprGuid,
                }
              : p
          )
        );
        handleCancelEdit();
      }
    } else {
      if (ticketGuid) {
        const payload = {
          amount: Number(amount),
          currency: ticketCurrency,
          payment_date: resolvedPaymentDate,
          note: description?.trim() || "",
          opr_guid: resolvedOprGuid,
        };
        if (isTranslation) {
          payload.translation_guid = ticketGuid;
        } else if (isHAR) {
          payload.hotel_guid = isHotel ? ticketGuid : null;
          payload.airway_guid = isAirway ? ticketGuid : null;
          payload.railway_guid = isRailway ? ticketGuid : null;
        } else if (isTTP) {
          payload.tour_guid = isTour ? ticketGuid : null;
          payload.transfer_guid = isTransfer ? ticketGuid : null;
          payload.package_guid = isPackage ? ticketGuid : null;
        } else if (isTurkish) {
          payload.turkish_airline_guid = ticketGuid;
        } else {
          payload.b2b_guid = ticketGuid;
        }
        createPayment(payload);
      } else {
        // Local fallback
        const newPayment = {
          guid: getNextLocalPaymentGuid(),
          amount: Number(amount),
          currency: ticketCurrency,
          payment_date: resolvedPaymentDate,
          note: description?.trim() || "",
          opr_guid: resolvedOprGuid,
        };

        setLocalPayments((prev) => [...prev, newPayment]);
        reset({
          amount: "",
          paymentDate: new Date().toISOString(),
          description: "",
          opr_guid: "",
        });
      }
    }
  };

  // Handle deleting payment
  const handleDeletePayment = async (guid) => {
    if (ticket.guid && guid && !String(guid).startsWith("p-")) {
      deletePayment(guid);
    } else {
      // Local fallback
      setLocalPayments((prev) => prev.filter((p) => (p.guid || p.id) !== guid));
    }
  };

  return (
    <CustomDialog widthX={700} open={open} close={onClose}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t("payment.clientName")}: {clientName}
        </Typography>
        {isCredit && (
          <Chip
            label={t("payment.credit")}
            color="error"
            variant="outlined"
            sx={{
              borderRadius: "16px",
              fontWeight: 600,
              fontSize: "0.85rem",
              mr: 5,
              px: 0.5,
            }}
          />
        )}
      </Box>

      {(isCredit || payments.length > 0 || paymentsLoading) ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Summary Cards Section */}
          <Box
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
              borderRadius: "12px",
              p: 2.5,
              border: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Grid container spacing={2}>
              <Grid size={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {t("payment.salesTotal")}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {formatCurrency(salesTotal, ticketCurrency)}
                </Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {t("payment.totalPaid")}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#16a34a", mt: 0.5 }}
                >
                  {formatCurrency(totalPaid, ticketCurrency)}
                </Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {t("payment.remaining")}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#ef4444", mt: 0.5 }}
                >
                  {formatCurrency(remaining, ticketCurrency)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Payments History List */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              {t("payment.paymentHistory")}
            </Typography>
            <Box sx={{ height: "228px", display: "flex", flexDirection: "column" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : payments.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("payment.noPayments")}
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    overflowY: "auto",
                    flex: 1,
                    pr: 0.5,
                  }}
                >
                  {payments.map((p) => {
                    const operator = employees.find((emp) => emp.guid === p.opr_guid);
                    const operatorName = operator ? operator.fullName : (p.operator?.fullName || p.operator_name || "");

                    return (
                      <Card
                        key={p.guid || p.id}
                        variant="outlined"
                        sx={(theme) => ({
                          borderRadius: "8px",
                          borderColor: theme.palette.divider,
                          height: "72px",
                          flexShrink: 0,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.01)"
                              : "rgba(0,0,0,0.005)",
                        })}
                      >
                        <CardContent
                          sx={{
                            p: "10px 16px !important",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            height: "100%",
                            boxSizing: "border-box",
                            gap: 2,
                          }}
                        >
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1, minWidth: 0 }}>
                            {/* Row 1: Amount & Date/Method */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                {formatCurrency(p.amount, ticketCurrency)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {formatDateToDisplay(p.payment_date || p.date)} • {getMethodLabel(p.method)}
                              </Typography>
                            </Box>

                            {/* Row 2: Operator & Note */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", minHeight: "22px" }}>
                              {operatorName ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    fontWeight: 600,
                                    backgroundColor: (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "rgba(255,255,255,0.06)"
                                        : "rgba(0,0,0,0.04)",
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: "4px",
                                    fontSize: "0.725rem",
                                  }}
                                >
                                  👤 {operatorName}
                                </Typography>
                              ) : (
                                <span />
                              )}

                              {(p.note || p.description) ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                  sx={{
                                    fontStyle: "italic",
                                    maxWidth: "220px",
                                    fontSize: "0.75rem",
                                  }}
                                  title={p.note || p.description}
                                >
                                  {p.note || p.description}
                                </Typography>
                              ) : (
                                <span />
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEditClick(p)}
                              sx={{
                                border: "1px solid rgba(25, 118, 210, 0.2)",
                                backgroundColor: "rgba(25, 118, 210, 0.05)",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.12)",
                                  borderColor: "primary.main",
                                },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeletePayment(p.guid || p.id)}
                              sx={{
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                backgroundColor: "rgba(239, 68, 68, 0.05)",
                                "&:hover": {
                                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                                  borderColor: "error.main",
                                },
                              }}
                            >
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Box>
            {totalPages > 1 && !loading && payments.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  size="small"
                  color="primary"
                />
              </Box>
            )}

          </Box>

          {(remaining > 0 || editingPayment) ? (
            <>
              <Divider />
              <Box component="form" onSubmit={handleSubmit(handleSavePayment)} sx={{ mt: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {editingPayment ? t("payment.editPayment") : t("payment.addPayment")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <CustomTextField
                      name="amount"
                      control={control}
                      label={t("payment.amount")}
                      placeholder={t("payment.amount")}
                      type="number"
                      required
                      startIcon={<span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{currencySymbol}</span>}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomDatePicker
                      name="paymentDate"
                      control={control}
                      label={t("payment.paymentDate")}
                      required
                      showTime={true}
                    />
                  </Grid>
                  <Grid size={6}>
                    <AppAutocomplete
                      name="opr_guid"
                      control={control}
                      label={t("columns.operator") ?? "Operator"}
                      options={employeeOptions}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomTextField
                      name="description"
                      control={control}
                      label={t("payment.description")}
                      placeholder={t("payment.description")}
                    />
                  </Grid>
                </Grid>

                {/* Bottom Actions */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3.5 }}>
                  {editingPayment && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleCancelEdit}
                      sx={{
                        fontWeight: 600,
                        px: 3,
                        textTransform: "none",
                      }}
                    >
                      {t("cancel")}
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                      fontWeight: 600,
                      px: 3,
                      textTransform: "none",
                    }}
                  >
                    {t("payment.close")}
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!amountValue || Number(amountValue) <= 0}
                    sx={{
                      borderRadius: "7px",
                      fontWeight: 600,
                      px: 3,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "none",
                      },
                    }}
                  >
                    {editingPayment ? t("payment.editPayment") : t("payment.addPayment")}
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="contained"
                onClick={onClose}
                sx={{
                  borderRadius: "7px",
                  fontWeight: 600,
                  px: 4,
                  textTransform: "none",
                }}
              >
                {t("payment.close")}
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t("payment.nonCreditMessage")} ({ticket.payment_status || "Unknown"}).
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                borderRadius: "7px",
                fontWeight: 600,
                px: 3,
                textTransform: "none",
              }}
            >
              {t("payment.close")}
            </Button>
          </Box>
        </Box>
      )}
    </CustomDialog>
  );
};
