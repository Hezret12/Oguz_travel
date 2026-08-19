import { useMemo, useRef } from "react";
import { Box, Grid } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import GlobalAutoCompleteClient from "../../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import AgentAccordion from "../../../../components/global/AgentAccordion";
import GlobalEmployeeAutocomplete from "../../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import { useUpdate } from "../../../../hooks/CRUD/useUpdate";
import { updateTurkishAirlinesApi } from "../../../../api/queries/patch";
import { useGet } from "../../../../hooks/CRUD/useGet";
import {
  getAllStatusApi,
  getAllOfficeApi,
} from "../../../../api/queries/getters";
import CurrencyAmount from "../../../../components/inputs/CurrencyAmount";
import { getBooleanPaymentOptions } from "../../../../functions/generalHelpers";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  TMT: "m",
  RUB: "₽",
};

const EditTurkishAirlinesContent = ({ table, row }) => {
  const { t, selectedLang } = useLocale();
  const { addTurkishAirlinesTicket } = useValidShema();
  const isAdjustedFareManualRef = useRef(false);

  const paymentOptions = useMemo(() => getBooleanPaymentOptions(t), [t]);

  // Fetch status options from the API
  const {
    data: statusList,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useGet({
    apiFn: getAllStatusApi,
    key: "status",
  });

  const {
    data: offices = [],
    isLoading: isOfficeLoading,
    isError: isOfficeError,
  } = useGet({
    apiFn: getAllOfficeApi,
    key: "office",
  });

  const { mutate: updateTurkishAirlines, isPending: isSubmit } = useUpdate({
    apiFn: updateTurkishAirlinesApi,
    key: "turkish-airlines",
    idKey: "guid",
    onSuccessUpdate: () => {
      closeDialog();
    },
  });

  const defaultValues = useMemo(() => {
    const currentTicket = row?.original ?? {};

    return {
      guid: currentTicket.guid ?? "",
      datetime: currentTicket.datetime ?? "",
      assignment_opr_guid:
        currentTicket.assignment_opr_guid ??
        currentTicket.ta_assignment_operator?.guid ??
        "",
      receiver_opr_guid:
        currentTicket.receiver_opr_guid ??
        currentTicket.ta_receiver_operator?.guid ??
        "",
      client_guid:
        currentTicket.client_guid ?? currentTicket.client?.guid ?? "",
      milesSmiles: currentTicket.milesSmiles ?? "",
      status_guid:
        currentTicket.status_guid ??
        currentTicket.tstatus?.guid ??
        currentTicket.status?.guid ??
        "",
      pnr: currentTicket.pnr ?? "",
      ticket_number: currentTicket.ticket_number ?? "",
      route: currentTicket.route ?? "",
      class: currentTicket.class ?? "",
      flight_date: currentTicket.flight_date ?? "",
      total_price:
        currentTicket.total_price !== undefined
          ? String(currentTicket.total_price)
          : "",
      base_fare:
        currentTicket.base_fare !== undefined
          ? String(currentTicket.base_fare)
          : "",
      quoted_price:
        currentTicket.quoted_price !== undefined
          ? String(currentTicket.quoted_price)
          : "",
      accepted_price:
        currentTicket.accepted_price !== undefined
          ? String(currentTicket.accepted_price)
          : "",
      returned_price:
        currentTicket.returned_price !== undefined
          ? String(currentTicket.returned_price)
          : "",
      currency: currentTicket.currency || "USD",
      is_paid:
        currentTicket.is_paid !== undefined ? currentTicket.is_paid : true,
      office_guid:
        currentTicket.office_guid ??
        currentTicket.office?.guid ??
        "",
      agent: {
        name: currentTicket.agent?.name ?? "",
        phone_number: currentTicket.agent?.phone_number ?? "",
      },
      note: currentTicket.note ?? "",
    };
  }, [row]);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues,
    resolver: yupResolver(addTurkishAirlinesTicket),
    mode: "onSubmit",
  });

  const [selectedCurrency, isPaidValue] = useWatch({
    control,
    name: ["currency", "is_paid"],
  });
  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] || "$";

  const handleTotalAmountChange = (event) => {
    const nextValue = event?.target?.value ?? event ?? "";
    setValue("total_price", nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (isAdjustedFareManualRef.current) {
      return;
    }

    if (nextValue === "") {
      setValue("quoted_price", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const numericTotal = Number(nextValue);
    if (!Number.isFinite(numericTotal)) {
      return;
    }

    setValue("quoted_price", Math.round(numericTotal), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const closeDialog = () => {
    if (table) {
      table.setEditingRow(null);
    }
  };

  const submitHandler = async (data) => {
    try {
      const payload = {
        guid: data.guid,
        datetime: data.datetime
          ? new Date(data.datetime).toISOString()
          : new Date().toISOString(),
        assignment_opr_guid: data.assignment_opr_guid || null,
        receiver_opr_guid: data.receiver_opr_guid || null,
        agent: {
          name: data.agent?.name?.trim() || "",
          phone_number: data.agent?.phone_number?.trim() || "",
        },
        client_guid: data.client_guid || null,
        milesSmiles: data.milesSmiles?.trim() || "",
        status_guid: data.status_guid || null,
        pnr: data.pnr?.trim() || "",
        ticket_number: data.ticket_number?.trim() || "",
        route: data.route?.trim() || "",
        class: data.class?.trim() || "",
        flight_date: data.flight_date
          ? new Date(data.flight_date).toISOString()
          : new Date().toISOString(),
        total_price: Number(data.total_price || 0),
        base_fare: Number(data.base_fare || 0),
        quoted_price: Number(data.quoted_price || 0),
        accepted_price: Number(data.accepted_price || 0),
        returned_price: Number(data.returned_price || 0),
        currency: data.currency || "USD",
        office_guid: data.office_guid || null,
        note: data.note?.trim() || "",
        is_paid: Boolean(data.is_paid),
      };

      await updateTurkishAirlines(payload);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CustomDialog widthX={1000} open={true} close={closeDialog}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <CustomDialogHeader variant="h5" title={t("turkish.editTicket")} />

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
              <Grid size={{ xs: 12 }}>
                <GlobalAutoCompleteClient
                  control={control}
                  name="client_guid"
                  label={t("columns.client")}
                  initialClient={row?.original?.client}
                  columns={[
                    "fullName",
                    "phone_number",
                    "passport_number",
                    "dateOfBirth",
                    "passportExpiryDate",
                    "passportCountryOfIssue",
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomTextField
                  name="milesSmiles"
                  control={control}
                  label={t("columns.milesSmiles") ?? "MILES & SMILES"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomDatePicker
                  name="datetime"
                  control={control}
                  label={t("columns.issueDate")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomTextField
                  name="ticket_number"
                  control={control}
                  label={t("columns.ticketNo") ?? "TICKET #"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomTextField
                  name="pnr"
                  control={control}
                  label={t("columns.pnr") ?? "PNR"}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomTextField
                  name="route"
                  control={control}
                  label={t("columns.route") ?? "Route"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomDatePicker
                  name="flight_date"
                  control={control}
                  label={t("columns.flightDate")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomSelect
                  name="status_guid"
                  control={control}
                  label={t("columns.status") ?? "Status"}
                  options={statusList}
                  isLoading={isStatusLoading}
                  isError={isStatusError}
                  getRowId={(item) => item.guid}
                  getRowLabel={(item) => selectedLang(item.name)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomTextField
                  name="class"
                  control={control}
                  label={t("columns.cabinClass") ?? "Class"}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CurrencyAmount
                  name="base_fare"
                  control={control}
                  label={t("columns.baseFare")}
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomTextField
                  name="total_price"
                  control={control}
                  type="number"
                  label={t("columns.total")}
                  onChange={handleTotalAmountChange}
                  startIcon={currencySymbol}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomSelect
                  name="office_guid"
                  control={control}
                  label={t("kassa")}
                  options={offices}
                  isLoading={isOfficeLoading}
                  isError={isOfficeError}
                  getRowId={(item) => item.guid}
                  getRowLabel={(item) =>
                    selectedLang(item?.shortName) ||
                    selectedLang(item?.fullName)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomSelect
                  name="is_paid"
                  control={control}
                  label={t("columns.paymentStatus")}
                  options={paymentOptions}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomTextField
                  name="accepted_price"
                  control={control}
                  type="number"
                  label={t("columns.accepted")}
                  startIcon={currencySymbol}
                  disabled={isPaidValue === false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomTextField
                  name="returned_price"
                  control={control}
                  type="number"
                  label={t("columns.changeAmount")}
                  startIcon={currencySymbol}
                  disabled={isPaidValue === false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                <AgentAccordion
                  control={control}
                  fullNameName="agent.name"
                  phoneNumberName="agent.phone_number"
                  title={t("columns.agent")}
                  fullNameLabel={t("columns.agentFullName")}
                  phoneNumberLabel={t("columns.phoneNumber")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <GlobalEmployeeAutocomplete
                  name="assignment_opr_guid"
                  control={control}
                  label={t("columns.operator")}
                  initialEmployee={row?.original?.ta_assignment_operator || row?.original?.assignment_operator}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <GlobalEmployeeAutocomplete
                  name="receiver_opr_guid"
                  control={control}
                  label={t("columns.operatorTwo")}
                  initialEmployee={row?.original?.ta_receiver_operator || row?.original?.receiver_operator}
                />
              </Grid>

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

export default EditTurkishAirlinesContent;
