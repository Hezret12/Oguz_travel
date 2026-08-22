import { Box, Grid } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import FooterButton from "../../../components/Dialog/FooterButton";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { useLocale } from "../../../hooks/useLocale";
import { useValidShema } from "../../../functions/useValidShema";
import GlobalAutoCompleteClient from "../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import AgentAccordion from "../../../components/global/AgentAccordion";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { updateB2BApi } from "../../../api/queries/patch";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { getAllStatusApi } from "../../../api/queries/getters";
import { useGet } from "../../../hooks/CRUD/useGet";
import CustomDatePicker from "../../../components/CustomDatePicker";
import { useMemo } from "react";
import CurrencyAmount from "../../../components/inputs/CurrencyAmount";
import {
  getBooleanPaymentOptions,
  getTripTypeOptions,
} from "../../../functions/generalHelpers";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  TMT: "m",
  RUB: "₽",
};

const EditB2BDialog = ({ table, row, open, close }) => {
  const { t, selectedLang } = useLocale();
  const { addB2BTicket } = useValidShema();

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && (table.getState().editingRow?.id === row?.id || table.getState().editingRow));

  const closeDialog = () => {
    if (table) {
      table.setEditingRow(null);
    }
    close?.();
  };

  const paymentOptions = useMemo(() => getBooleanPaymentOptions(t), [t]);
  const tripTypeOptions = useMemo(() => getTripTypeOptions(t), [t]);

  const {
    data: status,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useGet({
    apiFn: getAllStatusApi,
    key: "status",
  });

  const { mutate: updateB2B, isPending: isSubmit } = useUpdate({
    apiFn: updateB2BApi,
    key: "b2b",
    idKey: "guid",
    onSuccessUpdate: () => {
      closeDialog();
    },
  });

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      guid: row?.original?.guid || "",
      datetime: row?.original?.datetime || "",
      assignment_opr_guid: row?.original?.assignment_opr_guid || row?.original?.assignment_operator?.guid || "",
      receiver_opr_guid: row?.original?.receiver_opr_guid || row?.original?.receiver_operator?.guid || "",
      agent: {
        name: row?.original?.agent?.name || "",
        phone_number: row?.original?.agent?.phone_number || "",
      },
      client_guid: row?.original?.client_guid || row?.original?.client?.guid || "",
      status_guid: row?.original?.status_guid || row?.original?.status?.guid || row?.original?.tstatus?.guid || "",
      airline: row?.original?.airline || "",
      route: row?.original?.route || "",
      class: row?.original?.class || "",
      travel_type: row?.original?.travel_type !== undefined ? row.original.travel_type : 0,
      flight_date: row?.original?.flight_date || "",
      net_price: row?.original?.net_price !== undefined ? String(row.original.net_price) : "",
      sale_price: row?.original?.sale_price !== undefined ? String(row.original.sale_price) : "",
      currency: row?.original?.currency || "USD",
      card: row?.original?.card || "",
      note: row?.original?.note || "",
      pnr: row?.original?.pnr || "",
      is_paid: row?.original?.is_paid !== undefined ? row.original.is_paid : true,
    },
    resolver: yupResolver(addB2BTicket),
    mode: "onSubmit",
  });

  const [selectedCurrency] = useWatch({
    control,
    name: ["currency"],
  });

  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] || "$";

  const submitHandler = async (data) => {
    try {
      const payload = {
        ...data,
        datetime: data.datetime
          ? new Date(data.datetime).toISOString()
          : new Date().toISOString(),
        flight_date: data.flight_date
          ? new Date(data.flight_date).toISOString()
          : new Date().toISOString(),
        net_price: Number(data.net_price || 0),
        sale_price: Number(data.sale_price || 0),
        currency: data.currency || "USD",
      };

      await updateB2B(payload);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CustomDialog widthX={800} open={isModalOpen} close={closeDialog}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <CustomDialogHeader
          variant="h5"
          title={t("b2b.editTicket")}
        />

        <CustomForm
          handleSubmit={handleSubmit(submitHandler)}
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              maxHeight: "calc(100vh - 270px)",
              overflowY: "auto",
              overflowX: "hidden",
              pr: 1,
              mr: -0.5,
              scrollbarWidth: "thin",
              scrollbarColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.2) transparent"
                  : "rgba(0, 0, 0, 0.2) transparent",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "divider",
                borderRadius: "999px",
              },
            }}
          >
            <Grid container spacing={2} sx={{ mt: 0.25 }}>
              {/* Client */}
              <Grid size={{ xs: 12 }}>
                <GlobalAutoCompleteClient
                  control={control}
                  name="client_guid"
                  label={t("columns.client")}
                  initialClient={row?.original?.client}
                  columns={["fullName", "phoneNumber", "passport_number"]}
                />
              </Grid>

              {/* Operators & Issue Date */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <GlobalEmployeeAutocomplete
                  name="assignment_opr_guid"
                  control={control}
                  label={t("columns.operator")}
                  initialEmployee={row?.original?.assignment_operator}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <GlobalEmployeeAutocomplete
                  name="receiver_opr_guid"
                  control={control}
                  label={t("columns.operatorTwo")}
                  initialEmployee={row?.original?.receiver_operator}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomDatePicker
                  name="datetime"
                  control={control}
                  label={t("columns.issueDate")}
                />
              </Grid>

              {/* Airline, Route, Flight Date */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  name="airline"
                  control={control}
                  label={t("columns.airline")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  name="route"
                  control={control}
                  label={t("columns.route")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomDatePicker
                  name="flight_date"
                  control={control}
                  label={t("columns.flightDate")}
                />
              </Grid>

              {/* Status, Cabin Class, Trip Type */}
              <Grid size={{ xs: 12, sm: 4 }}>
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
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  name="class"
                  control={control}
                  label={t("columns.cabinClass")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomSelect
                  name="travel_type"
                  control={control}
                  label={t("columns.tripType")}
                  options={tripTypeOptions}
                />
              </Grid>

              {/* Net Fare, Sale Fare, Payment Status */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <CurrencyAmount
                  name="net_price"
                  control={control}
                  label={t("columns.netFare")}
                  currency={selectedCurrency}
                  onCurrencyChange={(curr) => setValue("currency", curr)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "7px",
                      minHeight: "44px",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      pr: 0.5,
                      "&:hover": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.02)" : "#ffffff",
                        boxShadow: (theme) =>
                          theme.palette.mode === "dark"
                            ? "0 0 0 3px rgba(59, 130, 246, 0.16)"
                            : "0 0 0 3px rgba(37, 99, 235, 0.12)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderWidth: 1.5,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  name="sale_price"
                  control={control}
                  type="number"
                  label={t("columns.saleFare")}
                  startIcon={currencySymbol}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomSelect
                  name="is_paid"
                  control={control}
                  label={t("columns.paymentStatus")}
                  options={paymentOptions}
                />
              </Grid>

              {/* Card, PNR, Agent */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  name="card"
                  control={control}
                  label={t("columns.card") ?? "Cart"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomTextField
                  name="pnr"
                  control={control}
                  label={t("columns.pnr")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <AgentAccordion
                  control={control}
                  fullNameName="agent.name"
                  phoneNumberName="agent.phone_number"
                  title={t("columns.agent")}
                  fullNameLabel={t("columns.agentFullName")}
                  phoneNumberLabel={t("columns.phoneNumber")}
                />
              </Grid>

              {/* Note */}
              <Grid size={{ xs: 12 }}>
                <CustomTextField
                  name="note"
                  control={control}
                  label={t("columns.note")}
                />
              </Grid>
            </Grid>
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

export default EditB2BDialog;
