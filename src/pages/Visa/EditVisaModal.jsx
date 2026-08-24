import { useMemo } from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";

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
import AgentAccordion from "../../components/global/AgentAccordion";
import CustomDatePicker from "../../components/CustomDatePicker";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { updateVisaApi } from "../../api/queries/patch";

const EditVisaModal = ({ table, row }) => {
  const { t, selectedLang } = useLocale();
  const { addVisa } = useValidShema();

  // Fetch employees list
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

  const statusOptions = useMemo(
    () => [
      { label: t("visa.statusPending"), value: "PENDING", color: "#d97706" },
      { label: t("visa.statusInProgress"), value: "IN_PROGRESS", color: "#2563eb" },
      { label: t("visa.statusApproved"), value: "APPROVED", color: "#16a34a" },
      { label: t("visa.statusRejected"), value: "REJECTED", color: "#dc2626" },
      { label: t("visa.statusCancelled"), value: "CANCELLED", color: "#64748b" },
      { label: t("visa.statusCompleted"), value: "COMPLETED", color: "#0d9488" },
    ],
    [t],
  );

  // Mutation to update Visa
  const { mutate: updateVisa, isPending: isSubmit } = useUpdate({
    apiFn: updateVisaApi,
    key: "visaApplications",
    idKey: "guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  // Form setup
  const { control, handleSubmit } = useForm({
    defaultValues: {
      guid: row?.original?.guid || null,
      index_number: row?.original?.index_number || "",
      datetime: row?.original?.datetime || dayjs().toISOString(),
      client_guid:
        row?.original?.client_guid || row?.original?.client?.guid || null,
      received_opr_guid:
        row?.original?.received_opr_guid ||
        row?.original?.received_opr?.guid ||
        row?.original?.receiver_operator?.guid ||
        row?.original?.receiver_opr_guid ||
        null,
      status: row?.original?.status || "PENDING",
      agent: {
        name: row?.original?.agent?.name || "",
        phone_number: row?.original?.agent?.phone_number || "",
      },
      price_tmt: row?.original?.price_tmt || 0,
      price_usd: row?.original?.price_usd || 0,
      note: row?.original?.note || "",
    },
    resolver: yupResolver(addVisa),
    mode: "onSubmit",
  });

  const closeDialog = () => {
    table.setEditingRow(null);
  };

  const submitHandler = (values) => {
    const payload = {
      ...values,
      status: values.status || "PENDING",
      price_tmt: Number(values.price_tmt || 0),
      price_usd: Number(values.price_usd || 0),
      agent:
        values.agent?.name || values.agent?.phone_number ? values.agent : null,
    };
    updateVisa(payload);
  };

  const autocompleteColumns = useMemo(
    () => ["fullName", "passport_number", "phone_number", "dateOfBirth"],
    [],
  );

  return (
    <CustomDialog widthX={860} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("sidebar.visaApplications")} />
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
              initialClient={row?.original?.client}
              required
            />
          </Box>

          <CustomTextField
            name="index_number"
            control={control}
            label={t("columns.sortOrder")}
            required
          />

          <CustomDatePicker
            name="datetime"
            control={control}
            label={t("columns.issueDate")}
            required
          />

          <CustomSelect
            name="received_opr_guid"
            control={control}
            label={t("columns.operatorTwo")}
            options={employeeOptions}
            required
          />

          <CustomSelect
            name="status"
            control={control}
            label={t("columns.visaStatus") || "Wiza ýagdaýy"}
            options={statusOptions}
            required
          />

          <CustomTextField
            name="price_tmt"
            control={control}
            type="number"
            label={`${t("price")} (TMT)`}
            endIcon="TMT"
          />

          <CustomTextField
            name="price_usd"
            control={control}
            type="number"
            label={`${t("price")} (USD)`}
            endIcon="USD"
          />

          <Box sx={{ gridColumn: "1 / -1" }}>
            <AgentAccordion
              control={control}
              fullNameName="agent.name"
              phoneNumberName="agent.phone_number"
              title={t("columns.agent")}
              fullNameLabel={t("columns.agentFullName")}
              phoneNumberLabel={t("b2b.agentPhoneNumber")}
            />
          </Box>

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

export default EditVisaModal;
