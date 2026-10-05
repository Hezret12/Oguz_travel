import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { useUpdate } from "../../../../hooks/CRUD/useUpdate";
import { updateInboundArrivalApi } from "../../../../api/queries/patch";
import { INBOUND_QUERY_KEYS, INBOUND_SUMMARY_KEY } from "../../constants";
import { getArrivalDefaults, toArrivalPayload } from "../../functions/formValues";
import ArrivalFields from "./ArrivalFields";

const EditArrivalModal = ({ table, row }) => {
  const { t } = useLocale();
  const { inboundArrival } = useValidShema();

  const closeDialog = () => table.setEditingRow(null);

  const { mutate: updateArrival, isPending } = useUpdate({
    apiFn: updateInboundArrivalApi,
    key: INBOUND_QUERY_KEYS.arrivals,
    idKey: "guid",
    isPaginated: true,
    invalidateQueries: [INBOUND_SUMMARY_KEY],
    onSuccessUpdate: closeDialog,
  });

  const { control, handleSubmit } = useForm({
    defaultValues: getArrivalDefaults(row?.original),
    resolver: yupResolver(inboundArrival),
  });

  const submitHandler = (values) =>
    updateArrival({ guid: row?.original?.guid, ...toArrivalPayload(values) });

  return (
    <CustomDialog widthX={760} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("inbound.arrivals.edit")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <ArrivalFields control={control} />
        <FooterButton loading={isPending} onCancel={closeDialog} sx={{ mt: 3 }} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditArrivalModal;
