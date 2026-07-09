import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
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

const STATUS_OPTIONS = [
  { label: "Sale", value: "SALE" },
  { label: "Reissue", value: "REISSUE" },
  { label: "Refund", value: "REFUND" },
];

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

const AddB2BTicketDialog = ({ open, onClose, onSave, ticket }) => {
  const { t } = useLocale();
  const { addB2BTicket } = useValidShema();
  const [loading, setLoading] = useState(false);

  const defaultValues = useMemo(() => {
    const currentTicket = ticket ?? {};
    const agentFullName =
      currentTicket.agentFullName ?? currentTicket.agent ?? "";
    const agentPhoneNumber = currentTicket.agentPhoneNumber ?? "";

    return {
      clientId: "",
      issueDate: "",
      operator: "",
      office: "",
      operatorTwo: "",
      pnr: "",
      status: "SALE",
      airline: "",
      route: "",
      cabinClass: "",
      tripType: "",
      flightDate: "",
      netFare: "",
      saleFare: "",
      card: "",
      note: "",
      ...currentTicket,
      agent: currentTicket.agent ?? agentFullName,
      agentFullName,
      agentPhoneNumber,
    };
  }, [ticket]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues,
    resolver: yupResolver(addB2BTicket),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const closeDialog = () => {
    onClose?.();
    reset(defaultValues);
  };

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const agentFullName = data.agentFullName?.trim() ?? "";
      const agentPhoneNumber = data.agentPhoneNumber?.trim() ?? "";
      const payload = {
        ...data,
        agent: agentFullName,
        agentFullName,
        agentPhoneNumber,
      };

      onSave?.(payload);
      toast.success(
        t("pages.ticket.b2b.saveSuccess") ?? "Ticket saved successfully!",
      );
      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error(
        t("pages.ticket.b2b.saveError") ??
          "An error occurred while saving the ticket.",
      );
    } finally {
      setLoading(false);
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
          title={
            ticket
              ? (t("pages.ticket.b2b.editTicket") ?? "Edit B2B Ticket")
              : (t("pages.ticket.b2b.addTicket") ?? "Add B2B Ticket")
          }
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
                label={t("columns.client") ?? "Client"}
                placeholder={
                  t("columns.clientPlaceholder") ?? "Search client..."
                }
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
                name="status"
                control={control}
                label={t("columns.status") ?? "Status"}
                options={STATUS_OPTIONS}
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
              <CustomTextField
                name="profit"
                control={control}
                type="number"
                label={t("columns.profit") ?? "Peyda"}
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

              <CustomTextField
                name="paymentType"
                control={control}
                label={t("columns.paymentType")}
              />

              <AgentAccordion
                control={control}
                title={t("columns.agent") ?? "Agent"}
                fullNameLabel={t("columns.agentFullName", "Agent Full Name")}
                phoneNumberLabel={t(
                  "ticket.b2b.agentPhoneNumber",
                  "Agent Phone Number",
                )}
              />
            </Box>

            <Box sx={{ flex: { xs: "1 1 100%" } }}>
              <CustomTextField
                name="note"
                control={control}
                multiline
                rows={2}
                label={t("columns.note") ?? "Note"}
              />
            </Box>
          </Box>

          <FooterButton
            loading={loading}
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
