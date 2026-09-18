import { useMemo } from "react";
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
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addTotalCalculationApi } from "../../../api/queries/post";
import { getAllEmployeeApi } from "../../../api/queries/getters";
import { useGet } from "../../../hooks/CRUD/useGet";

import CategorySelectWithManagement from "./Contents/CategorySelectWithManagement";

const CURRENCY_OPTIONS = [
  { label: "TMT", value: "TMT" },
  { label: "USD", value: "USD" },
];

const AddCashTransactionModal = ({ open, close, table }) => {
  const { t } = useLocale();

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().creatingRow);

  const handleClose = () => {
    if (table) table.setCreatingRow(null);
    close?.();
  };

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      category_guid: "",
      net_price: "",
      currency: "USD",
      receiver_opr_guid: "",
      datetime: new Date().toISOString(),
    },
  });

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

  const { mutate: createTransaction, isPending } = useCreate({
    apiFn: addTotalCalculationApi,
    key: "totalCalculations",
    onSuccess: () => {
      reset();
      handleClose();
    },
  });

  const onSubmit = (formData) => {
    const payload = {
      category_guid: formData.category_guid || undefined,
      net_price: Number(formData.net_price || 0),
      currency: formData.currency || "USD",
      receiver_opr_guid: formData.receiver_opr_guid || undefined,
      datetime: formData.datetime || new Date().toISOString(),
    };
    createTransaction(payload);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={560}>
      <CustomDialogHeader
        variant="h6"
        title={t("finance.addTransaction")}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <CategorySelectWithManagement
              name="category_guid"
              control={control}
              setValue={setValue}
              label={t("category")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="net_price"
              control={control}
              label={t("finance.amount")}
              type="number"
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomSelect
              name="currency"
              control={control}
              label={t("currency")}
              options={CURRENCY_OPTIONS}
              required
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <AppAutocomplete
              name="receiver_opr_guid"
              control={control}
              label={t("operator")}
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
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddCashTransactionModal;
