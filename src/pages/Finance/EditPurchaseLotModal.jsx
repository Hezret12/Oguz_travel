import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Grid, Typography, Box } from "@mui/material";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import { FooterButton } from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import CustomDatePicker from "../../components/CustomDatePicker";
import AppAutocomplete from "../../components/AppAutocomplete";
import { useLocale } from "../../hooks/useLocale";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { updatePurchaseLotApi } from "../../api/queries/patch";
import { getAllSuppliersApi } from "../../api/queries/getters";
import { useGet } from "../../hooks/CRUD/useGet";

const STATUS_OPTIONS = [
  { label: "Işjeň (ACTIVE)", value: "ACTIVE" },
  { label: "Gutarýan / Gutardy (EXHAUSTED)", value: "EXHAUSTED" },
  { label: "Möhleti geçen (EXPIRED)", value: "EXPIRED" },
  { label: "Ýatyryldy (CANCELLED)", value: "CANCELLED" },
];

const EditPurchaseLotModal = ({ open, close, table, row }) => {
  const { t } = useLocale();
  const lot = row?.original;

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().editingRow?.id === row?.id);

  const handleClose = () => {
    if (table) table.setEditingRow(null);
    close?.();
  };

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      lot_number: lot?.lot_number || "",
      name: lot?.name || "",
      supplier_guid: lot?.supplier_guid || lot?.supplier?.guid || "",
      service_type: lot?.service_type || "VISA_SLOT",
      unit_type: lot?.unit_type || "slot",
      total_quantity: lot?.total_quantity || "",
      unit_cost: lot?.unit_cost || "",
      total_cost: lot?.total_cost || "",
      currency: lot?.currency || "USD",
      purchase_date: lot?.purchase_date || new Date(),
      expiry_date: lot?.expiry_date || null,
      status: lot?.status || "ACTIVE",
    },
  });

  useEffect(() => {
    if (lot && isModalOpen) {
      reset({
        lot_number: lot.lot_number || "",
        name: lot.name || "",
        supplier_guid: lot.supplier_guid || lot.supplier?.guid || "",
        service_type: lot.service_type || "VISA_SLOT",
        unit_type: lot.unit_type || "slot",
        total_quantity: lot.total_quantity || "",
        unit_cost: lot.unit_cost || "",
        total_cost: lot.total_cost || "",
        currency: lot.currency || "USD",
        purchase_date: lot.purchase_date || new Date(),
        expiry_date: lot.expiry_date || null,
        status: lot.status || "ACTIVE",
      });
    }
  }, [lot, isModalOpen, reset]);

  const [totalQuantity, unitCost] = useWatch({
    control,
    name: ["total_quantity", "unit_cost"],
  });

  useEffect(() => {
    const qty = Number(totalQuantity || 0);
    const cost = Number(unitCost || 0);
    if (qty > 0 && cost > 0) {
      setValue("total_cost", (qty * cost).toFixed(2));
    }
  }, [totalQuantity, unitCost, setValue]);

  const { data: suppliersData } = useGet({
    apiFn: getAllSuppliersApi,
    key: "all-suppliers",
  });
  const supplierOptions = (suppliersData || []).map((s) => ({
    label: s.name,
    value: s.guid,
  }));

  const { mutate: updateLot, isPending } = useUpdate({
    apiFn: updatePurchaseLotApi,
    key: "purchaseLots",
    idKey: "guid",
    invalidateQueries: [["finance-summary"]],
    onSuccessUpdate: () => {
      handleClose();
    },
  });

  const onSubmit = (formData) => {
    updateLot({
      guid: lot?.guid,
      ...formData,
      total_quantity: Number(formData.total_quantity),
      unit_cost: Number(formData.unit_cost),
      total_cost: Number(formData.total_cost),
    });
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={700}>
      <CustomDialogHeader
        variant="h5"
        title={t("finance.editPurchaseLot")}
        onClose={handleClose}
      />
      <CustomForm handleSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ p: 2.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="lot_number"
              control={control}
              label={t("finance.lotNumber")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="name"
              control={control}
              label={t("finance.lotBatchName")}
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
              name="status"
              control={control}
              label={t("status")}
              options={STATUS_OPTIONS}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              name="total_quantity"
              control={control}
              label={t("finance.totalQuantity")}
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              name="unit_cost"
              control={control}
              label={t("finance.unitCost")}
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: "action.hover",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {t("finance.remainingValue")}:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {((lot?.total_quantity || 0) - (lot?.consumed_quantity || 0)) * Number(unitCost || 0)} {lot?.currency || "$"}
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
        </Grid>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditPurchaseLotModal;
