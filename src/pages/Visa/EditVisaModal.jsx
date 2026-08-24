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
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      guid: row?.original?.guid || null,
      index_number: row?.original?.index_number || "",
      datetime: row?.original?.datetime || dayjs().toISOString(),
      client_guid:
        row?.original?.client_guid || row?.original?.client?.guid || null,
      received_opr_guid: row?.original?.received_opr_guid || null,
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
      price_tmt: Number(values.price_tmt || 0),
      price_usd: Number(values.price_usd || 0),
      agent:
        values.agent?.name || values.agent?.phone_number ? values.agent : null,
    };
    updateVisa(payload);
  };

  const autocompleteColumns = useMemo(
    () => [
      "fullName",
      "phone_number",
      { key: "passport_number", label: t("columns.passportNumber") },
      { key: "dateOfBirth", label: t("columns.dateOfBirth") },
    ],
    [t],
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
            label={t("columns.dateTime")}
            showTime={true}
            required
          />

          <CustomSelect
            name="received_opr_guid"
            control={control}
            label={t("columns.operatorTwo")}
            options={employeeOptions}
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

          <Box sx={{ gridColumn: "span 2" }}>
            <AgentAccordion
              control={control}
              fullNameName="agent.name"
              phoneNumberName="agent.phone_number"
              inline
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
