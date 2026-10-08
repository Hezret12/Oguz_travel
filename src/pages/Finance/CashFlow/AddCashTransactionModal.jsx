import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import { useLocale } from "../../../hooks/useLocale";
import { useAuth } from "../../../context/useAuth";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addTotalCalculationApi } from "../../../api/queries/post";
import { useValidShema } from "../../../functions/useValidShema";
import CashTransactionFields from "./Contents/CashTransactionFields";
import { toFormValues, toPayload } from "./functions/cashFlowHelpers";

const AddCashTransactionModal = ({ open, close, table }) => {
  const { t } = useLocale();
  const { user } = useAuth();
  const { cashTransaction } = useValidShema();

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().creatingRow);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(cashTransaction),
    defaultValues: toFormValues(),
  });

  const handleClose = () => {
    if (table) table.setCreatingRow(null);
    reset(toFormValues());
    close?.();
  };

  const { mutate: createTransaction, isPending } = useCreate({
    apiFn: addTotalCalculationApi,
    key: "totalCalculations",
    isPaginated: true,
    onSuccess: handleClose,
  });

  // A new row is booked to the office of whoever enters it; the form has no office field.
  const onSubmit = (formData) =>
    createTransaction({
      ...toPayload(formData),
      ...(user?.office_guid ? { office_guid: user.office_guid } : {}),
    });

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={640}>
      <CustomDialogHeader variant="h6" title={t("finance.addTransaction")} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <CashTransactionFields control={control} />
        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddCashTransactionModal;
