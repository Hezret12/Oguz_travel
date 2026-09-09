import { useMemo } from "react";
import { Box } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";

import { useLocale } from "../../hooks/useLocale";
import { useValidShema } from "../../functions/useValidShema";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import CustomTextField from "../../components/CustomTextField";
import FooterButton from "../../components/Dialog/FooterButton";
import GlobalClientAutocomplete from "../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import GlobalEmployeeAutocomplete from "../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import CurrencyAmount from "../../components/inputs/CurrencyAmount";
import PhoneNumberField from "../../components/inputs/PhoneNumber";
import CustomDatePicker from "../../components/CustomDatePicker";
import LabelWithTooltip from "../../components/LabelWithTooltip";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { addReferralLetterApi } from "../../api/queries/post";

const REFERRAL_CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "TMT", symbol: "m" },
];

const AddReferralLetterModal = ({ table }) => {
  const { t } = useLocale();
  const { addReferralLetter } = useValidShema();

  const { mutate: createReferralLetter, isPending: isSubmit } = useCreate({
    apiFn: addReferralLetterApi,
    key: "referralLetters",
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      datetime: dayjs().format("YYYY-MM-DD"),
      client_guid: null,
      application_number: null,
      received_opr_guid: null,
      agent: { name: null, phone_number: null },
      destination_country: null,
      tranzit: null,
      travel_document_number: null,
      departure_date: null,
      return_date: null,
      price: null,
      currency: "TMT",
      contract_number: null,
      contract_date: null,
      note: null,
    },
    resolver: yupResolver(addReferralLetter),
    mode: "onSubmit",
  });

  const selectedCurrency = useWatch({ control, name: "currency" }) || "TMT";

  const closeDialog = () => {
    table.setCreatingRow(null);
  };

  const submitHandler = (values) => {
    const formattedDate = values.datetime
      ? dayjs(values.datetime).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");

    createReferralLetter({
      ...values,
      datetime: values.datetime || formattedDate,
      date: formattedDate,
      price: Number(values.price || 0),
    });
  };

  const autocompleteColumns = useMemo(
    () => [
      "fullName",
      "gender",
      "dateOfBirth",
      { key: "passport_number", label: t("columns.passportNumber") },
    ],
    [t],
  );

  return (
    <CustomDialog widthX={860} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("referralLetter.add")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 2.5,
            mb: 2,
          }}
        >
          <Box
            sx={{
              gridColumn: "1 / -1",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 200px" },
              gap: 2.5,
              alignItems: "flex-start",
            }}
          >
            <GlobalClientAutocomplete
              control={control}
              name="client_guid"
              label={t("columns.client")}
              columns={autocompleteColumns}
            />
            <CustomDatePicker
              name="datetime"
              control={control}
              label={t("columns.date")}
              required
            />
          </Box>

          <GlobalEmployeeAutocomplete
            name="received_opr_guid"
            control={control}
            label={t("outbound.operator")}
            required
          />

          <CustomTextField
            name="destination_country"
            control={control}
            label={t("columns.destinationCountry")}
            required
          />

          <CustomTextField
            name="tranzit"
            control={control}
            label={t("columns.transit")}
          />

          <CustomDatePicker
            name="departure_date"
            control={control}
            label={t("columns.departureDate")}
            required
          />

          <CustomDatePicker
            name="return_date"
            control={control}
            label={t("columns.returnDate")}
            required
          />

          <CustomTextField
            name="travel_document_number"
            control={control}
            label={
              <LabelWithTooltip
                label={t("columns.syhNo", "S-ÝH №")}
                tooltip={t("referralLetter.travel_doc_tooltip")}
              />
            }
            required
          />

          <CurrencyAmount
            name="price"
            control={control}
            label={t("price")}
            currency={selectedCurrency}
            currencies={REFERRAL_CURRENCIES}
            onCurrencyChange={(curr) => setValue("currency", curr)}
            required
          />

          <CustomTextField
            name="contract_number"
            control={control}
            label={t("columns.contract_number")}
          />

          <CustomDatePicker
            name="contract_date"
            control={control}
            label={t("columns.contractDate")}
            required
          />

          <CustomTextField
            name="application_number"
            control={control}
            label={t("application_number")}
          />

          <CustomTextField
            name="agent.name"
            control={control}
            label={t("columns.agentFullName")}
          />

          <PhoneNumberField
            name="agent.phone_number"
            control={control}
            label={t("columns.phoneNumber")}
          />

          <Box sx={{ gridColumn: "1 / -1" }}>
            <CustomTextField
              name="note"
              control={control}
              label={t("columns.note")}
            />
          </Box>
        </Box>

        <FooterButton loading={isSubmit} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddReferralLetterModal;
