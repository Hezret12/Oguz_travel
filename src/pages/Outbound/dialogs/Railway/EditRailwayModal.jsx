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
import CurrencyAmount from "../../../../components/inputs/CurrencyAmount";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { useUpdate } from "../../../../hooks/CRUD/useUpdate";
import { getAllEmployeeApi, getAllOfficeApi } from "../../../../api/queries/getters";
import { updateRailwayApi } from "../../../../api/queries/patch";
import { SOURCE_OPTIONS } from "../../constants";
import RailwayFields from "../fields/RailwayFields";

const EditRailwayModal = ({ table, row }) => {
  const { t, selectedLang } = useLocale();
  const { addOutbound } = useValidShema();

  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const { data: offices = [] } = useGet({
    apiFn: getAllOfficeApi,
    key: "offices",
  });

  const item = row?.original || {};

  const initialClient = useMemo(() => {
    if (item.client) return item.client;
    if (item.client_guid || item.client_name) {
      return { guid: item.client_guid || "", fullName: item.client_name || "" };
    }
    return null;
  }, [item]);

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
      request_date: item.request_date ? dayjs(item.request_date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      office_guid: item.office_guid || item.office?.guid || "",
      operator_guid: item.operator_guid || item.operator?.guid || "",
      client_name: item.client_guid || item.client?.guid || item.client_name || "",
      prepared_by: item.prepared_by || item.prepared_by_employee?.guid || "",
      net_fare: item.net_fare || item.cost || 0,
      price: item.price || 0,
      currency: item.currency || "USD",
      source: item.source || SOURCE_OPTIONS[0].value,
      ticketNumber: item.ticketNumber || "",
      ticketType: item.ticketType || "",
      destinationCountry: item.destinationCountry || "",
      route: item.route || "",
      trainType: item.trainType || "",
      quantity: item.quantity || 1,
      note: item.note || "",
    },
  });

  const currency = useWatch({ control, name: "currency" }) || "USD";

  const { mutate: updateRailway } = useUpdate({
    apiFn: updateRailwayApi,
    key: ["outbound", "railway"],
    idKey: "guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      client_name: selectedClientObj?.fullName || data.client_name || "",
      client_guid: selectedClientObj?.guid || (typeof data.client_name === "string" && data.client_name.length > 20 ? data.client_name : undefined),
      request_date: data.request_date ? dayjs(data.request_date).format("YYYY-MM-DD") : null,
      net_fare: Number(data.net_fare || 0),
      price: Number(data.price || 0),
      currency: data.currency || "USD",
      quantity: data.quantity ? Number(data.quantity) : undefined,
    };
    delete payload.cost;
    delete payload.profit;
    updateRailway(payload);
  };

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => {
        const officeShort = emp.office?.shortName
          ? selectedLang(emp.office.shortName) || selectedLang(emp.office.fullName) || ""
          : "";
        const label = officeShort ? `${emp.fullName} (${officeShort})` : emp.fullName;
        return { label, value: emp.guid };
      }),
    [employees, selectedLang]
  );

  const officeOptions = useMemo(
    () =>
      (offices || []).map((off) => ({
        value: off.guid,
        label: selectedLang(off.shortName) || selectedLang(off.fullName) || "",
      })),
    [offices, selectedLang]
  );

  const currencySymbol = {
    USD: "$",
    EUR: "€",
    TMT: "m",
    RUB: "₽",
  }[currency] || currency;

  return (
    <CustomDialog open={true} close={() => table.setEditingRow(null)} widthX={750}>
      <CustomDialogHeader variant="h5" title={t("outbound.editSale") || "Satyşy üýtgetmek"} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={3}>
            <CustomDatePicker name="request_date" control={control} label={t("outbound.requestDate") || "Arza senesi"} required />
          </Grid>
          <Grid size={3}>
            <CustomSelect name="office_guid" control={control} label={t("outbound.office") || "Ofis"} options={officeOptions} required />
          </Grid>
          <Grid size={3}>
            <CustomSelect name="operator_guid" control={control} label={t("outbound.operator") || "Operator"} options={employeeOptions} required />
          </Grid>
          <Grid size={3}>
            <CustomSelect name="prepared_by" control={control} label={t("outbound.preparedBy") || "Taýýarlan"} options={employeeOptions} required />
          </Grid>
          <Grid size={8}>
            <GlobalClientAutocomplete
              name="client_name"
              control={control}
              label={t("outbound.clientName") || "Müşderiniň ady"}
              columns={["fullName"]}
              required
              initialClient={initialClient}
              onClientChange={(client) => setSelectedClientObj(client)}
            />
          </Grid>
          <Grid size={4}>
            <CustomSelect name="source" control={control} label={t("outbound.source") || "Ulgam"} options={SOURCE_OPTIONS} required />
          </Grid>

          <RailwayFields control={control} />

          <Grid size={6}>
            <CurrencyAmount
              name="net_fare"
              control={control}
              label={t("outbound.net_fare") || "Bahasy (alnan)"}
              currency={currency}
              onCurrencyChange={(curr) => setValue("currency", curr)}
              required
            />
          </Grid>
          <Grid size={6}>
            <CustomTextField name="price" control={control} type="number" label={t("outbound.price") || "Satuw bahasy"} startIcon={currencySymbol} required />
          </Grid>
          <Grid size={12}>
            <CustomTextField name="note" control={control} label={t("outbound.note") || "Bellik"} multiline rows={2} />
          </Grid>
        </Grid>
        <FooterButton loading={isSubmitting} onCancel={() => table.setEditingRow(null)} type="submit" sx={{ mt: 3 }} />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditRailwayModal;
