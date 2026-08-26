import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Grid,
  Typography,
  Box,
  Divider,
  Alert,
  InputAdornment,
  Button,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
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
import { addPurchaseLotApi } from "../../api/queries/post";
import { getAllSuppliersApi, getAllCashBoxesApi } from "../../api/queries/getters";
import { useGet } from "../../hooks/CRUD/useGet";

const SERVICE_TYPE_OPTIONS = [
  { label: "Visa Slot / Quota (VISA_SLOT)", value: "VISA_SLOT" },
  { label: "Hotel Allotment (HOTEL_ALLOTMENT)", value: "HOTEL_ALLOTMENT" },
  { label: "Flight Quota / Block (FLIGHT_QUOTA)", value: "FLIGHT_QUOTA" },
  { label: "Tour Package Bulk (TOUR_PACKAGE)", value: "TOUR_PACKAGE" },
  { label: "Transfer Bulk (TRANSFER)", value: "TRANSFER" },
];

const CURRENCY_OPTIONS = [
  { label: "USD ($)", value: "USD" },
  { label: "TMT (m)", value: "TMT" },
  { label: "EUR (€)", value: "EUR" },
  { label: "TRY (₺)", value: "TRY" },
  { label: "AED (AED)", value: "AED" },
];

const AddPurchaseLotModal = ({ open, close, table }) => {
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
      lot_number: "",
      name: "",
      supplier_guid: "",
      service_type: "VISA_SLOT",
      unit_type: "slot",
      total_quantity: "",
      unit_cost: "",
      total_cost: "",
      currency: "USD",
      purchase_date: new Date(),
      expiry_date: null,
      initial_paid_amount: "",
      cash_box_guid: "",
    },
  });

  const [totalQuantity, unitCost, currency, initialPaidAmount, cashBoxGuid, serviceType] =
    useWatch({
      control,
      name: [
        "total_quantity",
        "unit_cost",
        "currency",
        "initial_paid_amount",
        "cash_box_guid",
        "service_type",
      ],
    });

  const calculatedTotal =
    Number(totalQuantity || 0) > 0 && Number(unitCost || 0) > 0
      ? Number(totalQuantity) * Number(unitCost)
      : 0;

  useEffect(() => {
    if (calculatedTotal > 0) {
      setValue("total_cost", calculatedTotal.toFixed(2));
    }
  }, [calculatedTotal, setValue]);

  // Auto-generate lot number helper
  const handleGenerateLotNumber = () => {
    const year = new Date().getFullYear();
    const prefix = (serviceType || "LOT").substring(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setValue("lot_number", `LOT-${year}-${prefix}-${randomNum}`, {
      shouldValidate: true,
    });
  };

  // Queries
  const { data: suppliersData } = useGet({
    apiFn: getAllSuppliersApi,
    key: "all-suppliers",
  });
  const supplierOptions = (suppliersData || []).map((s) => ({
    label: s.name,
    value: s.guid,
  }));

  const { data: cashBoxesData } = useGet({
    apiFn: getAllCashBoxesApi,
    key: "all-cash-boxes",
  });
  const cashBoxOptions = (cashBoxesData || []).map((cb) => ({
    label: `${cb.name} (${cb.currency}) — Balance: ${Number(cb.current_balance || 0).toLocaleString()} ${cb.currency}`,
    value: cb.guid,
  }));

  const { mutate: createLot, isPending } = useCreate({
    apiFn: addPurchaseLotApi,
    key: "purchaseLots",
    invalidateQueries: [["finance-summary"], ["cashTransactions"], ["all-cash-boxes"]],
    onSuccess: () => {
      reset();
      handleClose();
    },
  });

  const onSubmit = (formData) => {
    setFormError("");
    const qty = Number(formData.total_quantity);
    const cost = Number(formData.unit_cost);
    const paid = formData.initial_paid_amount ? Number(formData.initial_paid_amount) : 0;

    // Strict Validations
    if (qty <= 0 || !Number.isInteger(qty)) {
      setFormError(t("finance.errorQuantityMustBePositiveInt", "Jemi sany 0-dan uly bitin san bolmaly!"));
      return;
    }
    if (cost <= 0) {
      setFormError(t("finance.errorCostMustBePositive", "Birlik bahasy 0-dan uly bolmaly!"));
      return;
    }
    if (paid > 0 && !formData.cash_box_guid) {
      setFormError(t("finance.errorCashBoxRequiredWhenPaid", "Töleg çykarylanda kassa hökmany saýlanmaly!"));
      return;
    }
    if (paid > calculatedTotal) {
      setFormError(t("finance.errorPaidExceedsTotal", "Tölenen mukdar jemi partiýa bahasyndan uly bolup bilmeýär!"));
      return;
    }

    createLot({
      ...formData,
      total_quantity: qty,
      unit_cost: cost,
      total_cost: calculatedTotal,
      initial_paid_amount: paid,
    });
  };

  const isHighValue = calculatedTotal >= 5000;
  const isImmediatePayment = Number(initialPaidAmount || 0) > 0;

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={750}>
      <CustomDialogHeader
        variant="h5"
        title={t("finance.addPurchaseLot")}
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
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <Box sx={{ flex: 1 }}>
                <CustomTextField
                  name="lot_number"
                  control={control}
                  label={t("finance.lotNumber")}
                  placeholder="e.g. LOT-2026-DXB-01"
                  required
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleGenerateLotNumber}
                sx={{
                  minWidth: 40,
                  height: 40,
                  mt: 0.2,
                  px: 1,
                  borderRadius: 2,
                  borderColor: "divider",
                }}
                title="Awto-belgi döret"
              >
                <AutoAwesomeRoundedIcon fontSize="small" />
              </Button>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="name"
              control={control}
              label={t("finance.lotBatchName")}
              placeholder="e.g. Dubai 30-Day Visa Slots 100x"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppAutocomplete
              name="supplier_guid"
              control={control}
              label={t("finance.supplier")}
              options={supplierOptions}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="service_type"
              control={control}
              label={t("finance.serviceType")}
              options={SERVICE_TYPE_OPTIONS}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              name="total_quantity"
              control={control}
              label={t("finance.totalQuantity")}
              type="number"
              slotProps={{
                htmlInput: { min: 1, step: 1 },
              }}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              name="unit_cost"
              control={control}
              label={t("finance.unitCost")}
              type="number"
              slotProps={{
                htmlInput: { min: 0.01, step: 0.01 },
              }}
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

          {/* Asset Valuation Preview Card */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}>
                  {t("finance.calculatedBatchAssetValue", "Hasaplanan Jemi Partiýa Bahasy (Asset)")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  {totalQuantity || 0} birlik × {unitCost || 0} {currency}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: calculatedTotal > 0 ? "primary.main" : "text.secondary",
                }}
              >
                {calculatedTotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {currency}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              name="purchase_date"
              control={control}
              label={t("finance.purchaseDate")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              name="expiry_date"
              control={control}
              label={t("finance.expiryDate")}
            />
          </Grid>

          {/* Immediate Payment Section */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {t("finance.immediatePaymentDetails")} ({t("optional", "Hökmany däl")})
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Eger partiýa satyn alnanda dessine kassadan nagt/bank tölegi çykarylan bolsa giriziň:
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="initial_paid_amount"
              control={control}
              label={t("finance.initialPaidAmount")}
              type="number"
              slotProps={{
                htmlInput: { min: 0, max: calculatedTotal || undefined, step: 0.01 },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppAutocomplete
              name="cash_box_guid"
              control={control}
              label={t("finance.payoutCashBox")}
              options={cashBoxOptions}
              required={isImmediatePayment}
            />
          </Grid>

          {/* High Value Confirmation Banner */}
          {isHighValue && (
            <Grid size={{ xs: 12 }}>
              <Alert
                severity="warning"
                icon={<WarningAmberRoundedIcon fontSize="inherit" />}
                sx={{ borderRadius: 2 }}
              >
                <strong>Üns beriň:</strong> Siz {calculatedTotal.toLocaleString()} {currency} möçberinde uly partiýa goşýarsyňyz. Bahany we birlik sanyny tassyklaň.
              </Alert>
            </Grid>
          )}
        </Grid>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddPurchaseLotModal;
