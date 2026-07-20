import { useMemo } from "react";
import { Grid, Typography } from "@mui/material";
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
import { useGet } from "../../../hooks/CRUD/useGet";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { getAllEmployeeApi, getAllOfficeApi } from "../../../api/queries/getters";
import { addOutboundApi } from "../../../api/queries/outboundApi";
import {
  SOURCE_OPTIONS,
  PARTNER_OPTIONS,
  TICKET_TYPE_OPTIONS,
  MEAL_PLAN_OPTIONS,
  TRAIN_TYPE_OPTIONS,
  CAR_TYPE_OPTIONS,
  TRANSFER_TYPE_OPTIONS,
} from "../constants";

const AddOutboundModal = ({ table, activeTab }) => {
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

  // react-hook-form setup
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(addOutbound),
    defaultValues: {
      request_date: dayjs().format("YYYY-MM-DD"),
      office_guid: "",
      operator_guid: "",
      client_name: "",
      prepared_by: "",
      cost: 0,
      price: 0,
      source: activeTab === "package" ? PARTNER_OPTIONS[0].value : SOURCE_OPTIONS[0].value,
      destinationCountry: "",
      hotelName: "",
      roomType: "",
      mealPlan: "",
      guestCount: 1,
      ticketNumber: "",
      ticketType: "",
      route: "",
      quantity: 1,
      trainType: "",
      tourName: "",
      transferType: "",
      carType: "",
      note: "",
    },
  });

  const cost = useWatch({ control, name: "cost" });
  const price = useWatch({ control, name: "price" });
  const profit = Number(price || 0) - Number(cost || 0);

  const { mutate: createOutbound } = useCreate({
    apiFn: addOutboundApi,
    key: ["outbound", activeTab],
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
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
    createOutbound(payload);
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
      close={() => table.setCreatingRow(null)}
      widthX={750}
    >
      <CustomDialogHeader
        variant="h5"
        title={t("outbound.addSale") || "Satyş goşmak"}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Common Fields */}
          <Grid size={4}>
            <CustomDatePicker
              name="request_date"
              control={control}
              label={t("outbound.requestDate") || "Arza senesi"}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomSelect
              name="office_guid"
              control={control}
              label={t("outbound.office") || "Ofis"}
              options={officeOptions}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomSelect
              name="operator_guid"
              control={control}
              label={t("outbound.operator") || "Operator"}
              options={employeeOptions}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomTextField
              name="client_name"
              control={control}
              label={t("outbound.clientName") || "Müşderiniň ady"}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomSelect
              name="prepared_by"
              control={control}
              label={t("outbound.preparedBy") || "Taýýarlan"}
              options={employeeOptions}
              required
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
              <Grid size={4}>
                <CustomTextField
                  name="hotelName"
                  control={control}
                  label={t("outbound.hotelName") || "Otel ady"}
                />
              </Grid>
              <Grid size={4}>
                <CustomTextField
                  name="roomType"
                  control={control}
                  label={t("outbound.roomType") || "Otag görnüşi"}
                />
              </Grid>
              <Grid size={6}>
                <CustomSelect
                  name="mealPlan"
                  control={control}
                  label={t("outbound.mealPlan") || "Iýmit"}
                  options={MEAL_PLAN_OPTIONS}
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
          onCancel={() => table.setCreatingRow(null)}
          type="submit"
          sx={{ mt: 3 }}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddOutboundModal;
