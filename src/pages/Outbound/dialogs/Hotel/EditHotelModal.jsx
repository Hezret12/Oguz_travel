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
import { updateHotelApi } from "../../../../api/queries/patch";
import { SOURCE_OPTIONS, PAYMENT_OPTIONS } from "../../constants";
import HotelFields from "../fields/HotelFields";

const EditHotelModal = ({ table, row }) => {
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
      request_date: item.application_date || item.request_date ? dayjs(item.application_date || item.request_date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
      office_guid: item.office_guid || item.office?.guid || "",
      operator_guid: item.opr_guid || item.operator_guid || item.operator?.guid || "",
      client_name: item.client_guid || item.client?.guid || item.client_name || "",
      prepared_by: item.prepared_opr_guid || item.prepared_by || item.prepared_by_employee?.guid || "",
      net_fare: item.cost ?? item.net_fare ?? 0,
      price: item.price ?? 0,
      currency: item.currency || "USD",
      source: item.system || item.source || SOURCE_OPTIONS[0].value,
      destinationCountry: item.destination_country || item.destinationCountry || "",
      hotelName: item.hotel_name || item.hotelName || "",
      roomType: item.room_type || item.roomType || "",
      mealPlan: item.meal_plan || item.mealPlan || "",
      guestCount: item.guests_count ?? item.guestCount ?? 1,
      note: item.note || "",
      is_paid: item.is_paid ?? false,
    },
  });

  const currency = useWatch({ control, name: "currency" }) || "USD";

  const { mutate: updateHotel } = useUpdate({
    apiFn: updateHotelApi,
    key: ["outbound", "hotel"],
    idKey: "guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      guid: item.guid,
      application_date: data.request_date
        ? new Date(data.request_date).toISOString()
        : new Date().toISOString(),
      opr_guid: data.operator_guid || null,
      client_guid:
        selectedClientObj?.guid ||
        (typeof data.client_name === "string" && data.client_name.length > 20
          ? data.client_name
          : item.client_guid || item.client?.guid || null),
      prepared_opr_guid: data.prepared_by || null,
      destination_country: data.destinationCountry || "",
      hotel_name: data.hotelName || "",
      room_type: data.roomType || "",
      meal_plan: data.mealPlan || "",
      guests_count: Number(data.guestCount || 1),
      cost: Number(data.net_fare || 0),
      price: Number(data.price || 0),
      currency: data.currency || "USD",
      system: data.source || "",
      note: data.note || "",
      is_paid: Boolean(data.is_paid),
    };
    updateHotel(payload);
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

          <HotelFields control={control} />

          <Grid size={4}>
            <CurrencyAmount
              name="net_fare"
              control={control}
              label={t("outbound.net_fare") || "Bahasy (alnan)"}
              currency={currency}
              onCurrencyChange={(curr) => setValue("currency", curr)}
              required
            />
          </Grid>
          <Grid size={4}>
            <CustomTextField name="price" control={control} type="number" label={t("outbound.price") || "Satuw bahasy"} startIcon={currencySymbol} required />
          </Grid>
          <Grid size={4}>
            <CustomSelect name="is_paid" control={control} label={t("outbound.paymentStatus") || "Töleg ýagdaýy"} options={PAYMENT_OPTIONS} required />
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

export default EditHotelModal;
