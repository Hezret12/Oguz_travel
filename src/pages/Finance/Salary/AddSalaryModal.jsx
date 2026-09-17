import { useEffect, useRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
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
  BONUS_TYPE,
  buildSalaryPayload,
  formatMoney,
  getWorkDaysInMonth,
  isPercentRow,
  salaryToFormValues,
  toMonthKey,
} from "./functions/salaryUtils";

const firstRow = (res) => res?.data?.data?.[0] ?? null;

const getDefaults = (monthKey) => {
  const days = String(getWorkDaysInMonth(monthKey));
  return {
    ...salaryToFormValues({ month: monthKey }),
    work_days: days,
    worked_days: days,
    bonus_type: BONUS_TYPE.PERCENT,
  };
};

const AddSalaryModal = ({ table, open, close, defaultMonth }) => {
  const { t } = useLocale();
  const { salary: salarySchema } = useValidShema();
  const isModalOpen =
    open !== undefined ? Boolean(open) : Boolean(table?.getState().creatingRow);
  const addAnotherRef = useRef(false);
  const prefilledForRef = useRef(null);

  const initialMonth = toMonthKey(defaultMonth) || toMonthKey(new Date());

  const { control, handleSubmit, setValue, getValues, getFieldState, reset } = useForm({
    defaultValues: getDefaults(initialMonth),
    resolver: yupResolver(salarySchema),
    mode: "onSubmit",
  });

  const [selectedMonth, employeeGuid] = useWatch({
    control,
    name: ["month", "employee_guid"],
  });
  const monthKey = toMonthKey(selectedMonth);

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
    onSuccess: () => {
      if (!addAnotherRef.current) {
        handleClose();
        return;
      }
      // Keep the month, start a clean row for the next employee.
      prefilledForRef.current = null;
      reset(getDefaults(toMonthKey(getValues("month"))));
    },
  });

  // Picking another month re-suggests its working days, unless the user
  // already typed their own.
  useEffect(() => {
    if (!monthKey) return;
    const days = String(getWorkDaysInMonth(monthKey));
    if (!getFieldState("work_days").isDirty) setValue("work_days", days);
    if (!getFieldState("worked_days").isDirty) setValue("worked_days", days);
  }, [monthKey, getFieldState, setValue]);

  // Does this employee already have this month? Keyed under "salaries" so a
  // save invalidates it.
  const { data: existing, isFetching: isCheckingExisting } = useQuery({
    queryKey: ["salaries", "employee-month", employeeGuid, monthKey],
    queryFn: () =>
      getAllSalariesApi({ employee_guid: employeeGuid, month: monthKey, page: 1, limit: 1 }),
    enabled: Boolean(employeeGuid && monthKey),
    select: firstRow,
  });

  // The employee's latest record: prefill source and hint.
  const { data: lastSalary, isFetching: isCheckingLast } = useQuery({
    queryKey: ["salaries", "employee-last", employeeGuid],
    queryFn: () => getAllSalariesApi({ employee_guid: employeeGuid, page: 1, limit: 1 }),
    enabled: Boolean(employeeGuid),
    select: firstRow,
  });

  // Base salary, card transfer and the bonus rule rarely change month to
  // month: copy them once per picked employee into inputs the user has not
  // typed in.
  useEffect(() => {
    if (!employeeGuid || !lastSalary || prefilledForRef.current === employeeGuid) return;
    prefilledForRef.current = employeeGuid;
    const copy = (field, value) => {
      if (!getFieldState(field).isDirty && Number(value) > 0) {
        setValue(field, String(Number(value)));
      }
    };
    copy("base_salary", lastSalary.base_salary);
    copy("card_amount", lastSalary.card_amount);
    if (getFieldState("bonus_percent").isDirty) return;
    if (isPercentRow(lastSalary)) {
      setValue("bonus_type", BONUS_TYPE.PERCENT);
      copy("bonus_percent", lastSalary.bonus_percent);
    } else if (Number(lastSalary.bonus) > 0) {
      setValue("bonus_type", BONUS_TYPE.FIXED);
    }
  }, [employeeGuid, lastSalary, getFieldState, setValue]);

  const monthLabel = monthKey ? dayjs(`${monthKey}-01`).format("MM.YYYY") : "";
  const alreadyExists = Boolean(existing);

  let employeeHint = null;
  if (employeeGuid) {
    if (isCheckingExisting || isCheckingLast) {
      employeeHint = (
        <Typography variant="caption" color="text.secondary">
          {t("salary.checking")}
        </Typography>
      );
    } else if (alreadyExists) {
      employeeHint = (
        <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
          {t("salary.alreadyExistsHint", { month: monthLabel })}
        </Typography>
      );
    } else {
      employeeHint = (
        <Typography variant="caption" color="info.main" noWrap sx={{ display: "block" }}>
          {lastSalary
            ? t("salary.lastMonthHint", {
                month: dayjs(`${lastSalary.month}-01`).format("MM.YYYY"),
                base: formatMoney(lastSalary.base_salary, { dashZero: false }),
                card: formatMoney(lastSalary.card_amount, { dashZero: false }),
              })
            : t("salary.noHistoryHint")}
        </Typography>
      );
    }
  }

  const onValid = (values) => createSalary(buildSalaryPayload(values));
  const handleSave = (event) => {
    addAnotherRef.current = false;
    return handleSubmit(onValid)(event);
  };
  const handleSaveAndAddAnother = (event) => {
    addAnotherRef.current = true;
    return handleSubmit(onValid)(event);
  };

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={680}>
      <CustomDialogHeader variant="h5" title={t("salary.add")} />
      <CustomForm handleSubmit={handleSave}>
        <SalaryFormFields control={control} employeeHint={employeeHint} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            mt: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="text"
            disabled={isPending || alreadyExists}
            onClick={handleSaveAndAddAnother}
            sx={{ height: 40, textTransform: "none", fontWeight: 600 }}
          >
            {t("salary.saveAndAddAnother")}
          </Button>
          <FooterButton
            loading={isPending}
            disabled={alreadyExists}
            onCancel={handleClose}
            sx={{ mt: 0 }}
          />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default AddSalaryModal;
