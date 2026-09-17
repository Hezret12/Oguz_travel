import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";
import { addSalaryApi } from "../../../api/queries/post";
import { getAllSalariesApi } from "../../../api/queries/getters";
import SalaryFormFields from "./Contents/SalaryFormFields";
import {
  buildSalaryPayload,
  getWorkDaysInMonth,
  salaryToFormValues,
  toMonthKey,
} from "./functions/salaryUtils";

const AddSalaryModal = ({ table, open, close, defaultMonth }) => {
  const { t } = useLocale();
  const { salary: salarySchema } = useValidShema();
  const isModalOpen =
    open !== undefined ? Boolean(open) : Boolean(table?.getState().creatingRow);
  const [prefilled, setPrefilled] = useState(false);

  const month = toMonthKey(defaultMonth) || toMonthKey(new Date());
  const workDays = String(getWorkDaysInMonth(month));

  const { control, handleSubmit, setValue, getValues, getFieldState } = useForm({
    defaultValues: {
      ...salaryToFormValues({ month }),
      work_days: workDays,
      worked_days: workDays,
    },
    resolver: yupResolver(salarySchema),
    mode: "onSubmit",
  });

  const handleClose = () => {
    if (table) {
      table.setCreatingRow(null);
      table.setEditingRow(null);
    }
    close?.();
  };

  const { mutate: createSalary, isPending } = useCreate({
    apiFn: addSalaryApi,
    key: "salaries",
    isPaginated: true,
    invalidateQueries: ["salarySummary"],
    onSuccess: handleClose,
  });

  // Picking another month re-suggests its working days, unless the user
  // already typed their own.
  const selectedMonth = useWatch({ control, name: "month" });
  const selectedMonthKey = toMonthKey(selectedMonth);
  useEffect(() => {
    if (!selectedMonthKey) return;
    const days = String(getWorkDaysInMonth(selectedMonthKey));
    if (!getFieldState("work_days").isDirty) setValue("work_days", days);
    if (!getFieldState("worked_days").isDirty) setValue("worked_days", days);
  }, [selectedMonthKey, getFieldState, setValue]);

  // Base salary and card transfer rarely change month to month, so copy them
  // from the employee's latest record when those inputs are still empty.
  const handleEmployeeChange = async (employee) => {
    setPrefilled(false);
    const guid = employee?.guid || employee?.id;
    if (!guid) return;
    try {
      const res = await getAllSalariesApi({ employee_guid: guid, page: 1, limit: 1 });
      const last = res?.data?.data?.[0];
      if (!last) return;
      let changed = false;
      ["base_salary", "card_amount"].forEach((field) => {
        if (getValues(field) === "" && Number(last[field]) > 0) {
          setValue(field, String(Number(last[field])));
          changed = true;
        }
      });
      setPrefilled(changed);
    } catch {
      // Prefill is a convenience; the form still works without it.
    }
  };

  const onSubmit = (values) => createSalary(buildSalaryPayload(values));

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={760}>
      <CustomDialogHeader variant="h5" title={t("salary.add")} />
      <CustomForm handleSubmit={handleSubmit(onSubmit)}>
        <SalaryFormFields
          control={control}
          onEmployeeChange={handleEmployeeChange}
          hint={prefilled ? t("salary.prefilledFromLast") : null}
        />
        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddSalaryModal;
