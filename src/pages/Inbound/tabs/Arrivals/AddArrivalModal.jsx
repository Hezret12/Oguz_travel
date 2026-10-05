import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { useCreate } from "../../../../hooks/CRUD/useCreate";
import { addInboundArrivalApi } from "../../../../api/queries/post";
import { INBOUND_QUERY_KEYS, INBOUND_SUMMARY_KEY } from "../../constants";
import { getArrivalDefaults, toArrivalPayload } from "../../functions/formValues";
import ArrivalFields from "./ArrivalFields";

const AddArrivalModal = ({ table }) => {
  const { t } = useLocale();
  const { inboundArrival } = useValidShema();

  const closeDialog = () => table.setCreatingRow(null);

  const { mutate: createArrival, isPending } = useCreate({
    apiFn: addInboundArrivalApi,
    key: INBOUND_QUERY_KEYS.arrivals,
    isPaginated: true,
    invalidateQueries: [INBOUND_SUMMARY_KEY],
    onSuccess: closeDialog,
  });

  const { control, handleSubmit } = useForm({
    defaultValues: getArrivalDefaults(),
    resolver: yupResolver(inboundArrival),
  });

  const submitHandler = (values) => createArrival(toArrivalPayload(values));

  return (
    <CustomDialog widthX={760} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("inbound.arrivals.add")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <ArrivalFields control={control} />
        <FooterButton loading={isPending} onCancel={closeDialog} sx={{ mt: 3 }} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddArrivalModal;
