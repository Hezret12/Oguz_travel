import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Grid,
  Typography,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import { FooterButton } from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import CustomDatePicker from "../../components/CustomDatePicker";
import AppAutocomplete from "../../components/AppAutocomplete";
import { useLocale } from "../../hooks/useLocale";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { addCashTransactionApi } from "../../api/queries/post";
import { getAllCashBoxesApi } from "../../api/queries/getters";
import { useGet } from "../../hooks/CRUD/useGet";

const TRANSACTION_TYPES = [
  { label: "Girdeji / Money In (INCOME)", value: "INCOME" },
  { label: "Çykdajy / Money Out (EXPENSE)", value: "EXPENSE" },
  { label: "Üpjün edijä töleg (SUPPLIER_PAYMENT)", value: "SUPPLIER_PAYMENT" },
  { label: "Müşderi tölegi (CLIENT_PAYMENT)", value: "CLIENT_PAYMENT" },
  { label: "Kassa arasynda geçirim (TRANSFER)", value: "TRANSFER" },
];

const CATEGORY_OPTIONS = [
  { label: "Partiýa satyn alnyşy (LOT_PURCHASE)", value: "LOT_PURCHASE" },
  { label: "Müşderi satyşy (CLIENT_SALE)", value: "CLIENT_SALE" },
  { label: "Ofis kireýi (OFFICE_RENT)", value: "OFFICE_RENT" },
  { label: "Aýlyk haky (SALARY)", value: "SALARY" },
  { label: "Kafeteriýa (CAFETERIA)", value: "CAFETERIA" },
  { label: "Mahabat / Marketing (MARKETING)", value: "MARKETING" },
  { label: "Beýleki çykdajylar (OVERHEAD)", value: "OVERHEAD" },
];

const PAYMENT_METHODS = [
  { label: "Nagt (CASH)", value: "CASH" },
  { label: "Karta (CARD)", value: "CARD" },
  { label: "Bank hasaby / Hasaplaşyk (BANK_TRANSFER)", value: "BANK_TRANSFER" },
];

const CURRENCY_OPTIONS = [
  { label: "USD ($)", value: "USD" },
  { label: "TMT (m)", value: "TMT" },
  { label: "EUR (€)", value: "EUR" },
  { label: "TRY (₺)", value: "TRY" },
  { label: "AED (AED)", value: "AED" },
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

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      transaction_type: "EXPENSE",
      category: "OVERHEAD",
      cash_box_guid: "",
      counterparty_name: "",
      amount: "",
      currency: "USD",
      exchange_rate: "19.5",
      payment_method: "CASH",
      transaction_date: new Date(),
      description: "",
    },
  });

  const [amount, currency, exchangeRate, transactionType, cashBoxGuid] = useWatch({
    control,
    name: ["amount", "currency", "exchange_rate", "transaction_type", "cash_box_guid"],
  });

  const { data: cashBoxesData } = useGet({
    apiFn: getAllCashBoxesApi,
    key: "all-cash-boxes",
  });

  const selectedCashBox = (cashBoxesData || []).find((cb) => cb.guid === cashBoxGuid);

  const cashBoxOptions = (cashBoxesData || []).map((cb) => ({
    label: `${cb.name} — Balance: ${Number(cb.current_balance || 0).toLocaleString()} ${cb.currency}`,
    value: cb.guid,
  }));

  const numAmount = Number(amount || 0);
  const numRate = Number(exchangeRate || 1.0);
  const calculatedTmt = currency === "TMT" ? numAmount : numAmount * numRate;

  const isIncome = transactionType === "INCOME" || transactionType === "CLIENT_PAYMENT";
  const isExpense = transactionType === "EXPENSE" || transactionType === "SUPPLIER_PAYMENT";

  // Balance warning
  const isBalanceExceeded =
    isExpense &&
    selectedCashBox &&
    selectedCashBox.currency === currency &&
    numAmount > Number(selectedCashBox.current_balance || 0);

  const isHighValue = numAmount >= 2000;

  const { mutate: createTransaction, isPending } = useCreate({
    apiFn: addCashTransactionApi,
    key: "cashTransactions",
    invalidateQueries: [["finance-summary"], ["all-cash-boxes"]],
    onSuccess: () => {
      reset();
      handleClose();
    },
  });

  const onSubmit = (formData) => {
    setFormError("");
    const parsedAmount = Number(formData.amount);
    const parsedRate = Number(formData.exchange_rate || 1.0);

    if (parsedAmount <= 0) {
      setFormError("Mukdar 0-dan uly bolmaly!");
      return;
    }
    if (parsedRate <= 0) {
      setFormError("Walýuta kursy 0-dan uly bolmaly!");
      return;
    }
    if (!formData.cash_box_guid) {
      setFormError("Kassa hökmany saýlanmaly!");
      return;
    }

    createTransaction({
      ...formData,
      amount: parsedAmount,
      exchange_rate: parsedRate,
      converted_amount_tmt: currency === "TMT" ? parsedAmount : parsedAmount * parsedRate,
    });
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={720}>
      <CustomDialogHeader
        variant="h5"
        title={t("finance.addTransaction")}
        onClose={handleClose}
      />
      <CustomForm handleSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ p: 2.5 }}>
          {formError && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error" onClose={() => setFormError("")}>
                {formError}
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="transaction_type"
              control={control}
              label={t("finance.transactionType")}
              options={TRANSACTION_TYPES}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="category"
              control={control}
              label={t("category", "Kategoriýa")}
              options={CATEGORY_OPTIONS}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <AppAutocomplete
              name="cash_box_guid"
              control={control}
              label={t("finance.cashBox")}
              options={cashBoxOptions}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="counterparty_name"
              control={control}
              label={t("finance.counterparty")}
              placeholder="e.g. Pegasus Airlines / Ahmet Yılmaz"
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              name="amount"
              control={control}
              label={t("finance.amount")}
              type="number"
              slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomSelect
              name="currency"
              control={control}
              label={t("currency", "Walýuta")}
              options={CURRENCY_OPTIONS}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              name="exchange_rate"
              control={control}
              label="Kurs (1 Unit = ? TMT)"
              type="number"
              slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              required
            />
          </Grid>

          {/* Real-time TMT conversion pill */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isIncome ? "success.50" : "error.50",
                border: "1px solid",
                borderColor: isIncome ? "success.200" : "error.200",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isIncome ? (
                  <TrendingUpRoundedIcon sx={{ color: "success.main" }} />
                ) : (
                  <TrendingDownRoundedIcon sx={{ color: "error.main" }} />
                )}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {isIncome ? "Kassa girdejisi (Money In)" : "Kassadan çykdajy (Money Out)"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Konwertirlenen TMT mukdary:
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: isIncome ? "success.main" : "error.main",
                }}
              >
                {isIncome ? "+" : "-"}
                {calculatedTmt.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TMT
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="payment_method"
              control={control}
              label={t("finance.paymentMethod")}
              options={PAYMENT_METHODS}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              name="transaction_date"
              control={control}
              label={t("date", "Senesi")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomTextField
              name="description"
              control={control}
              label={t("description", "Düşündiriş")}
              placeholder="e.g. Dubai bilet bron tölegi ýa-da ofis kireýi..."
              multiline
              rows={2}
            />
          </Grid>

          {/* Insufficient Cash Box Balance Alert */}
          {isBalanceExceeded && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                <strong>Duýduryş:</strong> Saýlanan kassadaky bakiýe ({selectedCashBox?.current_balance} {currency}) çykarylýan mukdardan ({numAmount} {currency}) az! Kassa balansy minusa geçip biler.
              </Alert>
            </Grid>
          )}

          {/* High value safety banner */}
          {isHighValue && (
            <Grid size={{ xs: 12 }}>
              <Alert
                severity="warning"
                icon={<WarningAmberRoundedIcon fontSize="inherit" />}
                sx={{ borderRadius: 2 }}
              >
                <strong>Tassyklaň:</strong> Siz {numAmount.toLocaleString()} {currency} ({calculatedTmt.toLocaleString()} TMT) möçberinde uly pul amaly goşýarsyňyz.
              </Alert>
            </Grid>
          )}
        </Grid>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddCashTransactionModal;
