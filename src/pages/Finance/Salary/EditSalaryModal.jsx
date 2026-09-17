import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";
import { updateSalaryApi } from "../../../api/queries/patch";
import SalaryFormFields from "./Contents/SalaryFormFields";
import { buildSalaryPayload, salaryToFormValues } from "./functions/salaryUtils";

const EditSalaryModal = ({ table, row, open, close }) => {
  const { t } = useLocale();
  const { salary: salarySchema } = useValidShema();
  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().editingRow?.id === row?.id);

  const original = row?.original;
  const initialValues = useMemo(() => salaryToFormValues(original), [original]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(salarySchema),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (isModalOpen && original) reset(initialValues);
  }, [isModalOpen, original, initialValues, reset]);

  const handleClose = () => {
    if (table) {
      table.setCreatingRow(null);
      table.setEditingRow(null);
    }
    close?.();
  };

  const { mutate: updateSalary, isPending } = useUpdate({
    apiFn: updateSalaryApi,
    key: "salaries",
    idKey: "guid",
    // useUpdate wraps each entry as [entry], so pass plain keys.
    invalidateQueries: ["salarySummary"],
    onSuccessUpdate: handleClose,
  });

  const onSubmit = (values) =>
    updateSalary({ guid: original.guid, ...buildSalaryPayload(values) });

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={840}>
      <CustomDialogHeader variant="h5" title={t("salary.edit")} />
      <CustomForm handleSubmit={handleSubmit(onSubmit)}>
        <SalaryFormFields control={control} initialEmployee={original?.employee} />
        <FooterButton loading={isPending} onCancel={handleClose} sx={{ mt: 2 }} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditSalaryModal;
