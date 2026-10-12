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
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { getAllTranslatorsApi } from "../../api/queries/getters";
import { updateTranslationApi } from "../../api/queries/patch";
import CustomDatePicker from "../../components/CustomDatePicker";

const buildDefaultValues = (row) => ({
  guid: row?.original?.guid || "",
  received_day: row?.original?.received_day
    ? dayjs(row.original.received_day).format("YYYY-MM-DD")
    : dayjs().format("YYYY-MM-DD"),
  received_time: row?.original?.received_time
    ? row.original.received_time.slice(0, 5)
    : dayjs().format("HH:mm"),
  opr_guid:
    row?.original?.opr_guid ||
    row?.original?.operator?.guid ||
    "",
  page_count: row?.original?.page_count != null ? Number(row.original.page_count) : 1,
  client_guid:
    row?.original?.client_guid ||
    row?.original?.client?.guid ||
    "",
  source_to_target: row?.original?.source_to_target || "",
  completed_time: row?.original?.completed_time
    ? row.original.completed_time.slice(0, 5)
    : "",
  status:
    row?.original?.status !== undefined && row?.original?.status !== null
      ? String(row.original.status)
      : (row?.original?.status_guid ? String(row.original.status_guid) : "false"),
  completed_page_count:
    row?.original?.completed_page_count != null ? Number(row.original.completed_page_count) : null,
  completed_day: row?.original?.completed_day
    ? dayjs(row.original.completed_day).format("YYYY-MM-DD")
    : null,
  translator_guid:
    row?.original?.translator_guid ||
    row?.original?.translator?.guid ||
    "",
  correction_status: row?.original?.correction_status || "",
  price: row?.original?.price != null ? Number(row.original.price) : 0,
  expense_price:
    row?.original?.expense_price != null
      ? Number(row.original.expense_price)
      : 0,
  note: row?.original?.note || "",
  is_paid:
    row?.original?.is_paid !== undefined ? row.original.is_paid : true,
});

const EditTranslateModal = ({ row, onClose }) => {
  const { t } = useLocale();
  const { addTranslation } = useValidShema();

  const { data: translators = [] } = useGet({
    apiFn: getAllTranslatorsApi,
    key: "translators",
    // The dialog stays mounted, so the list is checked on open and refetched
    // once it is over 5 minutes old: a translator added by someone else shows
    // up without a page reload.
    options: { enabled: Boolean(row), staleTime: 5 * 60 * 1000 },
  });

  // react-hook-form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(addTranslation),
    defaultValues: buildDefaultValues(row),
  });

  // The dialog now stays mounted between opens (see keepMounted below) so the
  // form only initializes its defaultValues once, on first mount — without
  // this, editing a different row after the first one would keep showing the
  // first row's data. Re-sync whenever the row being edited actually changes.
  // Intentionally keyed on the row's guid, not the row object identity, which
  // can change every table re-render without the underlying data changing.
  useEffect(() => {
    if (row) {
      reset(buildDefaultValues(row));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.original?.guid, reset]);

  const { mutate: updateTranslation, isPending: isUpdatingTranslation } = useUpdate({
    apiFn: updateTranslationApi,
    key: "translations",
    isPaginated: true,
    idKey: "guid",
    onSuccessUpdate: () => {
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
    updateTranslation(payload);
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
      { label: t("paymentPaid"), value: true },
      { label: t("paymentCredit"), value: false },
    ],
    [t],
  );

  return (
    <CustomDialog open={Boolean(row)} close={onClose} widthX={780} keepMounted>
      <CustomDialogHeader variant="h5" title={t("editTranslation")} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <GlobalClientAutocomplete
              name="client_guid"
              control={control}
              columns={["fullName", "phone_number"]}
              initialClient={row?.original?.client}
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
              initialEmployee={row?.original?.operator}
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
              label={
                t("columns.completedPageCount") || "Tabşyrylan sahypa sany"
              }
            />
          </Grid>

          {/* Price */}
          <Grid size={4}>
            <CustomTextField
              name="price"
              control={control}
              type="number"
              label={t("columns.price")}
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
          loading={isSubmitting || isUpdatingTranslation}
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
// TranslatePage — e.g. opening the *add* dialog, or selecting a table row.
export default memo(EditTranslateModal);
