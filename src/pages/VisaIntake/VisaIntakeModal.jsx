import { useMemo } from "react";
import { Grid, CircularProgress, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useLocale } from "../../hooks/useLocale";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import FooterButton from "../../components/Dialog/FooterButton";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import CustomDatePicker from "../../components/CustomDatePicker";
import AppAutocomplete from "../../components/AppAutocomplete";
import GlobalClientAutocomplete from "../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import { useGet } from "../../hooks/CRUD/useGet";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { addVisaApi } from "../../api/queries/post";
import { updateVisaApi } from "../../api/queries/patch";
import {
  getAllEmployeeApi,
  getAllOfficeApi,
  getCountryVisaFieldsApi,
} from "../../api/queries/getters";
import {
  sortVisaFields,
  isOperatorField,
  isOperator2Field,
  isClientField,
  isNotesField,
} from "../../functions/visaCountryFieldConfigs";

const DynamicVisaField = ({
  field,
  control,
  selectedLang,
  initialClient,
  employeeOptions = [],
}) => {
  const { t } = useLocale();
  const fieldKey = field.fieldKey;
  const label = selectedLang(field.labelTm) || field.labelTm || fieldKey;

  if (fieldKey === "client_guid") {
    return (
      <Grid size={12}>
        <GlobalClientAutocomplete
          name="client_guid"
          control={control}
          columns={["fullName", "phone_number", "passport_number"]}
          initialClient={initialClient}
          required
        />
      </Grid>
    );
  }

  if (fieldKey === "notes" || field.multiline) {
    return (
      <Grid size={12}>
        <CustomTextField
          name={fieldKey}
          control={control}
          label={label}
          multiline
          rows={field.rows || 2}
        />
      </Grid>
    );
  }

  if (fieldKey === "accepted_opr_guid" || fieldKey === "received_opr_guid") {
    const isAccepted = fieldKey === "accepted_opr_guid";
    return (
      <Grid size={{ xs: 12, sm: 6 }}>
        <AppAutocomplete
          name={fieldKey}
          control={control}
          label={isAccepted ? t("columns.operator") : t("columns.operatorTwo")}
          options={employeeOptions}
        />
      </Grid>
    );
  }

  if (field.fieldType === "date") {
    return (
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomDatePicker name={fieldKey} control={control} label={label} />
      </Grid>
    );
  }

  if (field.fieldType === "number") {
    return (
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomTextField
          name={fieldKey}
          control={control}
          label={label}
          type="number"
        />
      </Grid>
    );
  }

  if (field.fieldType === "select") {
    const rawOptions = field.options || [];
    const options = rawOptions.map((opt) => ({
      label: typeof opt === "object" ? opt.label : String(opt),
      value: typeof opt === "object" ? opt.value : String(opt),
    }));

    return (
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomSelect
          name={fieldKey}
          control={control}
          label={label}
          options={options}
        />
      </Grid>
    );
  }

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <CustomTextField name={fieldKey} control={control} label={label} />
    </Grid>
  );
};

const VisaIntakeModal = ({
  mode = "add",
  table,
  row,
  country,
  countryGuid,
}) => {
  const { t, selectedLang } = useLocale();
  const isEdit = mode === "edit";

  const { data: apiFields = [], isLoading: fieldsLoading } = useGet({
    apiFn: () =>
      countryGuid ? getCountryVisaFieldsApi(countryGuid) : Promise.resolve([]),
    key: ["countryVisaFields", countryGuid],
    options: { enabled: Boolean(countryGuid) },
  });

  const rawApiFields = useMemo(
    () => (Array.isArray(apiFields) ? apiFields : []),
    [apiFields],
  );
  const fields = useMemo(() => sortVisaFields(rawApiFields), [rawApiFields]);

  const modalFields = useMemo(() => {
    const filtered = fields.filter(
      (f) => f.fieldKey !== "birth_date" && f.fieldKey !== "passport_number",
    );

    const clientField = filtered.find(
      (f) => f.fieldKey === "client_guid" || isClientField(f),
    );
    const op1Field = filtered.find(
      (f) => f.fieldKey === "operator_guid" || isOperatorField(f),
    );
    const op2Field = filtered.find(
      (f) => f.fieldKey === "operator2_guid" || isOperator2Field(f),
    );
    const appDateField = filtered.find(
      (f) => f.fieldKey === "application_date" || f.fieldKey === "date",
    );
    const notesField = filtered.find(
      (f) => f.fieldKey === "notes" || f.fieldKey === "note" || isNotesField(f),
    );

    const excludeSet = new Set(
      [
        clientField?.fieldKey,
        op1Field?.fieldKey,
        op2Field?.fieldKey,
        appDateField?.fieldKey,
        notesField?.fieldKey,
        "client_guid",
        "operator_guid",
        "operator2_guid",
        "application_date",
        "notes",
      ].filter(Boolean),
    );

    const middleFields = filtered.filter((f) => !excludeSet.has(f.fieldKey));

    const result = [];
    if (clientField) result.push(clientField);
    if (op1Field) result.push(op1Field);
    if (op2Field) result.push(op2Field);
    result.push(...middleFields);
    if (appDateField) result.push(appDateField);
    if (notesField) result.push(notesField);

    return result;
  }, [fields]);

  const initialClient = useMemo(() => {
    if (!isEdit || !row?.original) return null;
    if (row.original.client) return row.original.client;
    if (row.original.client_guid) {
      return {
        guid: row.original.client_guid,
        fullName: row.original.client_full_name || "",
        phone_number: row.original.client_phone || "",
        passport_number: row.original.passport_number || "",
      };
    }
    return null;
  }, [isEdit, row]);

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

  const { data: rawOffices = [] } = useGet({
    apiFn: getAllOfficeApi,
    key: "offices",
  });

  const officeOptions = useMemo(
    () =>
      (Array.isArray(rawOffices) ? rawOffices : []).map((off) => ({
        label:
          selectedLang(off.shortName) ||
          off.shortName ||
          selectedLang(off.fullName) ||
          off.fullName,
        value: off.guid,
      })),
    [rawOffices, selectedLang],
  );

  const defaultValues = useMemo(() => {
    const rowData = row?.original;
    const defaults = { countryGuid, countryName: country };

    modalFields.forEach((field) => {
      const key = field.fieldKey;
      if (isEdit && rowData) {
        let val = rowData[key] ?? rowData.customFields?.[key];
        if (key === "accepted_opr_guid") {
          val = rowData.accepted_opr_guid || rowData.accepted_operator?.guid || val;
        } else if (key === "received_opr_guid") {
          val = rowData.received_opr_guid || rowData.receiver_operator?.guid || val;
        }
        defaults[key] =
          field.fieldType === "date"
            ? val
              ? dayjs(val).format("YYYY-MM-DD")
              : null
            : (val ?? (field.fieldType === "number" ? null : ""));
      } else {
        defaults[key] =
          key === "application_date"
            ? dayjs().format("YYYY-MM-DD")
            : field.fieldType === "date" || field.fieldType === "number"
              ? null
              : "";
      }
    });

    return defaults;
  }, [countryGuid, country, modalFields, isEdit, row?.original]);

  const { control, handleSubmit } = useForm({ defaultValues });

  const closeModal = () => {
    if (isEdit) {
      table.setEditingRow(null);
    } else {
      table.setCreatingRow(null);
    }
  };

  const { mutate: createIntake, isPending: isCreating } = useCreate({
    apiFn: addVisaApi,
    key: ["visa-intake", countryGuid || country],
    onSuccess: closeModal,
  });

  const { mutate: updateIntake, isPending: isUpdating } = useUpdate({
    apiFn: updateVisaApi,
    key: ["visa-intake", countryGuid || country],
    idKey: "guid",
    onSuccessUpdate: closeModal,
  });

  const onSubmit = (data) => {
    const customFields = {};
    modalFields.forEach((field) => {
      const key = field.fieldKey;
      let val = data[key];
      if (field.fieldType === "date" && val) {
        val = dayjs(val).format("YYYY-MM-DD");
      }
      if (field.fieldType === "number" && val !== null && val !== "") {
        val = Number(val);
      }
      customFields[key] = val;
    });

    const payload = {
      countryGuid,
      applicantName: data.client_guid || "",
      accepted_opr_guid: data.accepted_opr_guid || "",
      received_opr_guid: data.received_opr_guid || "",
      customFields,
      ...data,
    };

    if (isEdit) {
      updateIntake({ ...payload, guid: row.original.guid });
    } else {
      createIntake(payload);
    }
  };

  const title = isEdit
    ? t("visaIntake.editApplication")
    : t("visaIntake.addApplication");

  return (
    <CustomDialog open={true} close={closeModal} widthX={800}>
      <CustomDialogHeader variant="h5" title={title} />
      {fieldsLoading ? (
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <CustomForm onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {modalFields.map((field) => (
              <DynamicVisaField
                key={field.guid || field.fieldKey}
                field={field}
                control={control}
                selectedLang={selectedLang}
                employeeOptions={employeeOptions}
                officeOptions={officeOptions}
                initialClient={initialClient}
              />
            ))}
          </Grid>

          <FooterButton
            loading={isSubmitting || isCreating || isUpdating}
            onCancel={closeModal}
            type="submit"
          />
        </CustomForm>
      )}
    </CustomDialog>
  );
};

export default VisaIntakeModal;
