import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import GlobalClientAutocomplete from "../../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import CurrencyAmount from "../../../../components/inputs/CurrencyAmount";
import FooterButton from "../../../../components/Dialog/FooterButton";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import AgentAccordion from "../../../../components/global/AgentAccordion";
import {
  TURKISH_AIRLINES_OPERATOR_OPTIONS,
  TURKISH_AIRLINES_OP2_OPTIONS,
} from "../options";

const STATUS_OPTIONS = [
  { label: "Sale", value: "SALE" },
  { label: "Reissue", value: "REISSUE" },
  { label: "Refund", value: "REFUND" },
  { label: "Void", value: "VOID" },
  { label: "Voided Sale", value: "VOIDED SALE" },
];

const cabinLabel = "Class";

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const buildCurrencyAmountValue = (value, fallbackCurrency = "USD") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      total: value.total ?? value.amount ?? "",
      currency: value.currency ?? fallbackCurrency,
    };
  }

  return {
    total: value ?? "",
    currency: fallbackCurrency,
  };
};

const findPairSelection = (options, first, second) => {
  const targetLabel = `${normalizeText(first)} | ${normalizeText(second)}`;
  return (
    options.find((option) => normalizeText(option.label) === targetLabel)
      ?.value ?? ""
  );
};

const splitPairSelection = (options, selection) => {
  const option = options.find((item) => item.value === selection);
  if (!option) return { first: "", second: "" };

  const [first = "", second = ""] = option.label.split(" | ");
  return {
    first: first.trim(),
    second: second.trim(),
  };
};

const AddTurkishAirlinesContent = ({ open, onClose, onSave, ticket }) => {
  const { t } = useLocale();
  const { addTurkishAirlinesTicket } = useValidShema();
  const [loading, setLoading] = useState(false);
  const isAdjustedFareManualRef = useRef(false);

  const defaultValues = useMemo(() => {
    const currentTicket = ticket ?? {};

    return {
      clientId: currentTicket.clientId ?? "",
      fullName: currentTicket.fullName ?? currentTicket.clientName ?? "",
      phoneNumber: currentTicket.phoneNumber ?? "",
      dateOfBirth: currentTicket.dateOfBirth ?? "",
      passportNumber: currentTicket.passportNumber ?? "",
      passportCountryOfIssue: currentTicket.passportCountryOfIssue ?? "",
      passportExpiryDate: currentTicket.passportExpiryDate ?? "",
      milesAndSmiles: currentTicket.milesAndSmiles ?? "",
      date: currentTicket.date ?? currentTicket.issueDate ?? "",
      operatorSelection:
        currentTicket.operatorSelection ??
        findPairSelection(
          TURKISH_AIRLINES_OPERATOR_OPTIONS,
          currentTicket.operator,
          currentTicket.office,
        ),
      operatorTwoSelection:
        currentTicket.operatorTwoSelection ??
        findPairSelection(
          TURKISH_AIRLINES_OP2_OPTIONS,
          currentTicket.operatorTwo,
          currentTicket.operatorTwoOffice,
        ),
      agentFullName: currentTicket.agentFullName ?? currentTicket.agent ?? "",
      agentPhoneNumber: currentTicket.agentPhoneNumber ?? "",
      status: currentTicket.status ?? "SALE",
      pnr: currentTicket.pnr ?? "",
      ticketNo: currentTicket.ticketNo ?? "",
      route: currentTicket.route ?? "",
      cabinClass: currentTicket.cabinClass ?? "",
      flightDate: currentTicket.flightDate ?? "",
      totalAmount: currentTicket.totalAmount ?? currentTicket.totalFare ?? "",
      baseFare: buildCurrencyAmountValue(
        currentTicket.baseFare,
        currentTicket.baseFareCurrency ?? "USD",
      ),
      adjustedFare: currentTicket.adjustedFare ?? "",
      receivedAmount: currentTicket.receivedAmount ?? "",
      returnedAmount: currentTicket.returnedAmount ?? "",
      cashier: currentTicket.cashier ?? "",
      note: currentTicket.note ?? "",
    };
  }, [ticket]);

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues,
    resolver: yupResolver(addTurkishAirlinesTicket),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      isAdjustedFareManualRef.current = false;
    }
  }, [open, defaultValues, reset]);

  const handleTotalAmountChange = (event) => {
    const nextValue = event?.target?.value ?? event ?? "";
    setValue("totalAmount", nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (isAdjustedFareManualRef.current) {
      return;
    }

    if (nextValue === "") {
      setValue("adjustedFare", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const numericTotal = Number(nextValue);
    if (!Number.isFinite(numericTotal)) {
      return;
    }

    setValue("adjustedFare", Math.round(numericTotal), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const closeDialog = () => {
    onClose?.();
    reset(defaultValues);
  };

  const applyClientToForm = (client) => {
    setValue("clientId", client?.id ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("fullName", client?.fullName ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("phoneNumber", client?.phoneNumber ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("dateOfBirth", client?.dateOfBirth ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("passportNumber", client?.passportNumber ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("passportCountryOfIssue", client?.passportCountryOfIssue ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("passportExpiryDate", client?.passportExpiryDate ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const operatorPair = splitPairSelection(
        TURKISH_AIRLINES_OPERATOR_OPTIONS,
        data.operatorSelection,
      );
      const operatorTwoPair = splitPairSelection(
        TURKISH_AIRLINES_OP2_OPTIONS,
        data.operatorTwoSelection,
      );

      const payload = {
        ...data,
        operator: operatorPair.first,
        office: operatorPair.second,
        operatorTwo: operatorTwoPair.first,
        operatorTwoOffice: operatorTwoPair.second,
        agent: data.agentFullName?.trim() ?? "",
        fullName: data.fullName?.trim() ?? "",
        phoneNumber: data.phoneNumber?.trim() ?? "",
        dateOfBirth: data.dateOfBirth ?? "",
        passportNumber: data.passportNumber?.trim() ?? "",
        passportCountryOfIssue: data.passportCountryOfIssue?.trim() ?? "",
        passportExpiryDate: data.passportExpiryDate ?? "",
        milesAndSmiles: data.milesAndSmiles?.trim() ?? "",
        totalAmount: Number(data.totalAmount || 0),
        baseFare: {
          total: Number(data.baseFare?.total || 0),
          currency: data.baseFare?.currency || "USD",
        },
        adjustedFare: Number(data.adjustedFare || 0),
        receivedAmount: Number(data.receivedAmount || 0),
        returnedAmount: Number(data.returnedAmount || 0),
      };

      delete payload.operatorSelection;
      delete payload.operatorTwoSelection;

      onSave?.(payload);
      toast.success("Turkish Airlines ticket saved successfully!");
      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving Turkish Airlines ticket.");
    } finally {
      setLoading(false);
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
    <CustomDialog widthX={1000} open={open} close={closeDialog}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CustomDialogHeader
          variant="h5"
          title={
            ticket
              ? "Edit Turkish Airlines Ticket"
              : "Add Turkish Airlines Ticket"
          }
        />

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
            }}
          >
            <Box sx={fieldItemSx(3)}>
              <GlobalClientAutocomplete
                control={control}
                name="clientId"
                label={t("columns.client") ?? "Client"}
                placeholder={
                  t("columns.clientPlaceholder") ?? "Search client..."
                }
                onClientChange={applyClientToForm}
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
                  name="milesAndSmiles"
                  control={control}
                  label="MILES & SMILES"
                />
                {/*
                  FIX: `InputLabelProps` is deprecated on MUI v6 TextField
                  in favor of `slotProps={{ inputLabel: {...} }}`.
                  If your CustomTextField forwards unknown props directly
                  to <TextField>, MUI logs a deprecation warning here.
                  Kept both patterns commented so you can pick based on
                  your installed MUI version.
                */}
                <CustomTextField
                  name="date"
                  control={control}
                  type="date"
                  label={t("columns.issueDate")}
                  slotProps={{ inputLabel: { shrink: true } }}
                  // If your MUI version is < 6, use this instead:
                  // InputLabelProps={{ shrink: true }}
                />
                <CustomTextField
                  name="ticketNo"
                  control={control}
                  label="TICKET #"
                />
                <CustomTextField name="pnr" control={control} label="PNR" />
                <CustomTextField name="route" control={control} label="Route" />
                <CustomTextField
                  name="flightDate"
                  control={control}
                  type="date"
                  label={t("columns.flightDate")}
                  slotProps={{ inputLabel: { shrink: true } }}
                  // InputLabelProps={{ shrink: true }}
                />
                <CustomSelect
                  name="status"
                  control={control}
                  label="STATUS"
                  options={STATUS_OPTIONS}
                />
                <CustomTextField
                  name="cabinClass"
                  control={control}
                  label={cabinLabel}
                />
                <CustomTextField
                  name="cashier"
                  control={control}
                  label={t("columns.cashier")}
                />
                <CurrencyAmount
                  name="baseFare"
                  control={control}
                  label={t("columns.baseFare")}
                />
                <CustomTextField
                  name="totalAmount"
                  control={control}
                  type="number"
                  label={t("columns.total")}
                  onChange={handleTotalAmountChange}
                />
                <CustomTextField
                  name="adjustedFare"
                  control={control}
                  type="number"
                  label="AYDYLAN BAHA"
                  onChange={() => {
                    isAdjustedFareManualRef.current = true;
                  }}
                />
              </Box>

              <Grid sx={{ mt: 2 }} container spacing={2}>
                <Grid size={3}>
                  <CustomTextField
                    name="receivedAmount"
                    control={control}
                    type="number"
                    label={t("columns.accepted")}
                  />
                </Grid>
                <Grid size={3}>
                  <CustomTextField
                    name="returnedAmount"
                    control={control}
                    type="number"
                    label={t("columns.changeAmount")}
                  />
                </Grid>
                <Grid size={6}>
                  <CustomSelect
                    name="operatorSelection"
                    control={control}
                    label={t("columns.operator")}
                    options={TURKISH_AIRLINES_OPERATOR_OPTIONS}
                  />
                </Grid>
              </Grid>
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
                <AgentAccordion
                  control={control}
                  title="Agent"
                  fullNameLabel={t("columns.agentFullName")}
                  phoneNumberLabel={t("columns.agentPhoneNumber")}
                />
                <CustomSelect
                  name="operatorTwoSelection"
                  control={control}
                  label={t("columns.operatorTwo")}
                  options={TURKISH_AIRLINES_OP2_OPTIONS}
                />
              </Box>
            </Box>

            <Box sx={fieldItemSx(3)}>
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

export default AddTurkishAirlinesContent;
