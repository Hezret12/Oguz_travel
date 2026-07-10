import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import FooterButton from "../../../components/Dialog/FooterButton";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";
import GlobalClientAutocomplete from "../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import AgentAccordion from "../../../components/global/AgentAccordion";
import { addB2BApi } from "../../../api/queries/post";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { getAllStatusApi } from "../../../api/queries/getters";
import { useGet } from "../../../hooks/CRUD/useGet";

const TRIP_TYPE_OPTIONS = [
  { label: "One Way", value: "ONE WAY" },
  { label: "Round Trip", value: "ROUND TRIP" },
];

const CABIN_OPTIONS = [
  { label: "ECO", value: "ECO" },
  { label: "ECO/Q", value: "ECO/Q" },
  { label: "BUSINESS", value: "BUSINESS" },
  { label: "EXTRA", value: "EXTRA" },
];

const AddB2BTicketDialog = ({ table }) => {
  const { t, selectedLang } = useLocale();
  const { addB2BTicket } = useValidShema();

  const {
    data: status,
    isLoading,
    isError: isStatusError,
  } = useGet({
    apiFn: getAllStatusApi,
    key: "status",
  });

  const { mutate: createB2B, isLoading: isSubmit } = useCreate({
    apiFn: addB2BApi,
    key: "b2b",
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      client_guid: "",
      issueDate: "",
      operator_guid: "",
      recieved_operator_guid: "",
      pnr: "",
      status: "",
      airline: "",
      route: "",
      cabinClass: "",
      tripType: "",
      flightDate: "",
      netFare: "",
      saleFare: "",
      card: "",
      agent: {
        name: "",
        phone_number: "",
      },
      note: "",
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
      await createB2B(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CustomDialog widthX={760} open={open} close={closeDialog}>
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
              <GlobalClientAutocomplete
                control={control}
                name="clientId"
                label={t("columns.client")}
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
              <CustomTextField
                name="operator"
                control={control}
                label={t("columns.operator") ?? "Tabsyryjy"}
              />

              <CustomTextField
                name="operatorTwo"
                control={control}
                label={t("columns.operatorTwo") ?? "Kabul ediji"}
              />

              <CustomTextField
                name="issueDate"
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
                name="pnr"
                control={control}
                label={t("columns.pnr") ?? "PNR"}
              />

              <CustomTextField
                name="route"
                control={control}
                label={t("columns.route") ?? "Route"}
              />
              <CustomTextField
                name="flightDate"
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
                isLoading={isLoading}
                isError={isStatusError}
                getRowId={(item) => item.guid}
                getRowLabel={(item) => selectedLang(item.name)}
              />
              <CustomSelect
                name="cabinClass"
                control={control}
                label={t("columns.cabinClass") ?? "Class"}
                options={CABIN_OPTIONS}
              />

              <CustomSelect
                name="tripType"
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
                name="netFare"
                control={control}
                type="number"
                label={t("columns.netFare") ?? "Net Fare"}
              />

              <CustomTextField
                name="saleFare"
                control={control}
                type="number"
                label={t("columns.saleFare") ?? "Sale Fare"}
              />
              <CustomSelect
                name="status_guid"
                control={control}
                label={t("columns.status")}
                options={status}
                isLoading={isLoading}
                isError={isStatusError}
                getRowId={(item) => item.guid}
                getRowLabel={(item) => selectedLang(item.name)}
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
