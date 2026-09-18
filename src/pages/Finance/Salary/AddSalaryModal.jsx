import { useMemo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { Info } from "lucide-react";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import AppAutocomplete from "../../../components/AppAutocomplete";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useLocale } from "../../../hooks/useLocale";
import { getSalaryEmployeesApi } from "../../../api/queries/getters";
import { generateSalaryMonthApi } from "../../../api/queries/post";

// Adds salary rows for picked employees that have none in `month` (new hires,
// rows deleted by mistake). Values are carried over like "start month" does,
// the rest is filled in inline.
const AddSalaryModal = ({ table, month, monthLabel, open, close }) => {
  const { t } = useLocale();
  const isModalOpen =
    open !== undefined ? Boolean(open) : Boolean(table && table.getState().creatingRow);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { employee_guids: [] },
  });
  const selected = useWatch({ control, name: "employee_guids" });

  const { data: missingEmployees, isLoading } = useGet({
    apiFn: getSalaryEmployeesApi,
    key: "salaryMissingEmployees",
    params: { missing_month: month, limit: 200 },
    options: { enabled: isModalOpen },
  });

  const options = useMemo(
    () =>
      (Array.isArray(missingEmployees) ? missingEmployees : []).map((e) => ({
        label: e.fullName,
        value: e.guid,
      })),
    [missingEmployees],
  );

  const handleClose = () => {
    if (table) {
      table.setCreatingRow(null);
      table.setEditingRow(null);
    }
    reset();
    close?.();
  };

  const { mutate: addEmployees, isPending } = useCreate({
    apiFn: generateSalaryMonthApi,
    key: "salaries",
    isPaginated: true,
    invalidateQueries: ["salarySummary", "salaryMissingEmployees"],
    onSuccess: handleClose,
  });

  const onSubmit = ({ employee_guids }) => {
    if (employee_guids.length) addEmployees({ month, employee_guids });
  };

  const noneMissing = !isLoading && options.length === 0;

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={520}>
      <CustomDialogHeader variant="h5" title={t("salary.addTitle", { month: monthLabel })} />
      <CustomForm handleSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : noneMissing ? (
            <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
              {t("salary.addNoneMissing")}
            </Typography>
          ) : (
            <AppAutocomplete
              name="employee_guids"
              control={control}
              label={t("salary.employee")}
              options={options}
              multiple
              maxChips={4}
              required
            />
          )}

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              p: 1.5,
              borderRadius: "10px",
              backgroundColor: "action.hover",
              color: "text.secondary",
            }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
              {t("salary.addHint")}
            </Typography>
          </Box>
        </Box>

        <FooterButton
          loading={isPending}
          disabled={isPending || !selected?.length}
          onCancel={handleClose}
          saveText={t("salary.addSubmit", { count: selected?.length || 0 })}
          sx={{ mt: 2 }}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddSalaryModal;
