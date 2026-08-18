import { useMemo, useRef } from "react";
import { Box } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import GlobalAutoCompleteClient from "../../../../components/global/GlobalAutoCompleteClient/GlobalAutoCompleteClient";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import AgentAccordion from "../../../../components/global/AgentAccordion";
import AppAutocomplete from "../../../../components/AppAutocomplete";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import { useCreate } from "../../../../hooks/CRUD/useCreate";
import { addTurkishAirlinesApi } from "../../../../api/queries/post";
import { useGet } from "../../../../hooks/CRUD/useGet";
import {
  getAllEmployeeApi,
  getAllStatusApi,
  getAllOfficeApi,
} from "../../../../api/queries/getters";
import CurrencyAmount from "../../../../components/inputs/CurrencyAmount";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  TMT: "m",
  RUB: "₽",
};

const AddTurkishAirlinesContent = ({ table }) => {
  const { t, selectedLang } = useLocale();
  const { addTurkishAirlinesTicket } = useValidShema();
  const isAdjustedFareManualRef = useRef(false);

  const paymentOptions = useMemo(
    () => [
      { label: t("pages.ticket.payment.paid", "Tolendi"), value: true },
      { label: t("pages.ticket.payment.credit", "Kredit"), value: false },
    ],
    [t],
  );

  // Fetch status options from the API
  const {
    data: statusList,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useGet({
    apiFn: getAllStatusApi,
    key: "status",
  });

  // Fetch employee options from the API
  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const {
    data: offices = [],
    isLoading: isOfficeLoading,
    isError: isOfficeError,
  } = useGet({
    apiFn: getAllOfficeApi,
    key: "office",
  });

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
        return {
          label,
          value: emp.guid,
        };
      }),
    [employees, selectedLang],
  );

  const { mutate: createTurkishAirlines, isPending: isSubmit } = useCreate({
    apiFn: addTurkishAirlinesApi,
    key: "turkish-airlines",
    onSuccess: () => {
      closeDialog();
    },
  });

  const defaultValues = useMemo(() => {
    return {
      datetime: "",
      assignment_opr_guid: "",
      receiver_opr_guid: "",
      client_guid: "",
      milesSmiles: "",
      status_guid: "",
      pnr: "",
      ticket_number: "",
      route: "",
      class: "",
      flight_date: "",
      total_price: "",
      base_fare: "",
      quoted_price: "",
      accepted_price: "",
      returned_price: "",
      currency: "USD",
      is_paid: true,
      office_guid: "",
      agent: {
        name: "",
        phone_number: "",
      },
      note: "",
    };
  }, []);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues,
    resolver: yupResolver(addTurkishAirlinesTicket),
    mode: "onSubmit",
  });

  const selectedCurrency = useWatch({ control, name: "currency" }) || "USD";
  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency;
  const isPaidValue = useWatch({ control, name: "is_paid" });

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
      table.setCreatingRow(null);
    }
  };

  const submitHandler = async (data) => {
    try {
      const payload = {
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

      await createTurkishAirlines(payload);
    } catch (error) {
      console.error(error);
    }
  };

  const fieldItemSx = (span = 1) => ({
    gridColumn: {
      xs: "1 / -1",
      md: span === 2 ? "span 2" : "span 1",
      lg: span === 3 ? "span 3" : span === 2 ? "span 2" : "span 1",
    },
  });

  return (
    <CustomDialog widthX={1000} open={true} close={closeDialog}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CustomDialogHeader variant="h5" title={t("turkish.addTicket")} />

        <CustomForm handleSubmit={handleSubmit(submitHandler)}>
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              maxHeight: "calc(100vh - 310px)",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2.5,
              pr: 0.5,
            }}
          >
            <Box sx={fieldItemSx(3)}>
              <GlobalAutoCompleteClient
                control={control}
                name="client_guid"
                label={t("columns.client")}
                columns={[
                  "fullName",
                  "phone_number",
                  "passport_number",
                  "passportCountryOfIssue",
                  {
                    key: "passportExpiryDate",
                    label:
                      t("columns.passportExpiryDate") ?? "Passport Expiry Date",
                    format: (value) => {
                      if (!value) return "";
                      const dateOnly = value.split("T")[0];
                      const parts = dateOnly.split("-");
                      if (parts.length === 3) {
                        return `${parts[2]}.${parts[1]}.${parts[0]}`;
                      }
                      return dateOnly;
                    },
                  },
                ]}
              />
            </Box>

            <Box sx={fieldItemSx(3)}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                <CustomTextField
                  name="milesSmiles"
                  control={control}
                  label={t("columns.milesSmiles") ?? "MILES & SMILES"}
                />

                <CustomDatePicker
                  name="datetime"
                  control={control}
                  label={t("columns.issueDate")}
                />

                <CustomTextField
                  name="ticket_number"
                  control={control}
                  label={t("columns.ticketNo") ?? "TICKET #"}
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

                <CustomDatePicker
                  name="flight_date"
                  control={control}
                  label={t("columns.flightDate")}
                />

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

                <CustomTextField
                  name="class"
                  control={control}
                  label={t("columns.cabinClass") ?? "Class"}
                />

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
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.03)"
                          : "#ffffff",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      pr: 0.5,
                      "&:hover": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "#ffffff",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      },
                      "&.Mui-focused": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.02)"
                            : "#ffffff",
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

                <CustomTextField
                  name="total_price"
                  control={control}
                  type="number"
                  label={t("columns.total")}
                  onChange={handleTotalAmountChange}
                  startIcon={currencySymbol}
                />

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

                <CustomSelect
                  name="is_paid"
                  control={control}
                  label={t("columns.paymentStatus")}
                  options={paymentOptions}
                />

                <CustomTextField
                  name="accepted_price"
                  control={control}
                  type="number"
                  label={t("columns.accepted")}
                  startIcon={currencySymbol}
                  disabled={isPaidValue === false}
                />

                <CustomTextField
                  name="returned_price"
                  control={control}
                  type="number"
                  label={t("columns.changeAmount")}
                  startIcon={currencySymbol}
                  disabled={isPaidValue === false}
                />

                <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" } }}>
                  <AgentAccordion
                    control={control}
                    fullNameName="agent.name"
                    phoneNumberName="agent.phone_number"
                    title={t("columns.agent")}
                    fullNameLabel={t("columns.agentFullName")}
                    phoneNumberLabel={t("columns.phoneNumber")}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={fieldItemSx(3)}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                <AppAutocomplete
                  name="assignment_opr_guid"
                  control={control}
                  label={t("columns.operator")}
                  options={employeeOptions}
                />

                <AppAutocomplete
                  name="receiver_opr_guid"
                  control={control}
                  label={t("columns.operatorTwo")}
                  options={employeeOptions}
                />
              </Box>
            </Box>

            <Box sx={fieldItemSx(3)}>
              <CustomTextField
                name="note"
                control={control}
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

export default AddTurkishAirlinesContent;
