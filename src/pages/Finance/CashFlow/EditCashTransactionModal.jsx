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
import CashTransactionFields from "./Contents/CashTransactionFields";
import { toFormValues, toPayload } from "./functions/cashFlowHelpers";

const EditCashTransactionModal = ({ open, close, table, row }) => {
  const { t } = useLocale();
  const { cashTransaction } = useValidShema();

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().editingRow?.id === row?.id);

  const handleClose = () => {
    if (table) table.setEditingRow(null);
    close?.();
  };

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(cashTransaction),
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
    idKey: "guid",
    // The row merge alone would leave the server-computed meta.totals (summary
    // cards) stale after an amount/type/currency change, so refetch the list.
    invalidateQueries: ["totalCalculations"],
    onSuccessUpdate: handleClose,
  });

  const onSubmit = (formData) =>
    updateTransaction({ guid: row.original.guid, ...toPayload(formData) });

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={640}>
      <CustomDialogHeader variant="h6" title={t("finance.editTransaction")} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <CashTransactionFields control={control} />
        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditCashTransactionModal;
