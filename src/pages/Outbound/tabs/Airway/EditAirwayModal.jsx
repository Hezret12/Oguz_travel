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
import { useUpdate } from "../../../../hooks/CRUD/useUpdate";
import { updateAirwayApi } from "../../../../api/queries/patch";
import { SOURCE_OPTIONS, getPaymentOptions } from "../../constants";
import AirwayFields from "./AirwayFields";

const EditAirwayModal = ({ table, row }) => {
  const { t } = useLocale();
  const { addOutbound } = useValidShema();
  const paymentOptions = useMemo(() => getPaymentOptions(t), [t]);

  const item = useMemo(() => row?.original || {}, [row?.original]);

  const initialClient = useMemo(() => {
    if (item.client) return item.client;
    if (item.client_guid || item.client_name) {
      return { guid: item.client_guid || "", fullName: item.client_name || "" };
    }
    return null;
  }, [item]);

  const initialOperator = useMemo(() => item.operator || null, [item.operator]);
  const initialPreparedOpr = useMemo(
    () => item.preparedOpr || item.prepared_opr || item.prepared_operator || null,
    [item.preparedOpr, item.prepared_opr, item.prepared_operator]
  );

  const [selectedClientObj, setSelectedClientObj] = useState(initialClient);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(addOutbound),
    defaultValues: {
      guid: item.guid || "",
      application_date: item.application_date
        ? dayjs(item.application_date).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      opr_guid: item.operator?.guid || "",
      client_name: item.client?.guid || "",
      prepared_opr_guid: item.preparedOpr?.guid || "",
      ticket_number: item.ticket_number || "",
      ticket_type: item.ticket_type || "",
      destination_country: item.destination_country || "",
      route: item.route || "",
      passenger_count: item.passenger_count ?? 1,
      net_fare: item.net_fare ?? 0,
      price: item.price ?? 0,
      currency: item.currency || "USD",
      system: item.system || null,
      note: item.note || "",
      is_paid: (item.is_paid === true || item.is_paid === 1 || item.is_paid === "1") ? 1 : (item.is_paid === 3 || item.is_paid === "3") ? 3 : 2,
    },
  });

  const currency = useWatch({ control, name: "currency" }) || "USD";

  const { mutate: updateAirway } = useUpdate({
    apiFn: updateAirwayApi,
    key: ["outbound", "airway"],
    idKey: "guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      guid: item.guid,
      application_date: data.application_date
        ? new Date(data.application_date).toISOString()
        : new Date().toISOString(),
      opr_guid: data.opr_guid || null,
      client_guid:
        selectedClientObj?.guid ||
        (typeof data.client_name === "string" && data.client_name.length > 20
          ? data.client_name
          : item.client?.guid || null),
      prepared_opr_guid: data.prepared_opr_guid || null,
      ticket_number: data.ticket_number || "",
      ticket_type: data.ticket_type || "",
      destination_country: data.destination_country || "",
      route: data.route || "",
      passenger_count:
        data.passenger_count !== null && data.passenger_count !== ""
          ? Number(data.passenger_count)
          : null,
      net_fare: Number(data.net_fare || 0),
      price: Number(data.price || 0),
      currency: data.currency || "USD",
      system: data.system || "",
      note: data.note || "",
      is_paid: Number(data.is_paid) || 2,
    };
    updateAirway(payload);
  };

  const currencySymbol =
    {
      USD: "$",
      EUR: "€",
      TMT: "m",
      RUB: "₽",
    }[currency] || currency;

  return (
    <CustomDialog
      open={true}
      close={() => table.setEditingRow(null)}
      widthX={750}
    >
      <CustomDialogHeader
        variant="h5"
        title={t("outbound.editSale")}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={4}>
            <CustomDatePicker
              name="application_date"
              control={control}
              label={t("outbound.requestDate")}
              required
            />
          </Grid>
          <Grid size={8}>
            <GlobalClientAutocomplete
              name="client_name"
              control={control}
              label={t("outbound.clientName")}
              columns={["fullName"]}
              required
              initialClient={initialClient}
              onClientChange={(client) => setSelectedClientObj(client)}
            />
          </Grid>
          <Grid size={6}>
            <GlobalEmployeeAutocomplete
              name="opr_guid"
              control={control}
              label={t("outbound.operator")}
              initialEmployee={initialOperator}
              required
            />
          </Grid>
          <Grid size={6}>
            <GlobalEmployeeAutocomplete
              name="prepared_opr_guid"
              control={control}
              label={t("outbound.preparedBy")}
              initialEmployee={initialPreparedOpr}
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

          <AirwayFields control={control} />

          <Grid size={12}>
            <CustomTextField
              name="note"
              control={control}
              label={t("outbound.note")}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
        <FooterButton
          loading={isSubmitting}
          onCancel={() => table.setEditingRow(null)}
          type="submit"
          sx={{ mt: 3 }}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditAirwayModal;
