import { useMemo } from "react";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import CustomTextField from "../../../components/CustomTextField";
import CustomDatePicker from "../../../components/CustomDatePicker";
import CustomSelect from "../../../components/CustomSelect";
import AppAutocomplete from "../../../components/AppAutocomplete";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useLocale } from "../../../hooks/useLocale";
import { getAllEmployeeApi } from "../../../api/queries/getters";
import { addReportShareApi } from "../../../api/queries/post";

/**
 * AddReferralReportModal - Modal 2 for adding new report share entry
 * Connected to Swagger CreateReportShareDto endpoint /api/v1/report-share/add-report-share
 */
const AddReferralReportModal = ({ open, close }) => {
  const { t } = useLocale();

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
      date: null,
      quantity: "",
      assignment_opr_guid: "",
      receiver_opr_guid: "",
      startNo: "",
      endNo: "",
      status: 1,
      note: "",
    },
  });

  // Fetch employees for assignment & receiver dropdowns
  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const employeeOptions = useMemo(() => {
    let list = employees;
    if (Array.isArray(employees?.data)) list = employees.data;
    if (!Array.isArray(list)) return [];
    return list.map((emp) => ({
      value: emp.guid || emp.id,
      label:
        emp.fullName ||
        `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
        emp.name ||
        "Employee",
    }));
  }, [employees]);

  const { mutate: createReportShare, isPending } = useCreate({
    apiFn: addReportShareApi,
    key: "reportShares",
    onSuccess: () => {
      reset();
      close();
    },
  });

  const handleFormSubmit = (data) => {
    createReportShare({
      datetime: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      total_count: Number(data.quantity || 0),
      assignment_opr_guid: data.assignment_opr_guid || undefined,
      receiver_opr_guid: data.receiver_opr_guid || undefined,
      start_yh_number: Number(data.startNo || 0),
      end_yh_number: Number(data.endNo || 0),
      status: Number(data.status || 1),
      note: data.note || "",
    });
  };

  const handleClose = () => {
    reset();
    close();
  };

  return (
    <CustomDialog open={open} close={handleClose} widthX={560}>
      <CustomDialogHeader variant="h5" title={t("referralLetter.addReport")} />
      <CustomForm handleSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2.25}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              name="date"
              control={control}
              label={t("columns.dateTime")}
              size="medium"
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
            <AppAutocomplete
              name="assignment_opr_guid"
              control={control}
              label={t("referralLetter.submittedBy")}
              options={employeeOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppAutocomplete
              name="receiver_opr_guid"
              control={control}
              label={t("referralLetter.receivedBy")}
              options={employeeOptions}
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
