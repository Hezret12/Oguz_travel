import { useMemo } from "react";
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
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useLocale } from "../../../hooks/useLocale";
import { addReportShareApi } from "../../../api/queries/post";

/**
 * AddReferralReportModal - Modal 2 for adding new report share entry
 * Connected to Swagger CreateReportShareDto endpoint /api/v1/report-share/add-report-share
 */
const AddReferralReportModal = ({ open, close, table }) => {
  const { t } = useLocale();
  const isModalOpen = open !== undefined ? Boolean(open) : Boolean(table?.getState().creatingRow);

  const statusOptions = useMemo(
    () => [
      { label: t("referralLetter.statusSold"), value: 1, color: "#16a34a" },
      { label: t("referralLetter.statusDamaged"), value: 2, color: "#ea580c" },
      { label: t("referralLetter.statusLost"), value: 3, color: "#dc2626" },
    ],
    [t]
  );

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      date: new Date().toISOString(),
      quantity: "",
      assignment_opr_guid: "",
      receiver_opr_guid: "",
      startNo: "",
      endNo: "",
      status: 1,
      note: "",
    },
  });

  const handleClose = () => {
    if (table) table.setCreatingRow(null);
    reset({
      date: new Date().toISOString(),
      quantity: "",
      assignment_opr_guid: "",
      receiver_opr_guid: "",
      startNo: "",
      endNo: "",
      status: 1,
      note: "",
    });
    close?.();
  };

  const { mutate: createReportShare, isPending } = useCreate({
    apiFn: addReportShareApi,
    key: "reportShares",
    onSuccess: () => {
      handleClose();
    },
  });

  const handleFormSubmit = (data) => {
    createReportShare({
      datetime: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      assignment_opr_guid: data.assignment_opr_guid,
      receiver_opr_guid: data.receiver_opr_guid,
      start_yh_number: Number(data.startNo || 0),
      end_yh_number: Number(data.endNo || 0),
      total_count: Number(data.quantity || 0),
      status: Number(data.status || 1),
      note: data.note || "",
    });
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={640}>
      <CustomDialogHeader variant="h5" title={t("referralLetter.addReport")} />
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
            <GlobalEmployeeAutocomplete
              name="receiver_opr_guid"
              control={control}
              label={t("referralLetter.receivedBy")}
              required
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

export default AddReferralReportModal;
