import { useMemo } from "react";
import { Box } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useLocale } from "../../hooks/useLocale";
import { useValidShema } from "../../functions/useValidShema";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import FooterButton from "../../components/Dialog/FooterButton";
import GlobalClientAutocomplete from "../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import { useGet } from "../../hooks/CRUD/useGet";
import { getAllEmployeeApi } from "../../api/queries/getters";
import CurrencyAmount from "../../components/inputs/CurrencyAmount";
import AgentAccordion from "../../components/global/AgentAccordion";
import CustomDatePicker from "../../components/CustomDatePicker";
import LabelWithTooltip from "../../components/LabelWithTooltip";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { updateReferralLetterApi } from "../../api/queries/patch";


const EditReferralLetterModal = ({ table, row }) => {
  const { t, selectedLang } = useLocale();
  const { addReferralLetter } = useValidShema();

  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
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
        return { label, value: emp.guid };
      }),
    [employees, selectedLang],
  );

  const { mutate: updateReferralLetter, isPending: isSubmit } = useUpdate({
    apiFn: updateReferralLetterApi,
    key: "referralLetters",
    idKey: "guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      guid: row?.original?.guid || "",
      client_guid: row?.original?.client_guid || row?.original?.client?.guid || "",
      application_number: row?.original?.application_number || "",
      received_opr_guid: row?.original?.received_opr_guid || "",
      agent: {
        name: row?.original?.agent?.name || "",
        phone_number: row?.original?.agent?.phone_number || "",
      },
      destination_country: row?.original?.destination_country || "",
      tranzit: row?.original?.tranzit || "",
      travel_document_number: row?.original?.travel_document_number || "",
      departure_date: row?.original?.departure_date || "",
      return_date: row?.original?.return_date || "",
      price:
        row?.original?.price !== undefined
          ? String(row.original.price)
          : "",
      currency: row?.original?.currency || "TMT",
      contract_number: row?.original?.contract_number || "",
      contract_date: row?.original?.contract_date || "",
      note: row?.original?.note || "",
    },
    resolver: yupResolver(addReferralLetter),
    mode: "onSubmit",
  });

  const selectedCurrency = useWatch({ control, name: "currency" }) || "TMT";

  const closeDialog = () => {
    table.setEditingRow(null);
  };

  const submitHandler = (values) => {
    updateReferralLetter({
      ...values,
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
      <CustomDialogHeader
        variant="h5"
        title={t("referralLetter.edit")}
      />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 2.5,
            mb: 2,
          }}
        >
          <Box sx={{ gridColumn: "1 / -1" }}>
            <GlobalClientAutocomplete
              control={control}
              name="client_guid"
              label={t("columns.client")}
              columns={autocompleteColumns}
            />
          </Box>

          <CustomSelect
            name="received_opr_guid"
            control={control}
            label={t("columns.operatorTwo")}
            options={employeeOptions}
            required
          />

          <CustomTextField
            name="application_number"
            control={control}
            label={t("application_number")}
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
                tooltip={t("pages.referralLetter.travel_doc_tooltip")}
              />
            }
          />

          <CurrencyAmount
            name="price"
            control={control}
            label={t("price")}
            currency={selectedCurrency}
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

          <AgentAccordion
            control={control}
            fullNameName="agent.name"
            phoneNumberName="agent.phone_number"
            title={t("columns.agent")}
            fullNameLabel={t("columns.agentFullName")}
            phoneNumberLabel={t("b2b.agentPhoneNumber")}
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

export default EditReferralLetterModal;
