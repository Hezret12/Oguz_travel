import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { useCreate } from "../../../../hooks/CRUD/useCreate";
import { addInboundExpectedApi } from "../../../../api/queries/post";
import { INBOUND_QUERY_KEYS, INBOUND_SUMMARY_KEY } from "../../constants";
import { getExpectedDefaults, toExpectedPayload } from "../../functions/formValues";
import ExpectedFields from "./ExpectedFields";

const AddExpectedModal = ({ table }) => {
  const { t } = useLocale();
  const { inboundExpected } = useValidShema();

  const closeDialog = () => table.setCreatingRow(null);

  const { mutate: createExpected, isPending } = useCreate({
    apiFn: addInboundExpectedApi,
    key: INBOUND_QUERY_KEYS.expected,
    isPaginated: true,
    invalidateQueries: [INBOUND_SUMMARY_KEY],
    onSuccess: closeDialog,
  });

  const { control, handleSubmit } = useForm({
    defaultValues: getExpectedDefaults(),
    resolver: yupResolver(inboundExpected),
  });

  const submitHandler = (values) => createExpected(toExpectedPayload(values));

  return (
    <CustomDialog widthX={620} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("inbound.expected.add")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <ExpectedFields control={control} />
        <FooterButton loading={isPending} onCancel={closeDialog} sx={{ mt: 3 }} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddExpectedModal;
