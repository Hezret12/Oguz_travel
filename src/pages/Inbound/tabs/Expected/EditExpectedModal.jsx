import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../../hooks/CRUD/useUpdate";
import { updateInboundExpectedApi } from "../../../../api/queries/patch";
import { INBOUND_QUERY_KEYS, INBOUND_SUMMARY_KEY } from "../../constants";
import { getExpectedDefaults, toExpectedPayload } from "../../functions/formValues";
import ExpectedFields from "./ExpectedFields";

const EditExpectedModal = ({ table, row }) => {
  const { t } = useLocale();
  const { inboundExpected } = useValidShema();

  const closeDialog = () => table.setEditingRow(null);

  const { mutate: updateExpected, isPending } = useUpdate({
    apiFn: updateInboundExpectedApi,
    key: INBOUND_QUERY_KEYS.expected,
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: [INBOUND_SUMMARY_KEY],
    onSuccessUpdate: closeDialog,
  });

  const { control, handleSubmit } = useForm({
    defaultValues: getExpectedDefaults(row?.original),
    resolver: yupResolver(inboundExpected),
  });

  const submitHandler = (values) =>
    updateExpected({ guid: row?.original?.guid, ...toExpectedPayload(values) });

  return (
    <CustomDialog widthX={620} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("inbound.expected.edit")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <ExpectedFields control={control} />
        <FooterButton loading={isPending} onCancel={closeDialog} sx={{ mt: 3 }} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditExpectedModal;
