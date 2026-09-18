import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Grid } from "@mui/material";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import CustomDatePicker from "../../../components/CustomDatePicker";
import AppAutocomplete from "../../../components/AppAutocomplete";
import { useLocale } from "../../../hooks/useLocale";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { updateTotalCalculationApi } from "../../../api/queries/patch";
import { getAllEmployeeApi } from "../../../api/queries/getters";
import { useGet } from "../../../hooks/CRUD/useGet";

import CategorySelectWithManagement from "./Contents/CategorySelectWithManagement";

const CURRENCY_OPTIONS = [
  { label: "TMT", value: "TMT" },
  { label: "USD", value: "USD" },
];

const EditCashTransactionModal = ({ open, close, table, row }) => {
  const { t } = useLocale();

  const currentRow = useMemo(() => row?.original || {}, [row?.original]);

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
      category_guid: currentRow.category_guid || currentRow.category?.guid || "",
      net_price: currentRow.net_price !== undefined ? String(currentRow.net_price) : "",
      currency: currentRow.currency || "USD",
      receiver_opr_guid: currentRow.receiver_opr_guid || currentRow.receiver_operator?.guid || "",
      datetime: currentRow.datetime || new Date().toISOString(),
    },
  });

  useEffect(() => {
    if (isModalOpen && row?.original) {
      reset({
        category_guid: row.original.category_guid || row.original.category?.guid || "",
        net_price: row.original.net_price !== undefined ? String(row.original.net_price) : "",
        currency: row.original.currency || "USD",
        receiver_opr_guid: row.original.receiver_opr_guid || row.original.receiver_operator?.guid || "",
        datetime: row.original.datetime || new Date().toISOString(),
      });
    }
  }, [isModalOpen, row?.original, reset]);

  const { data: employeesData } = useGet({
    apiFn: getAllEmployeeApi,
    key: "all-employees-modal",
    params: { limit: 100 },
  });

  const employeeOptions = useMemo(() => {
    const raw = employeesData?.data ?? employeesData ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((emp) => ({
      label: emp.fullName || emp.name || "—",
      value: emp.guid,
    }));
  }, [employeesData]);

  const { mutate: updateTransaction, isPending } = useUpdate({
    apiFn: updateTotalCalculationApi,
    key: "totalCalculations",
    idKey: "guid",
    onSuccessUpdate: () => {
      handleClose();
    },
  });

  const onSubmit = (formData) => {
    const payload = {
      guid: currentRow.guid || currentRow.id,
      category_guid: formData.category_guid || undefined,
      net_price: Number(formData.net_price || 0),
      currency: formData.currency || "USD",
      receiver_opr_guid: formData.receiver_opr_guid || undefined,
      datetime: formData.datetime || new Date().toISOString(),
    };
    updateTransaction(payload);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={560}>
      <CustomDialogHeader
        variant="h6"
        title={t("finance.editTransaction", "Amaly üýtgetmek")}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <CategorySelectWithManagement
              name="category_guid"
              control={control}
              setValue={setValue}
              label={t("category", "Kategoriýa / Düşündiriş")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="net_price"
              control={control}
              label={t("finance.amount", "Möçberi / Bahasy")}
              type="number"
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="currency"
              control={control}
              label={t("currency", "Walýuta")}
              options={CURRENCY_OPTIONS}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <AppAutocomplete
              name="receiver_opr_guid"
              control={control}
              label={t("operator", "Jogapkär / Operator")}
              options={employeeOptions}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomDatePicker
              name="datetime"
              control={control}
              label={t("date", "Senesi")}
              required
            />
          </Grid>
        </Grid>

        <FooterButton
          loading={isPending}
          onCancel={handleClose}
          saveText={t("save", "Ýatda sakla")}
          cancelText={t("cancel", "Ýatyr")}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditCashTransactionModal;
