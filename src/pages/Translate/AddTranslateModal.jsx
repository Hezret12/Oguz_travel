import { useMemo, useEffect, memo } from "react";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";

import { useLocale } from "../../hooks/useLocale";
import { useValidShema } from "../../functions/useValidShema";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import FooterButton from "../../components/Dialog/FooterButton";
import GlobalClientAutocomplete from "../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import GlobalEmployeeAutocomplete from "../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { useGet } from "../../hooks/CRUD/useGet";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { getAllTranslatorsApi } from "../../api/queries/getters";
import { addTranslationApi } from "../../api/queries/post";
import CustomDatePicker from "../../components/CustomDatePicker";

const buildDefaultValues = () => ({
  received_day: dayjs().format("YYYY-MM-DD"),
  received_time: dayjs().format("HH:mm"),
  opr_guid: null,
  page_count: null,
  client_guid: null,
  source_to_target: null,
  completed_time: null,
  status: "false",
  completed_page_count: null,
  completed_day: null,
  translator_guid: null,
  correction_status: null,
  price: null,
  expense_price: null,
  note: "",
  is_paid: null,
});

const AddTranslateModal = ({ open: isOpen, onClose }) => {
  const { t } = useLocale();
  const { addTranslation } = useValidShema();

  const { data: translators = [] } = useGet({
    apiFn: getAllTranslatorsApi,
    key: "translators",
  });

  // react-hook-form setup
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(addTranslation),
    defaultValues: buildDefaultValues(),
  });

  // The dialog now stays mounted between opens (see keepMounted below), so
  // defaultValues (e.g. today's date/time) would otherwise go stale after
  // the first open — refresh the whole form every time it's (re)opened.
  useEffect(() => {
    if (isOpen) {
      reset(buildDefaultValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { mutate: createTranslation, isPending: isCreatingTranslation } =
    useCreate({
      apiFn: addTranslationApi,
      key: "translations",
      isPaginated: true,
      onSuccess: () => {
        onClose();
      },
    });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      status: String(data.status ?? "false"),
      received_day: data.received_day
        ? dayjs(data.received_day).format("YYYY-MM-DD")
        : null,
      completed_day: data.completed_day
        ? dayjs(data.completed_day).format("YYYY-MM-DD")
        : null,
      page_count: Number(data.page_count || 0),
      // Empty completion fields go as null (not 0 / ""), the backend treats them as optional.
      completed_page_count: data.completed_page_count ? Number(data.completed_page_count) : null,
      completed_time: data.completed_time || null,
      price: Number(data.price || 0),
      expense_price: Number(data.expense_price || 0),
      is_paid:
        data.is_paid === 0 || data.is_paid === "0"
          ? 0
          : data.is_paid === true || data.is_paid === "true",
    };
    createTranslation(payload);
  };

  const translatorOptions = useMemo(
    () =>
      (translators || []).map((tr) => ({ value: tr.guid, label: tr.fullName })),
    [translators],
  );

  const statusOptions = useMemo(
    () => [
      { value: "false", label: t("statusNormal") },
      { value: "true", label: t("statusUrgent") },
      { value: "0", label: t("paymentRefunded") },
    ],
    [t],
  );

  const paymentOptions = useMemo(
    () => [
      { label: t("paymentPaid") || "Tölendi", value: true },
      { label: t("paymentCredit") || "Kredit", value: false },
    ],
    [t],
  );

  return (
    <CustomDialog open={isOpen} close={onClose} widthX={780} keepMounted>
      <CustomDialogHeader variant="h5" title={t("addTranslation")} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <GlobalClientAutocomplete
              name="client_guid"
              control={control}
              columns={["fullName", "phone_number"]}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomDatePicker
              name="received_day"
              validateFormat
              control={control}
              label={t("columns.receivedDay")}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomTextField
              name="received_time"
              control={control}
              label={t("columns.receivedTime")}
              type="time"
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomSelect
              name="status"
              control={control}
              label={t("columns.status")}
              options={statusOptions}
              required
            />
          </Grid>

          <Grid size={6}>
            <GlobalEmployeeAutocomplete
              name="opr_guid"
              control={control}
              label={t("outbound.operator")}
              required
            />
          </Grid>

          <Grid size={6}>
            <CustomSelect
              name="translator_guid"
              control={control}
              label={t("columns.translator")}
              options={translatorOptions}
              required
            />
          </Grid>

          <Grid size={6}>
            <CustomTextField
              name="source_to_target"
              control={control}
              label={t("columns.direction")}
              required
            />
          </Grid>

          {/* Page Count */}
          <Grid size={3}>
            <CustomTextField
              name="page_count"
              control={control}
              type="number"
              label={t("columns.pageCount")}
              required
            />
          </Grid>

          <Grid size={3}>
            <CustomTextField
              name="completed_page_count"
              control={control}
              type="number"
              label={t("columns.completedPageCount")}
            />
          </Grid>

          {/* Price */}
          <Grid size={4}>
            <CustomTextField
              name="price"
              control={control}
              type="number"
              label={t("columns.price") || "Baha"}
              endIcon="TMT"
              required
            />
          </Grid>

          {/* Expense Price */}
          <Grid size={4}>
            <CustomTextField
              name="expense_price"
              control={control}
              type="number"
              label={t("columns.expensePrice")}
              endIcon="TMT"
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomSelect
              name="is_paid"
              control={control}
              label={t("columns.paymentStatus") || "Töleg görnüşi"}
              options={paymentOptions}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomDatePicker
              name="completed_day"
              validateFormat
              control={control}
              label={t("columns.completedDay") || "Tabşyrylan güni"}
            />
          </Grid>

          <Grid size={4}>
            <CustomTextField
              name="completed_time"
              control={control}
              label={t("columns.completedTime") || "Tabşyrylan wagty"}
              type="time"
            />
          </Grid>

          {/* Correction Status */}
          <Grid size={4}>
            <CustomTextField
              name="correction_status"
              control={control}
              label={t("columns.correctionStatus") || "Düzeliş ýagdaýy"}
            />
          </Grid>

          {/* Note */}
          <Grid size={12}>
            <CustomTextField
              name="note"
              control={control}
              label={t("columns.note") || "Bellik"}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <FooterButton
          loading={isCreatingTranslation}
          onCancel={onClose}
          type="submit"
          sx={{ mt: 3 }}
        />
      </CustomForm>
    </CustomDialog>
  );
};

// Kept permanently mounted by the parent (see keepMounted on CustomDialog),
// so without memo it would fully re-render this entire heavy form (2
// Autocompletes, several pickers) on every unrelated state change in
// TranslatePage — e.g. opening the *edit* dialog, or selecting a table row.
export default memo(AddTranslateModal);
