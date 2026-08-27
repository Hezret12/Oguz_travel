import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Grid,
  Typography,
  Box,
  Button,
  ButtonBase,
  Alert,
} from "@mui/material";
import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";
import ArrowCircleDownOutlinedIcon from "@mui/icons-material/ArrowCircleDownOutlined";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import CustomDatePicker from "../../components/CustomDatePicker";
import { useLocale } from "../../hooks/useLocale";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { addCashTransactionApi } from "../../api/queries/post";
import { getAllCashBoxesApi } from "../../api/queries/getters";
import { useGet } from "../../hooks/CRUD/useGet";

const INCOME_CATEGORIES = [
  { label: "Tour Sale", value: "CLIENT_SALE" },
  { label: "Flight Sale", value: "FLIGHT_SALE" },
  { label: "Transfer Sale", value: "TRANSFER_SALE" },
  { label: "Visa Sale", value: "VISA_SALE" },
  { label: "Other Income", value: "OTHER_INCOME" },
];

const EXPENSE_CATEGORIES = [
  { label: "Supplier Payment", value: "LOT_PURCHASE" },
  { label: "Office Rent", value: "OFFICE_RENT" },
  { label: "Utilities", value: "OVERHEAD" },
  { label: "Salary", value: "SALARY" },
  { label: "Marketing", value: "MARKETING" },
  { label: "Cafeteria", value: "CAFETERIA" },
  { label: "Other Expense", value: "OTHER_EXPENSE" },
];

const CURRENCY_OPTIONS = [
  { label: "USD", value: "USD" },
  { label: "TMT", value: "TMT" },
  { label: "EUR", value: "EUR" },
  { label: "TRY", value: "TRY" },
  { label: "AED", value: "AED" },
];

const AddCashTransactionModal = ({ open, close, table }) => {
  const { t } = useLocale();
  const [formError, setFormError] = useState("");

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().creatingRow);

  const handleClose = () => {
    if (table) table.setCreatingRow(null);
    setFormError("");
    close?.();
  };

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      transaction_type: "INCOME",
      category: "",
      cash_box_guid: "",
      counterparty_name: "",
      amount: "",
      currency: "USD",
      exchange_rate: "19.5",
      payment_method: "CASH",
      transaction_date: new Date().toISOString(),
      description: "",
    },
  });

  const [transactionType, currency, amount, cashBoxGuid] = useWatch({
    control,
    name: ["transaction_type", "currency", "amount", "cash_box_guid"],
  });

  const isIncome = transactionType === "INCOME";

  const { data: cashBoxesData } = useGet({
    apiFn: getAllCashBoxesApi,
    key: "all-cash-boxes",
  });

  const cashBoxOptions = (cashBoxesData || []).map((cb) => ({
    label: `${cb.name} (${cb.currency})`,
    value: cb.guid,
  }));

  const { mutate: createTransaction, isPending } = useCreate({
    apiFn: addCashTransactionApi,
    key: "cashTransactions",
    invalidateQueries: [["finance-summary"], ["all-cash-boxes"]],
    onSuccess: () => {
      reset();
      handleClose();
    },
  });

  const handleTypeChange = (type) => {
    setValue("transaction_type", type);
    setValue("category", "");
  };

  const onSubmit = (formData) => {
    setFormError("");
    const parsedAmount = Number(formData.amount);
    const parsedRate = Number(formData.exchange_rate || (formData.currency === "USD" ? 19.5 : 1.0));

    if (!parsedAmount || parsedAmount <= 0) {
      setFormError("Please enter a valid amount greater than 0");
      return;
    }
    if (!formData.cash_box_guid) {
      setFormError("Please select a cash box");
      return;
    }

    createTransaction({
      ...formData,
      amount: parsedAmount,
      exchange_rate: parsedRate,
      converted_amount_tmt: formData.currency === "TMT" ? parsedAmount : parsedAmount * parsedRate,
    });
  };

  const currentCategoryOptions = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={480}>
      <CustomDialogHeader
        variant="h6"
        title={t("finance.recordTransaction", "Record Transaction")}
        onClose={handleClose}
      />
      <CustomForm handleSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {formError && (
            <Alert severity="error" onClose={() => setFormError("")} sx={{ borderRadius: "8px" }}>
              {formError}
            </Alert>
          )}

          {/* ── Segmented Type Toggle ── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0.75,
              p: "4px",
              borderRadius: "10px",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#F1F5F9",
            }}
          >
            <ButtonBase
              type="button"
              onClick={() => handleTypeChange("INCOME")}
              sx={{
                py: 1,
                px: 2,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                fontSize: "14px",
                fontWeight: isIncome ? 700 : 500,
                color: isIncome
                  ? "#059669"
                  : "text.secondary",
                bgcolor: isIncome
                  ? "background.paper"
                  : "transparent",
                boxShadow: isIncome
                  ? (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 1px 3px rgba(0,0,0,0.4)"
                        : "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
                transition: "all 0.15s ease",
              }}
            >
              <ArrowCircleUpOutlinedIcon sx={{ fontSize: 18, color: isIncome ? "#059669" : "inherit" }} />
              Income
            </ButtonBase>

            <ButtonBase
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              sx={{
                py: 1,
                px: 2,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                fontSize: "14px",
                fontWeight: !isIncome ? 700 : 500,
                color: !isIncome
                  ? (theme) => theme.palette.mode === "dark" ? "#F87171" : "#475569"
                  : "text.secondary",
                bgcolor: !isIncome
                  ? "background.paper"
                  : "transparent",
                boxShadow: !isIncome
                  ? (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 1px 3px rgba(0,0,0,0.4)"
                        : "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
                transition: "all 0.15s ease",
              }}
            >
              <ArrowCircleDownOutlinedIcon sx={{ fontSize: 18, color: !isIncome ? "inherit" : "inherit" }} />
              Expense
            </ButtonBase>
          </Box>

          {/* ── Category ── */}
          <CustomSelect
            name="category"
            control={control}
            label={t("category", "Category")}
            placeholder="Select category"
            options={currentCategoryOptions}
            required
          />

          {/* ── Amount & Currency ── */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="amount"
                control={control}
                label={t("finance.amount", "Amount")}
                type="number"
                placeholder="0"
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                name="currency"
                control={control}
                label={t("currency", "Currency")}
                placeholder="USD"
                options={CURRENCY_OPTIONS}
                required
              />
            </Grid>
          </Grid>

          {/* ── Cash Box ── */}
          <CustomSelect
            name="cash_box_guid"
            control={control}
            label={t("finance.cashBox", "Cash Box")}
            placeholder="Select cash box"
            options={cashBoxOptions}
            required
          />

          {/* ── Counterparty & Date ── */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="counterparty_name"
                control={control}
                label={t("finance.counterparty", "Counterparty")}
                placeholder="Client / supplier"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomDatePicker
                name="transaction_date"
                control={control}
                label={t("date", "Date")}
                required
              />
            </Grid>
          </Grid>

          {/* ── Description ── */}
          <CustomTextField
            name="description"
            control={control}
            label={t("description", "Description")}
            placeholder="Optional note"
          />

          {/* ── Footer Buttons ── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1.5,
              pt: 1,
            }}
          >
            <Button
              type="button"
              onClick={handleClose}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                color: "text.secondary",
                px: 2,
                py: 0.8,
                borderRadius: "8px",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                px: 3,
                py: 0.9,
                borderRadius: "8px",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "#334155"
                    : "#64748b",
                color: "#ffffff",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "#475569"
                      : "#475569",
                  boxShadow: "none",
                },
              }}
            >
              {isPending ? "Saving..." : "Review"}
            </Button>
          </Box>
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default AddCashTransactionModal;
