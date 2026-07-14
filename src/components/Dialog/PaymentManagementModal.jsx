import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
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
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import { CustomDialog } from "./CustomDialog";
import CustomTextField from "../CustomTextField";
import CustomDatePicker from "../CustomDatePicker";
import AppAutocomplete from "../AppAutocomplete";
import { useLocale } from "../../hooks/useLocale";
import { getAllPaymentStatusApi, getAllEmployeeApi } from "../../api/queries/getters";
import { deleteTicketPaymentApi } from "../../api/queries/delete";
import { addPaymentApi } from "../../api/queries/post";
import { useGet } from "../../hooks/CRUD/useGet";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { useDelete } from "../../hooks/CRUD/useDelete";

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
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

  const isCredit =
    ticket?.is_paid === false ||
    ticket?.payment_types === "credit" ||
    ticket?.payment_status?.toLowerCase() === "kredit";

  const [localPayments, setLocalPayments] = useState([]);

  const { handleSubmit, reset, watch, control } = useForm({
    defaultValues: {
      amount: "",
      paymentDate: new Date().toISOString(),
      description: "",
      opr_guid: "",
    },
  });

  const amountValue = watch("amount");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const queryParams = useMemo(() => ({
    b2b_guid: ticket?.guid,
    page,
    limit,
  }), [ticket?.guid, page, limit]);

  const { data: allPayments, isLoading: paymentsLoading } = useGet({
    apiFn: getAllPaymentStatusApi,
    key: "payment-status",
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
  const rawData = queryClient.getQueryData(["payment-status", queryParams]);
  const totalPages = rawData?.data?.meta?.totalPages ?? 1;

  const { mutate: createPayment, isPending: createLoading } = useCreate({
    apiFn: addPaymentApi,
    key: "payment-status",
    invalidateQueries: ["payment-status"],
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
    deleteFn: deleteTicketPaymentApi,
    queryKey: ["payment-status", queryParams],
    idKey: "guid",
  });

  const loading = paymentsLoading || createLoading || deleteLoading;

  const payments = useMemo(() => {
    if (!ticket?.guid) {
      return localPayments;
    }
    return (allPayments || []).filter((p) => p.b2b_guid === ticket.guid);
  }, [allPayments, ticket, localPayments]);


  if (!ticket) return null;

  const salesTotal = Number(ticket.sale_price ?? ticket.saleFare ?? 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remaining = salesTotal - totalPaid;


  const handleAddPayment = async (data) => {
    const { amount, paymentDate, description, opr_guid } = data;
    if (!amount || Number(amount) <= 0) return;

    if (ticket.guid) {
      const payload = {
        b2b_guid: ticket.guid,
        amount: Number(amount),
        payment_date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        note: description?.trim() || "",
        opr_guid: opr_guid || null,
      };
      createPayment(payload);
    } else {
      // Local fallback
      const newPayment = {
        guid: `p-${Date.now()}`,
        amount: Number(amount),
        payment_date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        note: description?.trim() || "",
        opr_guid: opr_guid || null,
      };

      setLocalPayments((prev) => [...prev, newPayment]);
      reset({
        amount: "",
        paymentDate: new Date().toISOString(),
        description: "",
        opr_guid: "",
      });
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
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Müşderi ady: {clientName}
          </Typography>
        </Box>
        {isCredit && (
          <Chip
            label="Credit"
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

      {isCredit ? (
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
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Satyş baha (Sales Total)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {formatCurrency(salesTotal)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Jemi tolendi (Total Paid)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#16a34a", mt: 0.5 }}
                >
                  {formatCurrency(totalPaid)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Galdy (Remaining)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#ef4444", mt: 0.5 }}
                >
                  {formatCurrency(remaining)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Payments History List */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Tolegler (Payments History)
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minHeight: "60px", justifyContent: "center" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : payments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  Toleg ýok (No payments history)
                </Typography>
              ) : (
                <>
                  {payments.map((p) => (
                    <Card
                      key={p.guid || p.id}
                      variant="outlined"
                      sx={(theme) => ({
                        borderRadius: "8px",
                        borderColor: theme.palette.divider,
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.01)"
                            : "rgba(0,0,0,0.005)",
                      })}
                    >
                      <CardContent
                        sx={{
                          p: "12px 16px !important",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {formatCurrency(p.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {formatDateToDisplay(p.payment_date || p.date)} • {getMethodLabel(p.method)}{p.note || p.description ? ` • ${p.note || p.description}` : ""}
                          </Typography>
                        </Box>
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
                      </CardContent>
                    </Card>
                  ))}
                  {totalPages > 1 && (
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
                </>
              )}
            </Box>

          </Box>

          <Divider />

          {/* Create Payment Form */}
          <Box component="form" onSubmit={handleSubmit(handleAddPayment)}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Toleg goş (Add Payment)
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <CustomTextField
                  name="amount"
                  control={control}
                  label="Mukdar (Amount)"
                  placeholder="Amount"
                  type="number"
                  required
                  startIcon={<AttachMoneyIcon fontSize="small" />}
                />
              </Grid>
              <Grid size={6}>
                <CustomDatePicker
                  name="paymentDate"
                  control={control}
                  label="Toleg senesi (Payment Date)"
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
                  label="Bellik (Description)"
                  placeholder="Bellik"
                />
              </Grid>
            </Grid>

            {/* Bottom Actions */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3.5 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  fontWeight: 600,
                  px: 3,
                  textTransform: "none",
                }}
              >
                Ýap (Close)
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
                Toleg goş (Add Payment)
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This ticket is fully paid or not a credit transaction (Payment Status
            {ticket.payment_status || "Unknown"}).
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
              Close
            </Button>
          </Box>
        </Box>
      )}
    </CustomDialog>
  );
};
