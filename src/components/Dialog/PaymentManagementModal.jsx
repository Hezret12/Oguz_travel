import { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Box,
  Typography,
  Chip,
  Grid,
  IconButton,
  Button,
  List,
  ListItem,
  CircularProgress,
  Divider,
  Pagination,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  alpha,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { PenLine, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

import { CustomDialog } from "./CustomDialog";
import CustomTextField from "../CustomTextField";
import CustomDatePicker from "../CustomDatePicker";
import GlobalEmployeeAutocomplete from "../global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { useLocale } from "../../hooks/useLocale";
import { getAllPaymentStatusApi, getAllEmployeeApi, getAllTransPaymentApi, getAllHarPaymentApi, getAllTtpPaymentApi, getAllTurkishPaymentApi, getAllVisaPaymentApi } from "../../api/queries/getters";
import { deleteTicketPaymentApi, deleteTransPaymentApi, deleteHarPaymentApi, deleteTtpPaymentApi, deleteTurkishPaymentApi, deleteVisaPaymentApi } from "../../api/queries/delete";
import { addPaymentApi, addTransPaymentApi, addHarPaymentApi, addTtpPaymentApi, addTurkishPaymentApi, addVisaPaymentApi } from "../../api/queries/post";
import { updateTicketPaymentApi, updateTransPaymentApi, updateHarPaymentApi, updateTtpPaymentApi, updateTurkishPaymentApi, updateVisaPaymentApi } from "../../api/queries/patch";
import { useGet } from "../../hooks/CRUD/useGet";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { useDelete } from "../../hooks/CRUD/useDelete";
import { useUpdate } from "../../hooks/CRUD/useUpdate";

// Fixed body height so the modal doesn't jump around as the add/edit form,
// payment count, or credit/non-credit branch change — only the scrollable
// history list adapts inside this fixed frame.
const MODAL_BODY_HEIGHT = 600;

const CURRENCY_SYMBOLS = {
  USD: "$",
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
  const d = dayjs(dateStr);
  return d.isValid() ? d.format("DD.MM.YYYY HH:mm") : dateStr;
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

  const isTranslation = useMemo(() => {
    if (!ticket) return false;
    return "source_to_target" in ticket || "page_count" in ticket || "completed_page_count" in ticket;
  }, [ticket]);

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
    if (
      "train_type" in ticket ||
      "hotel_name" in ticket ||
      "transfer_type" in ticket ||
      "tour_name" in ticket ||
      "partner" in ticket
    ) {
      return false;
    }
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

  // A visa has two separate prices (TMT and USD); each currency is paid and
  // tracked on its own, never converted into the other.
  const isVisa = useMemo(() => {
    if (!ticket) return false;
    return "price_tmt" in ticket || "price_usd" in ticket;
  }, [ticket]);

  // Opens on the currency that still has something to pay.
  const defaultVisaCurrency = () => {
    const leftTmt = Number(ticket?.price_tmt || 0) - Number(ticket?.totalPaidTmt || 0);
    const leftUsd = Number(ticket?.price_usd || 0) - Number(ticket?.totalPaidUsd || 0);
    if (leftTmt > 0) return "TMT";
    if (leftUsd > 0) return "USD";
    return Number(ticket?.price_usd || 0) > 0 && !Number(ticket?.price_tmt || 0) ? "USD" : "TMT";
  };
  const [visaCurrency, setVisaCurrency] = useState(defaultVisaCurrency);

  const ticketCurrency = isVisa ? visaCurrency : ticket?.currency || (isTranslation ? "TMT" : "USD");

  const isCredit =
    ticket?.is_paid === false ||
    ticket?.is_paid === 2 ||
    ticket?.is_paid === "2" ||
    ticket?.payment_types === "credit" ||
    ticket?.payment_status?.toLowerCase() === "kredit" ||
    isHAR ||
    isTTP ||
    isTranslation ||
    isTurkish ||
    isVisa;

  const apiFn = isTranslation
    ? getAllTransPaymentApi
    : isHAR
    ? getAllHarPaymentApi
    : isTTP
    ? getAllTtpPaymentApi
    : isTurkish
    ? getAllTurkishPaymentApi
    : isVisa
    ? getAllVisaPaymentApi
    : getAllPaymentStatusApi;

  const key = isTranslation
    ? "trans-payment"
    : isHAR
    ? "har-payment"
    : isTTP
    ? "ttp-payment"
    : isTurkish
    ? "turkish-payment"
    : isVisa
    ? "visa-payment"
    : "payment-status";

  const [localPayments, setLocalPayments] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);
  const [prevTicketKey, setPrevTicketKey] = useState(null);
  const activeCurrency = editingPayment?.currency || ticketCurrency || "USD";
  const [hasChanged, setHasChanged] = useState(false);
  const exchangeRate = useMemo(() => {
    return parseFloat(localStorage.getItem("finance_usd_tmt_rate") || "19.5") || 19.5;
  }, []);
  const queryClient = useQueryClient();

  const currentTicketKey = open && ticket ? (ticket.guid || ticket.id || "open") : null;
  if (currentTicketKey !== prevTicketKey) {
    setPrevTicketKey(currentTicketKey);
    setEditingPayment(null);
    setLocalPayments([]);
    setHasChanged(false);
    setVisaCurrency(defaultVisaCurrency());
    if (currentTicketKey) {
      queryClient.removeQueries({ queryKey: [key] });
    }
  }

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
    } else if (isVisa) {
      params.visa_guid = ticket?.guid;
    } else {
      params.b2b_guid = ticket?.guid;
    }
    return params;
  }, [ticket?.guid, page, limit, isTurkish, isTranslation, isHAR, isHotel, isAirway, isRailway, isTTP, isTour, isTransfer, isPackage, isVisa]);

  const { data: allPayments, rawResponse, isLoading: paymentsLoading, refetch: refetchPayments } = useGet({
    apiFn,
    key,
    params: queryParams,
    options: {
      enabled: open && !!ticket?.guid,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
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

  const responseData = rawResponse?.data || rawResponse;
  const totalPages = useMemo(() => {
    if (!responseData) return 1;
    if (responseData.data?.meta?.totalPages !== undefined) {
      return responseData.data.meta.totalPages;
    }
    if (responseData.meta?.totalPages !== undefined) {
      return responseData.meta.totalPages;
    }
    return 1;
  }, [responseData]);

  const { mutate: createPayment, isPending: createLoading } = useCreate({
    apiFn: isTranslation
      ? addTransPaymentApi
      : isHAR
      ? addHarPaymentApi
      : isTTP
      ? addTtpPaymentApi
      : isTurkish
      ? addTurkishPaymentApi
      : isVisa
      ? addVisaPaymentApi
      : addPaymentApi,
    key: key,
    invalidateQueries: [key],
    onSuccess: () => {
      setHasChanged(true);
      reset({
        amount: "",
        paymentDate: new Date().toISOString(),
        description: "",
        opr_guid: "",
      });
      refetchPayments?.();
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
      : isVisa
      ? deleteVisaPaymentApi
      : deleteTicketPaymentApi,
    queryKey: [key, queryParams],
    idKey: "guid",
    invalidateQueries: [key],
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
      : isVisa
      ? updateVisaPaymentApi
      : updateTicketPaymentApi,
    key: key,
    idKey: "guid",
    invalidateQueries: [key],
    onSuccessUpdate: () => {
      setHasChanged(true);
      handleCancelEdit();
      refetchPayments?.();
    },
  });

  const handleModalClose = () => {
    onClose?.(hasChanged);
  };

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
        return p.translation_guid === ticket.guid || p.translationGuid === ticket.guid || p.translation?.guid === ticket.guid;
      }
      if (isHAR) {
        if (isHotel) return p.hotel_guid === ticket.guid || p.hotelGuid === ticket.guid || p.hotel?.guid === ticket.guid;
        if (isAirway) return p.airway_guid === ticket.guid || p.airwayGuid === ticket.guid || p.airway?.guid === ticket.guid;
        if (isRailway) return p.railway_guid === ticket.guid || p.railwayGuid === ticket.guid || p.railway?.guid === ticket.guid;
      }
      if (isTTP) {
        if (isTour) return p.tour_guid === ticket.guid || p.tourGuid === ticket.guid || p.tour?.guid === ticket.guid;
        if (isTransfer) return p.transfer_guid === ticket.guid || p.transferGuid === ticket.guid || p.transfer?.guid === ticket.guid;
        if (isPackage) return p.package_guid === ticket.guid || p.packageGuid === ticket.guid || p.package?.guid === ticket.guid;
      }
      if (isVisa) {
        return p.visa_guid === ticket.guid || p.visa?.guid === ticket.guid;
      }
      if (isTurkish) {
        return (
          p.turkish_airline_guid === ticket.guid ||
          p.turkishAirlineGuid === ticket.guid ||
          p.ta_guid === ticket.guid ||
          p.turkish_airline?.guid === ticket.guid
        );
      }
      return (
        p.b2b_guid === ticket.guid ||
        p.b2bGuid === ticket.guid ||
        p.b2b?.guid === ticket.guid ||
        p.ticket_guid === ticket.guid ||
        p.ticketGuid === ticket.guid
      );
    });
  }, [allPayments, ticket, localPayments, isTurkish, isTranslation, isHAR, isHotel, isAirway, isRailway, isTTP, isTour, isTransfer, isPackage, isVisa]);


  const isInitialLoading = paymentsLoading && !rawResponse;
  const rawStats = responseData?.stats || responseData?.data?.stats || allPayments?.stats;
  // Visa stats come per currency ({ TMT: {...}, USD: {...} }); use the selected one.
  const stats = isVisa ? rawStats?.[visaCurrency] : rawStats;
  const salesTotal = Number(
    stats?.total_sales ??
    (isVisa ? ticket?.["price_" + visaCurrency.toLowerCase()] : undefined) ??
    ticket?.price ??
    ticket?.total_price ??
    ticket?.sale_price ??
    ticket?.saleFare ??
    0
  );
  const paidUsd = useMemo(() => {
    return payments
      .filter((p) => (p.currency || ticketCurrency) === "USD")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments, ticketCurrency]);

  const paidTmt = useMemo(() => {
    return payments
      .filter((p) => (p.currency || ticketCurrency) === "TMT")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments, ticketCurrency]);

  // Visa currencies are separate balances, never mixed or converted.
  const hasMixedPaid = !isVisa && paidUsd > 0 && paidTmt > 0;

  const convertedTotalPaid = useMemo(() => {
    if (hasMixedPaid) {
      if (ticketCurrency === "USD") {
        return paidUsd + (paidTmt / exchangeRate);
      }
      return paidTmt + (paidUsd * exchangeRate);
    }
    return stats?.total_paid !== undefined
      ? Number(stats.total_paid)
      : payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [hasMixedPaid, ticketCurrency, paidUsd, paidTmt, exchangeRate, stats, payments]);

  const totalPaid = convertedTotalPaid;
  const remaining = Math.max(
    0,
    stats?.remaining !== undefined && !hasMixedPaid
      ? Number(stats.remaining)
      : (salesTotal - convertedTotalPaid)
  );

  // A visa is paid only when both of its currencies are.
  const isFullyPaid =
    !isInitialLoading &&
    (isVisa && rawStats
      ? Number(rawStats?.TMT?.remaining ?? 0) <= 0.01 && Number(rawStats?.USD?.remaining ?? 0) <= 0.01
      : remaining <= 0.01);

  const handleEditClick = (p) => {
    // Editing a payment in the other currency switches the balance shown.
    if (isVisa && p.currency) setVisaCurrency(p.currency);
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
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) return;

    if (!editingPayment && remaining > 0 && numAmount > (remaining + 0.01)) {
      toast.error(
        `${t("payment.amountExceedsRemaining")} (${formatCurrency(remaining, ticketCurrency)})`
      );
      return;
    }

    const ticketGuid =
      ticket?.guid ||
      ticket?.turkish_airline_guid ||
      ticket?.ta_guid ||
      ticket?.hotel_guid ||
      ticket?.airway_guid ||
      ticket?.railway_guid ||
      ticket?.tour_guid ||
      ticket?.transfer_guid ||
      ticket?.package_guid;
    const resolvedOprGuid =
      opr_guid ||
      ticket?.assignment_opr_guid ||
      ticket?.receiver_opr_guid ||
      ticket?.assigned_opr_guid ||
      ticket?.received_opr_guid ||
      ticket?.ta_assignment_operator?.guid ||
      ticket?.ta_receiver_operator?.guid ||
      ticket?.assignment_operator?.guid ||
      ticket?.receiver_operator?.guid ||
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
          currency: activeCurrency,
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
        } else if (isVisa) {
          payload.visa_guid = ticketGuid;
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
                  currency: activeCurrency,
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
        } else if (isVisa) {
          payload.visa_guid = ticketGuid;
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
    if (ticket?.guid && guid && !String(guid).startsWith("p-")) {
      deletePayment(guid, {
        onSuccess: () => {
          setHasChanged(true);
          refetchPayments?.();
        },
      });
    } else {
      // Local fallback
      setLocalPayments((prev) => prev.filter((p) => (p.guid || p.id) !== guid));
      setHasChanged(true);
    }
  };

  if (!ticket) return null;

  return (
    <CustomDialog widthX={700} open={open} close={handleModalClose}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t("payment.clientName")}: {clientName}
        </Typography>
        {!isInitialLoading && (
          isFullyPaid ? (
            <Chip
              label="Tölendi"
              color="success"
              variant="outlined"
              sx={{
                borderRadius: "16px",
                fontWeight: 600,
                fontSize: "0.85rem",
                mr: 5,
                px: 0.5,
              }}
            />
          ) : (
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
          )
        )}
      </Box>

      {(isCredit || payments.length > 0 || paymentsLoading) ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: MODAL_BODY_HEIGHT,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {/* Visa: pick the currency whose balance is shown and paid */}
          {isVisa && (
            <ToggleButtonGroup
              exclusive
              size="small"
              value={visaCurrency}
              onChange={(_e, next) => {
                if (!next || editingPayment) return;
                setVisaCurrency(next);
              }}
              sx={{ alignSelf: "flex-start", flexShrink: 0 }}
            >
              {["TMT", "USD"].map((cur) => (
                <ToggleButton key={cur} value={cur} sx={{ px: 2, fontWeight: 700, textTransform: "none" }}>
                  {cur}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          {/* Summary Cards Section (Inline & Sleek) */}
          <Box
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
              borderRadius: "10px",
              px: 2.5,
              py: 1.25,
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
              flexShrink: 0,
            })}
          >
            {/* Jemi satuw */}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.875rem" }}
              >
                {t("payment.salesTotal")}:
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", lineHeight: 1 }}>
                {formatCurrency(salesTotal, ticketCurrency)}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

            {/* Tölendi */}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.875rem" }}
              >
                {t("payment.totalPaid")}:
              </Typography>
              {isInitialLoading ? (
                <Skeleton variant="rounded" width={80} height={24} />
              ) : hasMixedPaid ? (
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      lineHeight: 1,
                      color: "#16a34a",
                    }}
                  >
                    ${paidUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.secondary" }}
                  >
                    +
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      lineHeight: 1,
                      color: "#16a34a",
                    }}
                  >
                    {paidTmt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m
                  </Typography>
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    lineHeight: 1,
                    color: "#16a34a",
                  }}
                >
                  {formatCurrency(totalPaid, ticketCurrency)}
                </Typography>
              )}
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

            {/* Galan */}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.875rem" }}
              >
                {t("payment.remaining")}:
              </Typography>
              {isInitialLoading ? (
                <Skeleton variant="rounded" width={80} height={24} />
              ) : (
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    lineHeight: 1,
                    color: remaining > 0 ? "#ef4444" : "#16a34a",
                  }}
                >
                  {formatCurrency(remaining, ticketCurrency)}
                </Typography>
              )}
            </Box>
          </Box>

          {(remaining > 0 || editingPayment) && (
            <>
              <Box component="form" onSubmit={handleSubmit(handleSavePayment)} sx={{ flexShrink: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {editingPayment ? t("payment.editPayment") : t("payment.addPayment")}
                </Typography>
                <Grid container spacing={2}>
                  {/* Row 1: Employee and Date */}
                  <Grid size={6}>
                    <GlobalEmployeeAutocomplete
                      name="opr_guid"
                      control={control}
                      label={t("columns.operator")}
                      initialEmployee={editingPayment?.operator || employees.find((e) => e.guid === editingPayment?.opr_guid) || null}
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

                  {/* Row 2: Price and Note */}
                  <Grid size={6}>
                    <CustomTextField
                      name="amount"
                      control={control}
                      label={t("payment.amount")}
                      placeholder={t("payment.amount")}
                      type="number"
                      required
                      startIcon={
                        <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                          {CURRENCY_SYMBOLS[activeCurrency] || "$"}
                        </span>
                      }
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
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
                  {editingPayment && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleCancelEdit}
                      sx={{
                        fontWeight: 600,
                        px: 2.5,
                        textTransform: "none",
                      }}
                    >
                      {t("cancel")}
                    </Button>
                  )}
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
          )}

          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, flexShrink: 0 }}>
              {t("payment.paymentHistory")}
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {loading ? (
                <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              ) : payments.length === 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("payment.noPayments")}
                  </Typography>
                </Box>
              ) : (
                <List
                  disablePadding
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                  }}
                >
                  {payments.map((p, idx) => {
                    const operator = employees.find((emp) => emp.guid === p.opr_guid);
                    const operatorName = operator ? operator.fullName : (p.operator?.fullName || p.operator_name || "");

                    return (
                      <ListItem
                        key={p.guid || p.id}
                        divider={idx < payments.length - 1}
                        sx={{
                          py: 1,
                          px: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1, minWidth: 0 }}>
                          {/* Row 1: Amount & Date/Method */}
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                {formatCurrency(p.amount, p.currency || ticketCurrency)}
                              </Typography>
                              {!isVisa && p.currency && p.currency !== ticketCurrency && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontWeight: 500,
                                    fontSize: "11px",
                                  }}
                                >
                                  (≈ {formatCurrency(
                                    p.currency === "TMT"
                                      ? Number(p.amount) / exchangeRate
                                      : Number(p.amount) * exchangeRate,
                                    ticketCurrency
                                  )})
                                </Typography>
                              )}
                            </Box>
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
                                  bgcolor: "action.hover",
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
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Tooltip title={t("edit")} arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(p)}
                              sx={(theme) => ({
                                width: 28,
                                height: 28,
                                borderRadius: "6px",
                                border: "1px solid",
                                borderColor: alpha(theme.palette.primary.main, 0.25),
                                bgcolor: alpha(theme.palette.primary.main, 0.06),
                                color: "primary.main",
                                transition: "all 0.15s ease",
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.16),
                                  borderColor: "primary.main",
                                  transform: "translateY(-1px)",
                                  boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.25)}`,
                                },
                                "&:active": {
                                  transform: "scale(0.95)",
                                },
                              })}
                            >
                              <PenLine size={14} strokeWidth={2} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("delete")} arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePayment(p.guid || p.id)}
                              sx={(theme) => ({
                                width: 28,
                                height: 28,
                                borderRadius: "6px",
                                border: "1px solid",
                                borderColor: alpha(theme.palette.error.main, 0.25),
                                bgcolor: alpha(theme.palette.error.main, 0.06),
                                color: "error.main",
                                transition: "all 0.15s ease",
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.error.main, 0.16),
                                  borderColor: "error.main",
                                  transform: "translateY(-1px)",
                                  boxShadow: `0 2px 6px ${alpha(theme.palette.error.main, 0.25)}`,
                                },
                                "&:active": {
                                  transform: "scale(0.95)",
                                },
                              })}
                            >
                              <Trash2 size={14} strokeWidth={2} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
            {totalPages > 1 && !loading && payments.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2, flexShrink: 0 }}>
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

          {/* Modal Footer Close Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, flexShrink: 0 }}>
            <Button
              variant="outlined"
              onClick={handleModalClose}
              sx={{
                fontWeight: 600,
                px: 3.5,
                textTransform: "none",
                borderRadius: "7px",
              }}
            >
              {t("payment.close")}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            height: MODAL_BODY_HEIGHT,
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t("payment.nonCreditMessage")} ({ticket.payment_status || "Unknown"}).
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={handleModalClose}
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
