import { useMemo, useState } from "react";
import { Grid } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import FooterButton from "../../../components/Dialog/FooterButton";
import CustomDatePicker from "../../../components/CustomDatePicker";
import GlobalClientAutocomplete from "../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { getAllEmployeeApi, getAllOfficeApi } from "../../../api/queries/getters";
import { updateOutboundApi } from "../../../api/queries/outboundApi";
import {
  SOURCE_OPTIONS,
  PARTNER_OPTIONS,
  TICKET_TYPE_OPTIONS,
  MEAL_PLAN_OPTIONS,
  TRAIN_TYPE_OPTIONS,
  CAR_TYPE_OPTIONS,
  TRANSFER_TYPE_OPTIONS,
} from "../constants";

const EditOutboundModal = ({ table, row, activeTab }) => {
  const { t, selectedLang } = useLocale();
  const { addOutbound } = useValidShema();

  // Load operators and offices
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
      return {
        guid: item.client_guid || "",
        fullName: item.client_name || "",
      };
    }
    return null;
  }, [item]);

  const [selectedClientObj, setSelectedClientObj] = useState(initialClient);

  // react-hook-form setup
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(addOutbound),
    defaultValues: {
      guid: item.guid || "",
      request_date: item.request_date
        ? dayjs(item.request_date).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
      office_guid: item.office_guid || item.office?.guid || "",
      operator_guid: item.operator_guid || item.operator?.guid || "",
      client_name: item.client_guid || item.client?.guid || item.client_name || "",
      prepared_by: item.prepared_by || item.prepared_by_employee?.guid || "",
      cost: item.cost || 0,
      price: item.price || 0,
      source: item.source || (activeTab === "package" ? PARTNER_OPTIONS[0].value : SOURCE_OPTIONS[0].value),
      destinationCountry: item.destinationCountry || "",
      hotelName: item.hotelName || "",
      roomType: item.roomType || "",
      mealPlan: item.mealPlan || "",
      guestCount: item.guestCount || 1,
      ticketNumber: item.ticketNumber || "",
      ticketType: item.ticketType || "",
      route: item.route || "",
      quantity: item.quantity || 1,
      trainType: item.trainType || "",
      tourName: item.tourName || "",
      transferType: item.transferType || "",
      carType: item.carType || "",
      note: item.note || "",
    },
  });

  const cost = useWatch({ control, name: "cost" });
  const price = useWatch({ control, name: "price" });
  const profit = Number(price || 0) - Number(cost || 0);

  const { mutate: updateOutbound } = useUpdate({
    apiFn: updateOutboundApi,
    key: ["outbound", activeTab],
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
      type: activeTab,
      request_date: data.request_date
        ? dayjs(data.request_date).format("YYYY-MM-DD")
        : null,
      cost: Number(data.cost || 0),
      price: Number(data.price || 0),
      profit: Number(data.price || 0) - Number(data.cost || 0),
      guestCount: data.guestCount ? Number(data.guestCount) : undefined,
      quantity: data.quantity ? Number(data.quantity) : undefined,
    };
    updateOutbound(payload);
  };

  // Map employee options with office shortnames
  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => {
        const officeShort = emp.office?.shortName
          ? selectedLang(emp.office.shortName) ||
            selectedLang(emp.office.fullName) ||
            ""
          : "";
        const label = officeShort
          ? `${emp.fullName} (${officeShort})`
          : emp.fullName;
        return { label, value: emp.guid };
      }),
    [employees, selectedLang]
  );

  // Map offices
  const officeOptions = useMemo(
    () =>
      (offices || []).map((off) => ({
        value: off.guid,
        label: selectedLang(off.shortName) || selectedLang(off.fullName) || "",
      })),
    [offices, selectedLang]
  );

  return (
    <CustomDialog
      open={true}
      close={() => table.setEditingRow(null)}
      widthX={750}
    >
      <CustomDialogHeader
        variant="h5"
        title={t("outbound.editSale") || "Satyşy üýtgetmek"}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Common Fields */}
          <Grid size={3}>
            <CustomDatePicker
              name="request_date"
              control={control}
              label={t("outbound.requestDate") || "Arza senesi"}
              required
            />
          </Grid>

          <Grid size={3}>
            <CustomSelect
              name="office_guid"
              control={control}
              label={t("outbound.office") || "Ofis"}
              options={officeOptions}
              required
            />
          </Grid>

          <Grid size={3}>
            <CustomSelect
              name="operator_guid"
              control={control}
              label={t("outbound.operator") || "Operator"}
              options={employeeOptions}
              required
            />
          </Grid>

          <Grid size={3}>
            <CustomSelect
              name="prepared_by"
              control={control}
              label={t("outbound.preparedBy") || "Taýýarlan"}
              options={employeeOptions}
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
              initialClient={initialClient}
              onClientChange={(client) => {
                setSelectedClientObj(client);
              }}
            />
          </Grid>

          <Grid size={4}>
            {activeTab === "package" ? (
              <CustomSelect
                name="source"
                control={control}
                label={t("outbound.partner") || "Hyzmatdaş"}
                options={PARTNER_OPTIONS}
                required
              />
            ) : (
              <CustomSelect
                name="source"
                control={control}
                label={t("outbound.source") || "Ulgam"}
                options={SOURCE_OPTIONS}
                required
              />
            )}
          </Grid>

          {/* Conditional Tab-specific Fields */}
          {activeTab === "hotel" && (
            <>
              <Grid size={4}>
                <CustomTextField
                  name="destinationCountry"
                  control={control}
                  label={t("outbound.destinationCountry") || "Ugur ýurdy"}
                />
              </Grid>
              <Grid size={8}>
                <CustomTextField
                  name="hotelName"
                  control={control}
                  label={t("outbound.hotelName") || "Otel ady"}
                />
              </Grid>
              <Grid size={5}>
                <CustomTextField
                  name="roomType"
                  control={control}
                  label={t("outbound.roomType") || "Otag görnüşi"}
                />
              </Grid>
              <Grid size={4}>
                <CustomSelect
                  name="mealPlan"
                  control={control}
                  label={t("outbound.mealPlan") || "Iýmit"}
                  options={MEAL_PLAN_OPTIONS}
                />
              </Grid>
              <Grid size={3}>
                <CustomTextField
                  name="guestCount"
                  control={control}
                  type="number"
                  label={t("outbound.guestCount") || "Myhmanlaryň sany"}
                />
              </Grid>
            </>
          )}

          {activeTab === "airway" && (
            <>
              <Grid size={4}>
                <CustomTextField
                  name="ticketNumber"
                  control={control}
                  label={t("outbound.ticketNumber") || "Bilet belgisi"}
                />
              </Grid>
              <Grid size={4}>
                <CustomSelect
                  name="ticketType"
                  control={control}
                  label={t("outbound.ticketType") || "Bilet görnüşi"}
                  options={TICKET_TYPE_OPTIONS}
                />
              </Grid>
              <Grid size={4}>
                <CustomTextField
                  name="destinationCountry"
                  control={control}
                  label={t("outbound.destinationCountry") || "Ugur ýurdy"}
                />
              </Grid>
              <Grid size={6}>
                <CustomTextField
                  name="route"
                  control={control}
                  label={t("outbound.route") || "Ugur"}
                />
              </Grid>
              <Grid size={6}>
                <CustomTextField
                  name="quantity"
                  control={control}
                  type="number"
                  label={t("outbound.quantity") || "Sany"}
                />
              </Grid>
            </>
          )}

          {activeTab === "railway" && (
            <>
              <Grid size={4}>
                <CustomTextField
                  name="ticketNumber"
                  control={control}
                  label={t("outbound.ticketNumber") || "Bilet belgisi"}
                />
              </Grid>
              <Grid size={4}>
                <CustomSelect
                  name="ticketType"
                  control={control}
                  label={t("outbound.ticketType") || "Bilet görnüşi"}
                  options={TICKET_TYPE_OPTIONS}
                />
              </Grid>
              <Grid size={4}>
                <CustomTextField
                  name="destinationCountry"
                  control={control}
                  label={t("outbound.destinationCountry") || "Ugur ýurdy"}
                />
              </Grid>
              <Grid size={4}>
                <CustomTextField
                  name="route"
                  control={control}
                  label={t("outbound.route") || "Ugur"}
                />
              </Grid>
              <Grid size={4}>
                <CustomTextField
                  name="quantity"
                  control={control}
                  type="number"
                  label={t("outbound.quantity") || "Sany"}
                />
              </Grid>
              <Grid size={4}>
                <CustomSelect
                  name="trainType"
                  control={control}
                  label={t("outbound.trainType") || "Otly görnüşi"}
                  options={TRAIN_TYPE_OPTIONS}
                />
              </Grid>
            </>
          )}

          {activeTab === "tour" && (
            <>
              <Grid size={4}>
                <CustomTextField
                  name="destinationCountry"
                  control={control}
                  label={t("outbound.destinationCountry") || "Ugur ýurdy"}
                />
              </Grid>
              <Grid size={4}>
                <CustomTextField
                  name="tourName"
                  control={control}
                  label={t("outbound.tourName") || "Tur ady"}
                />
              </Grid>
              <Grid size={4}>
                <CustomTextField
                  name="guestCount"
                  control={control}
                  type="number"
                  label={t("outbound.guestCount") || "Myhmanlaryň sany"}
                />
              </Grid>
            </>
          )}

          {activeTab === "transfer" && (
            <>
              <Grid size={4}>
                <CustomTextField
                  name="destinationCountry"
                  control={control}
                  label={t("outbound.destinationCountry") || "Ugur ýurdy"}
                />
              </Grid>
              <Grid size={4}>
                <CustomSelect
                  name="transferType"
                  control={control}
                  label={t("outbound.transferType") || "Transfer görnüşi"}
                  options={TRANSFER_TYPE_OPTIONS}
                />
              </Grid>
              <Grid size={4}>
                <CustomTextField
                  name="route"
                  control={control}
                  label={t("outbound.route") || "Ugur"}
                />
              </Grid>
              <Grid size={6}>
                <CustomSelect
                  name="carType"
                  control={control}
                  label={t("outbound.carType") || "Maşyn görnüşi"}
                  options={CAR_TYPE_OPTIONS}
                />
              </Grid>
              <Grid size={6}>
                <CustomTextField
                  name="guestCount"
                  control={control}
                  type="number"
                  label={t("outbound.guestCount") || "Myhmanlaryň sany"}
                />
              </Grid>
            </>
          )}

          {activeTab === "package" && (
            <>
              <Grid size={12}>
                <CustomTextField
                  name="destinationCountry"
                  control={control}
                  label={t("outbound.destinationCountry") || "Ugur ýurdy"}
                />
              </Grid>
            </>
          )}

          {/* Pricing and Note Fields */}
          <Grid size={4}>
            <CustomTextField
              name="cost"
              control={control}
              type="number"
              label={t("outbound.cost") || "Bahasy (alnan)"}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomTextField
              name="price"
              control={control}
              type="number"
              label={t("outbound.price") || "Satuw bahasy"}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomTextField
              name="profit"
              control={control}
              value={profit}
              disabled
              label={t("outbound.profit") || "Peýda"}
            />
          </Grid>

          <Grid size={12}>
            <CustomTextField
              name="note"
              control={control}
              label={t("outbound.note") || "Bellik"}
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

export default EditOutboundModal;
