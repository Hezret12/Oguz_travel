import { useEffect, useMemo, useState } from "react";
import { Box, Tooltip } from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

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

const AddReferralLetterModal = ({ open, onClose, onSave, editItem }) => {
  const { t, selectedLang } = useLocale();
  const { addReferralLetter } = useValidShema();
  const [loading, setLoading] = useState(false);

  // Fetch employees list for receiver operator
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
        return {
          label,
          value: emp.guid,
        };
      }),
    [employees, selectedLang],
  );

  const paymentOptions = useMemo(
    () => [
      { label: t("pages.ticket.payment.paid", "Tolendi"), value: true },
      { label: t("pages.ticket.payment.credit", "Kredit"), value: false },
    ],
    [t],
  );

  const defaultValues = useMemo(
    () => ({
      client_guid: editItem?.client_guid ?? "",
      application_number: editItem?.application_number ?? "",
      received_opr_guid: editItem?.received_opr_guid ?? "",
      agent: {
        name: editItem?.agent?.name ?? editItem?.agent ?? "",
        phone_number: editItem?.agent?.phone_number ?? editItem?.agentTel ?? "",
      },
      destination_country: editItem?.destination_country ?? "",
      tranzit: editItem?.tranzit ?? "",
      travel_document_number: editItem?.travel_document_number ?? "",
      departure_date: editItem?.departure_date ?? "",
      return_date: editItem?.return_date ?? "",
      price: editItem?.price ?? "",
      currency: editItem?.currency ?? "USD",
      is_paid: editItem?.is_paid ?? true,
      contract_number: editItem?.contract_number ?? "",
      contract_date: editItem?.contract_date ?? "",
      note: editItem?.note ?? "",
    }),
    [editItem],
  );

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues,
    resolver: yupResolver(addReferralLetter),
    mode: "onSubmit",
  });

  const selectedCurrency = watch("currency") || "USD";

  const applyClientToForm = (client) => {
    let firstName = client?.name || "";
    let lastName = client?.surname || "";
    if (!firstName && !lastName && client?.fullName) {
      const parts = client.fullName.trim().split(/\s+/);
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }
    setValue("name", firstName, { shouldDirty: true, shouldValidate: true });
    setValue("surname", lastName, { shouldDirty: true, shouldValidate: true });
    setValue("yolagcyTel", client?.phone_number || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("gender", client?.gender || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(
      "dateOfBirth",
      client?.dateOfBirth ? client.dateOfBirth.split("T")[0] : "",
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    setValue("passportNumber", client?.passport_number || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  const closeDialog = () => {
    onClose?.();
    reset(defaultValues);
  };

  const submitHandler = async (values) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 250));

      const selectedEmployee = employees.find(
        (emp) => emp.guid === values.received_opr_guid,
      );
      const operatorName = selectedEmployee ? selectedEmployee.fullName : "";
      const officeName =
        selectedEmployee?.office?.name ||
        selectedEmployee?.office?.fullName ||
        "";

      onSave?.({
        ...values,
        price: Number(values.price || 0),
        operator: operatorName || values.operator,
        ofis: officeName || values.ofis,
      });

      toast.success(
        editItem
          ? t(
            "pages.referralLetter.editSuccess",
            "Referral updated successfully!",
          )
          : t(
            "pages.referralLetter.addSuccess",
            "Referral added successfully!",
          ),
      );
      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error(
        t(
          "pages.referralLetter.addError",
          "An error occurred while saving referral.",
        ),
      );
    } finally {
      setLoading(false);
    }
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
    <CustomDialog widthX={860} open={open} close={closeDialog}>
      <CustomDialogHeader
        variant="h5"
        title={
          editItem
            ? t("pages.referralLetter.edit")
            : t("pages.referralLetter.add")
        }
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
              label={t("columns.client") ?? "Client"}
              placeholder={
                t("pages.clients.autocomplete.clientPlaceholder") ??
                "Search client..."
              }
              columns={autocompleteColumns}
              onClientChange={applyClientToForm}
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

          <CustomSelect
            name="is_paid"
            control={control}
            label={t("columns.paymentStatus")}
            options={paymentOptions}
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

        <FooterButton loading={loading} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddReferralLetterModal;
