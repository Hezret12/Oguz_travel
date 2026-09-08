import { useMemo, useState } from "react";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomTextField from "../../../components/CustomTextField";
import CustomDatePicker from "../../../components/CustomDatePicker";
import CustomSelect from "../../../components/CustomSelect";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useLocale } from "../../../hooks/useLocale";
import { updateReportShareApi } from "../../../api/queries/patch";

const EditReferralReportModal = ({ table, row }) => {
  const { t } = useLocale();
  const isModalOpen = Boolean(
    table && row && table.getState().editingRow?.id === row.id,
  );

  const statusOptions = useMemo(
    () => [
      { label: t("referralLetter.statusSold"), value: 1, color: "#16a34a" },
      { label: t("referralLetter.statusDamaged"), value: 2, color: "#ea580c" },
      { label: t("referralLetter.statusLost"), value: 3, color: "#dc2626" },
    ],
    [t],
  );

  const initialValues = useMemo(() => {
    return {
      date: row?.original?.datetime || null,
      quantity: row?.original?.total_count ?? "",
      assignment_opr_guid: row?.original?.assignment_opr_guid || "",
      received_by: row?.original?.received_by || "",
      startNo: String(row?.original?.start_yh_number ?? ""),
      endNo: String(row?.original?.end_yh_number ?? ""),
      status: Number(row?.original?.status || 1),
      note: row?.original?.note || "",
    };
  }, [row]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues,
  });

  const [prevRowId, setPrevRowId] = useState(null);
  const currentRowId =
    isModalOpen && row?.original ? row.original.guid || row.original.id : null;
  if (currentRowId !== prevRowId) {
    setPrevRowId(currentRowId);
    reset(initialValues);
  }

  const { mutate: updateReportShare, isPending } = useUpdate({
    apiFn: updateReportShareApi,
    key: "reportShares",
    idKey: "guid",
    onSuccessUpdate: () => {
      table?.setEditingRow(null);
    },
  });

  const handleFormSubmit = (data) => {
    updateReportShare({
      guid: row.original.guid || row.original.id,
      datetime: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      total_count: Number(data.quantity || 0),
      assignment_opr_guid: data.assignment_opr_guid || undefined,
      received_by: data.received_by,
      start_yh_number: Number(data.startNo || 0),
      end_yh_number: Number(data.endNo || 0),
      status: Number(data.status || 1),
      note: data.note || "",
    });
  };

  const handleClose = () => {
    table?.setEditingRow(null);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={560}>
      <CustomDialogHeader variant="h5" title={t("referralLetter.editReport")} />
      <CustomForm handleSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2.25}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              name="date"
              control={control}
              label={t("columns.dateTime")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="quantity"
              control={control}
              label={t("referralLetter.quantity")}
              type="number"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <GlobalEmployeeAutocomplete
              name="assignment_opr_guid"
              control={control}
              label={t("referralLetter.submittedBy")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="received_by"
              control={control}
              label={t("referralLetter.receivedBy")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="startNo"
              control={control}
              label={t("referralLetter.startNoFrom")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              name="endNo"
              control={control}
              label={t("referralLetter.endNoTo")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomSelect
              name="status"
              control={control}
              label={t("columns.status")}
              options={statusOptions}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomTextField
              name="note"
              control={control}
              label={t("columns.note")}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditReferralReportModal;
