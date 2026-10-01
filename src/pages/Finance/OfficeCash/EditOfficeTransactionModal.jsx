import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import { useLocale } from "../../../hooks/useLocale";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { updateTotalCalculationApi } from "../../../api/queries/patch";
import { useValidShema } from "../../../functions/useValidShema";
import OfficeTransactionFields from "./Contents/OfficeTransactionFields";
import { toFormValues, toPayload } from "./functions/officeCashHelpers";

const EditOfficeTransactionModal = ({ open, close, table, row }) => {
  const { t } = useLocale();
  const { officeTransaction } = useValidShema();

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().editingRow?.id === row?.id);

  const handleClose = () => {
    if (table) table.setEditingRow(null);
    close?.();
  };

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(officeTransaction),
    defaultValues: toFormValues(row?.original),
  });

  useEffect(() => {
    if (isModalOpen && row?.original) {
      reset(toFormValues(row.original));
    }
  }, [isModalOpen, row?.original, reset]);

  const { mutate: updateTransaction, isPending } = useUpdate({
    apiFn: updateTotalCalculationApi,
    key: "totalCalculations",
    // A moved office, amount or currency changes which rows match and the
    // office balances, so refetch both instead of only merging the row.
    isPaginated: true,
    invalidateQueries: ["officeBalances"],
    idKey: "guid",
    onSuccessUpdate: handleClose,
  });

  const onSubmit = (formData) =>
    updateTransaction({ guid: row.original.guid, ...toPayload(formData) });

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={560}>
      <CustomDialogHeader variant="h6" title={t("finance.editTransaction")} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <OfficeTransactionFields control={control} />
        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditOfficeTransactionModal;
