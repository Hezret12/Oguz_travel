import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import FooterButton from "../../../components/Dialog/FooterButton";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";
import GlobalAutoCompleteClient from "../../../components/global/GlobalAutoCompleteClient/GlobalAutoCompleteClient";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import AgentAccordion from "../../../components/global/AgentAccordion";
import AppAutocomplete from "../../../components/AppAutocomplete";
import { addB2BApi } from "../../../api/queries/post";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { getAllStatusApi, getAllEmployeeApi } from "../../../api/queries/getters";
import { useGet } from "../../../hooks/CRUD/useGet";

const TRIP_TYPE_OPTIONS = [
  { label: "One Way", value: 0 },
  { label: "Round Trip", value: 1 },
];

const CABIN_OPTIONS = [
  { label: "ECO", value: "ECO" },
  { label: "ECO/Q", value: "ECO/Q" },
  { label: "BUSINESS", value: "BUSINESS" },
  { label: "EXTRA", value: "EXTRA" },
];

const PAYMENT_OPTIONS = [
  { label: "Tolendi", value: true },
  { label: "Kredit", value: false },
];

const AddB2BTicketDialog = ({ table }) => {
  const { t, selectedLang } = useLocale();
  const { addB2BTicket } = useValidShema();

  const {
    data: status,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useGet({
    apiFn: getAllStatusApi,
    key: "status",
  });

  const {
    data: employees = [],
  } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => ({
        label: emp.fullName,
        value: emp.guid,
      })),
    [employees],
  );

  const { mutate: createB2B, isLoading: isSubmit } = useCreate({
    apiFn: addB2BApi,
    key: "b2b",
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      datetime: "",
      assignment_opr_guid: "",
      receiver_opr_guid: "",
      agent: {
        name: "",
        phone_number: "",
      },
      client_guid: "",
      status_guid: "",
      airline: "",
      route: "",
      class: "",
      travel_type: 0,
      flight_date: "",
      net_price: "",
      sale_price: "",
      card: "",
      note: "",
      is_paid: true,
    },
    resolver: yupResolver(addB2BTicket),
    mode: "onSubmit",
  });

  const closeDialog = () => {
    if (table) {
      table.setCreatingRow(null);
    }
  };

  const submitHandler = async (data) => {
    try {
      const payload = {
        ...data,
        datetime: data.datetime ? new Date(data.datetime).toISOString() : new Date().toISOString(),
        flight_date: data.flight_date ? new Date(data.flight_date).toISOString() : new Date().toISOString(),
        net_price: Number(data.net_price || 0),
        sale_price: Number(data.sale_price || 0),
      };

      await createB2B(payload);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CustomDialog widthX={760} open={true} close={closeDialog}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <CustomDialogHeader
          variant="h5"
          title={t("pages.ticket.b2b.addTicket")}
        />

        <CustomForm handleSubmit={handleSubmit(submitHandler)}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              pr: 1,
              mr: -1,
              display: "flex",
              flexWrap: "wrap",
              gap: 2.5,
            }}
          >
            <Box sx={{ flex: { xs: "1 1 100%" }, mt: 1 }}>
              <GlobalAutoCompleteClient
                control={control}
                name="client_guid"
                label={t("columns.client")}
                columns={["fullName", "phoneNumber", "passport_number"]}
              />
            </Box>

            <Box
              sx={{
                flex: {
                  xs: "1 1 100%",
                },
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <AppAutocomplete
                name="assignment_opr_guid"
                control={control}
                label={t("columns.operator") ?? "Tabsyryjy"}
                options={employeeOptions}
              />

              <AppAutocomplete
                name="receiver_opr_guid"
                control={control}
                label={t("columns.operatorTwo") ?? "Kabul ediji"}
                options={employeeOptions}
              />

              <CustomTextField
                name="datetime"
                control={control}
                type="date"
                label={t("columns.issueDate") ?? "Issue Date"}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box
              sx={{
                flex: "1 1 100%",
                display: "flex",
                gap: 1.5,
              }}
            >
              <CustomTextField
                name="airline"
                control={control}
                label={t("columns.airline") ?? "Airline"}
              />

              <CustomTextField
                name="route"
                control={control}
                label={t("columns.route") ?? "Route"}
              />
              <CustomTextField
                name="flight_date"
                control={control}
                type="date"
                label={t("columns.flightDate") ?? "Flight Date"}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box
              sx={{
                flex: { xs: "1 1 100%" },
                display: "flex",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <CustomSelect
                name="status_guid"
                control={control}
                label={t("columns.status")}
                options={status}
                isLoading={isStatusLoading}
                isError={isStatusError}
                getRowId={(item) => item.guid}
                getRowLabel={(item) => selectedLang(item.name)}
              />
              <CustomSelect
                name="class"
                control={control}
                label={t("columns.cabinClass") ?? "Class"}
                options={CABIN_OPTIONS}
              />

              <CustomSelect
                name="travel_type"
                control={control}
                label={t("columns.tripType") ?? "Trip Type"}
                options={TRIP_TYPE_OPTIONS}
              />
            </Box>

            <Box
              sx={{
                flex: "1 1 100%",
                display: "flex",
                gap: 1.5,
              }}
            >
              <CustomTextField
                name="net_price"
                control={control}
                type="number"
                label={t("columns.netFare") ?? "Net Fare"}
              />

              <CustomTextField
                name="sale_price"
                control={control}
                type="number"
                label={t("columns.saleFare") ?? "Sale Fare"}
              />
              <CustomSelect
                name="is_paid"
                control={control}
                label={t("columns.paymentStatus") ?? "Payment Status"}
                options={PAYMENT_OPTIONS}
              />
            </Box>

            <Box
              sx={{
                flex: "1 1 100%",
                display: "flex",
                gap: 1.5,
              }}
            >
              <CustomTextField
                name="card"
                control={control}
                label={t("columns.card") ?? "Cart"}
              />

              <AgentAccordion
                control={control}
                fullNameName="agent.name"
                phoneNumberName="agent.phone_number"
                title={t("columns.agent")}
                fullNameLabel={t("columns.agentFullName")}
                phoneNumberLabel={t("ticket.b2b.agentPhoneNumber")}
              />
            </Box>

            <Box sx={{ flex: { xs: "1 1 100%" } }}>
              <CustomTextField
                name="note"
                control={control}
                multiline
                rows={2}
                label={t("columns.note")}
              />
            </Box>
          </Box>

          <FooterButton
            loading={isSubmit}
            onCancel={closeDialog}
            type="submit"
            sx={{ mt: 3, flexShrink: 0 }}
          />
        </CustomForm>
      </Box>
    </CustomDialog>
  );
};

export default AddB2BTicketDialog;
