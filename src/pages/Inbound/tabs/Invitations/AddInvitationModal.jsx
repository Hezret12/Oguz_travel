import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { useCreate } from "../../../../hooks/CRUD/useCreate";
import { addInboundInvitationApi } from "../../../../api/queries/post";
import { INBOUND_QUERY_KEYS, INBOUND_SUMMARY_KEY } from "../../constants";
import { getInvitationDefaults, toInvitationPayload } from "../../functions/formValues";
import InvitationFields from "./InvitationFields";

const AddInvitationModal = ({ table }) => {
  const { t } = useLocale();
  const { inboundInvitation } = useValidShema();

  const closeDialog = () => table.setCreatingRow(null);

  const { mutate: createInvitation, isPending } = useCreate({
    apiFn: addInboundInvitationApi,
    key: INBOUND_QUERY_KEYS.invitations,
    isPaginated: true,
    invalidateQueries: [INBOUND_SUMMARY_KEY],
    onSuccess: closeDialog,
  });

  const { control, handleSubmit } = useForm({
    defaultValues: getInvitationDefaults(),
    resolver: yupResolver(inboundInvitation),
  });

  const submitHandler = (values) => createInvitation(toInvitationPayload(values));

  return (
    <CustomDialog widthX={620} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("inbound.invitations.add")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <InvitationFields control={control} />
        <FooterButton loading={isPending} onCancel={closeDialog} sx={{ mt: 3 }} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddInvitationModal;
