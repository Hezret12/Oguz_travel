import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../../hooks/CRUD/useUpdate";
import { updateInboundInvitationApi } from "../../../../api/queries/patch";
import { INBOUND_QUERY_KEYS, INBOUND_SUMMARY_KEY } from "../../constants";
import { getInvitationDefaults, toInvitationPayload } from "../../functions/formValues";
import InvitationFields from "./InvitationFields";

const EditInvitationModal = ({ table, row }) => {
  const { t } = useLocale();
  const { inboundInvitation } = useValidShema();

  const closeDialog = () => table.setEditingRow(null);

  const { mutate: updateInvitation, isPending } = useUpdate({
    apiFn: updateInboundInvitationApi,
    key: INBOUND_QUERY_KEYS.invitations,
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: [INBOUND_SUMMARY_KEY],
    onSuccessUpdate: closeDialog,
  });

  const { control, handleSubmit } = useForm({
    defaultValues: getInvitationDefaults(row?.original),
    resolver: yupResolver(inboundInvitation),
  });

  const submitHandler = (values) =>
    updateInvitation({ guid: row?.original?.guid, ...toInvitationPayload(values) });

  return (
    <CustomDialog widthX={620} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("inbound.invitations.edit")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <InvitationFields control={control} />
        <FooterButton loading={isPending} onCancel={closeDialog} sx={{ mt: 3 }} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditInvitationModal;
