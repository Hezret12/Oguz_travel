import { useMemo, useState } from "react";
import { Grid } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import FooterButton from "../../../../components/Dialog/FooterButton";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import GlobalClientAutocomplete from "../../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import GlobalEmployeeAutocomplete from "../../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import CurrencyAmount from "../../../../components/inputs/CurrencyAmount";
import { useCreate } from "../../../../hooks/CRUD/useCreate";
import { addTransferApi } from "../../../../api/queries/post";
import { SOURCE_OPTIONS, getPaymentOptions } from "../../constants";
import TransferFields from "./TransferFields";

const AddTransferModal = ({ open = true, onClose, table }) => {
  const { t } = useLocale();
  const { addOutbound } = useValidShema();
  const paymentOptions = useMemo(() => getPaymentOptions(t), [t]);

  const handleClose = () => {
    if (onClose) onClose();
    if (table) table.setCreatingRow(null);
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(addOutbound),
    defaultValues: {
      application_date: dayjs().format("YYYY-MM-DD"),
      opr_guid: "",
      client_name: "",
      prepared_opr_guid: "",
      destination_country: "",
      transfer_type: "",
      route: "",
      machine_type: "",
      guests_count: 1,
      net_fare: null,
      price: null,
      currency: "USD",
      system: SOURCE_OPTIONS[0].value,
      note: "",
      is_paid: 2,
    },
  });

  const [selectedClientObj, setSelectedClientObj] = useState(null);
  const currency = useWatch({ control, name: "currency" }) || "USD";

  const { mutate: createTransfer } = useCreate({
    apiFn: addTransferApi,
    key: ["outbound", "transfer"],
    onSuccess: () => {
      handleClose();
    },
  });

  const onSubmit = (data) => {
    const payload = {
      application_date: data.application_date
        ? new Date(data.application_date).toISOString()
        : new Date().toISOString(),
      opr_guid: data.opr_guid || null,
      client_guid:
        selectedClientObj?.guid ||
        (typeof data.client_name === "string" && data.client_name.length > 20
          ? data.client_name
          : null),
      prepared_opr_guid: data.prepared_opr_guid || null,
      destination_country: data.destination_country || "",
      transfer_type: data.transfer_type || "",
      route: data.route || "",
      machine_type: data.machine_type || "",
      guests_count:
        data.guests_count !== null && data.guests_count !== ""
          ? Number(data.guests_count)
          : null,
      net_fare: Number(data.net_fare || 0),
      price: Number(data.price || 0),
      currency: data.currency || "USD",
      system: data.system || "",
      note: data.note || "",
      is_paid: Number(data.is_paid) || 2,
    };
    createTransfer(payload);
  };

  const currencySymbol =
    {
      USD: "$",
      TMT: "m",
      RUB: "₽",
    }[currency] || currency;

  return (
    <CustomDialog open={open} close={handleClose} widthX={750}>
      <CustomDialogHeader
        variant="h5"
        title={t("outbound.addSale") || "Satyş goşmak"}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={4}>
            <CustomDatePicker
              name="application_date"
              validateFormat
              control={control}
              label={t("outbound.requestDate") || "Arza senesi"}
              required
            />
          </Grid>
          <Grid size={8}>
            <GlobalClientAutocomplete
              name="client_name"
              control={control}
              label={t("outbound.clientName") || "Müşderiniň ady"}
              columns={["fullName"]}
              required
              onClientChange={(client) => setSelectedClientObj(client)}
            />
          </Grid>
          <Grid size={6}>
            <GlobalEmployeeAutocomplete
              name="opr_guid"
              control={control}
              label={t("outbound.operator")}
              required
            />
          </Grid>
          <Grid size={6}>
            <GlobalEmployeeAutocomplete
              name="prepared_opr_guid"
              control={control}
              label={t("outbound.preparedBy")}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomSelect
              name="is_paid"
              control={control}
              label={t("columns.paymentStatus")}
              options={paymentOptions}
              required
            />
          </Grid>
          <Grid size={4}>
            <CurrencyAmount
              name="net_fare"
              control={control}
              label={t("columns.netFare")}
              currency={currency}
              onCurrencyChange={(curr) => setValue("currency", curr)}
              required
            />
          </Grid>
          <Grid size={4}>
            <CustomTextField
              name="price"
              control={control}
              type="number"
              label={t("outbound.price")}
              startIcon={currencySymbol}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomSelect
              name="system"
              control={control}
              label={t("outbound.source")}
              options={SOURCE_OPTIONS}
              required
            />
          </Grid>

          <TransferFields control={control} />

          <Grid size={12}>
            <CustomTextField
              name="note"
              control={control}
              label={t("outbound.note")}
            />
          </Grid>
        </Grid>
        <FooterButton
          loading={isSubmitting}
          onCancel={handleClose}
          type="submit"
          sx={{ mt: 3 }}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddTransferModal;
