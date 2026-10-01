import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import { useLocale } from "../../../hooks/useLocale";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addTotalCalculationApi } from "../../../api/queries/post";
import { useValidShema } from "../../../functions/useValidShema";
import OfficeTransactionFields from "./Contents/OfficeTransactionFields";
import { toFormValues, toPayload } from "./functions/officeCashHelpers";

// `officeGuid` preselects the office when opened from an office card.
const AddOfficeTransactionModal = ({ open, close, officeGuid = "" }) => {
  const { t } = useLocale();
  const { officeTransaction } = useValidShema();

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(officeTransaction),
    defaultValues: toFormValues({}, officeGuid),
  });

  useEffect(() => {
    if (open) reset(toFormValues({}, officeGuid));
  }, [open, officeGuid, reset]);

  const handleClose = () => close?.();

  const { mutate: createTransaction, isPending } = useCreate({
    apiFn: addTotalCalculationApi,
    key: "totalCalculations",
    isPaginated: true,
    invalidateQueries: ["officeBalances"],
    onSuccess: handleClose,
  });

  const onSubmit = (formData) => createTransaction(toPayload(formData));

  return (
    <CustomDialog open={Boolean(open)} close={handleClose} widthX={560}>
      <CustomDialogHeader variant="h6" title={t("finance.addTransaction")} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <OfficeTransactionFields control={control} />
        <FooterButton loading={isPending} onCancel={handleClose} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddOfficeTransactionModal;
