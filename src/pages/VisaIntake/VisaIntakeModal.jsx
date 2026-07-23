import { useMemo } from "react";
import { Grid } from "@mui/material";
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
import GlobalClientAutocomplete from "../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { useGet } from "../../hooks/CRUD/useGet";
import {
  addVisaIntakeApi,
  updateVisaIntakeApi,
} from "../../api/queries/visaIntakeApi";
import { getAllEmployeeApi } from "../../api/queries/getters";
import {
  VISA_COUNTRY_CONFIGS,
  VISA_FIELD_DEFS,
  VISA_SELECT_OPTIONS,
} from "../../functions/visaCountryFieldConfigs";

// ─── Build default values from the superset fields for a given country ────────
const buildDefaults = (country, row) => {
  const config = VISA_COUNTRY_CONFIGS[country];
  if (!config) return {};

  const defaults = { country };
  config.fields.forEach((key) => {
    const def = VISA_FIELD_DEFS[key];
    if (!def) return;

    if (row) {
      // Edit mode — pre-fill from row data per AGENTS.md §8
      if (key === "client_guid") {
        defaults[key] = row.original?.client_guid || row.original?.client?.guid || "";
      } else {
        const val = row.original?.[key];
        if (def.type === "date") {
          defaults[key] = val ? dayjs(val).format("YYYY-MM-DD") : null;
        } else {
          defaults[key] = val ?? (def.type === "number" ? null : "");
        }
      }
    } else {
      // Add mode — sensible defaults
      if (key === "application_date") {
        defaults[key] = dayjs().format("YYYY-MM-DD");
      } else if (def.type === "date") {
        defaults[key] = null;
      } else if (def.type === "number") {
        defaults[key] = null;
      } else {
        defaults[key] = "";
      }
    }
  });

  return defaults;
};

// ─── DynamicVisaField: renders the right input per field key ──────────────────
const DynamicVisaField = ({ fieldKey, control, t, employeeOptions, initialClient }) => {
  const def = VISA_FIELD_DEFS[fieldKey];
  if (!def) return null;

  const label = t(def.labelKey) || fieldKey;
  const gridSize = def.gridSize || 4;

  // GlobalClientAutocomplete for client selection
  if (def.type === "client_autocomplete" || fieldKey === "client_guid") {
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

  // Date fields
  if (def.type === "date") {
    return (
      <Grid size={gridSize}>
        <CustomDatePicker
          name={fieldKey}
          control={control}
          label={label}
        />
      </Grid>
    );
  }

  // Number fields
  if (def.type === "number") {
    return (
      <Grid size={gridSize}>
        <CustomTextField
          name={fieldKey}
          control={control}
          label={label}
          type="number"
        />
      </Grid>
    );
  }

  // Select fields (static options)
  if (def.type === "select") {
    const options = VISA_SELECT_OPTIONS[def.optionsKey] || [];
    return (
      <Grid size={gridSize}>
        <CustomSelect
          name={fieldKey}
          control={control}
          label={label}
          options={options}
        />
      </Grid>
    );
  }

  // Autocomplete fields (employees)
  if (def.type === "autocomplete") {
    return (
      <Grid size={gridSize}>
        <CustomSelect
          name={fieldKey}
          control={control}
          label={label}
          options={employeeOptions}
        />
      </Grid>
    );
  }

  // Text fields (default)
  return (
    <Grid size={gridSize}>
      <CustomTextField
        name={fieldKey}
        control={control}
        label={label}
        multiline={def.multiline || false}
        rows={def.rows || 1}
      />
    </Grid>
  );
};

// ─── Modal Component ──────────────────────────────────────────────────────────
const VisaIntakeModal = ({ mode = "add", table, row, country }) => {
  const { t, selectedLang } = useLocale();
  const isEdit = mode === "edit";

  const config = VISA_COUNTRY_CONFIGS[country];
  const fieldKeys = config?.fields || [];

  // Initial client object for GlobalClientAutocomplete in edit mode
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

  // Fetch employee options
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

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: buildDefaults(country, isEdit ? row : null),
  });

  const closeModal = () => {
    if (isEdit) {
      table.setEditingRow(null);
    } else {
      table.setCreatingRow(null);
    }
  };

  // CRUD hooks — correct param names per AGENTS.md §1
  const { mutate: createIntake, isPending: isCreating } = useCreate({
    apiFn: addVisaIntakeApi,
    key: ["visa-intake", country],
    onSuccess: closeModal,
  });

  const { mutate: updateIntake, isPending: isUpdating } = useUpdate({
    apiFn: updateVisaIntakeApi,
    key: ["visa-intake", country],
    idKey: "guid",
    onSuccessUpdate: closeModal,
  });

  const onSubmit = (data) => {
    // Normalize date fields to YYYY-MM-DD strings
    const payload = { ...data, country };
    fieldKeys.forEach((key) => {
      const def = VISA_FIELD_DEFS[key];
      if (def?.type === "date" && payload[key]) {
        payload[key] = dayjs(payload[key]).format("YYYY-MM-DD");
      }
      if (def?.type === "number" && payload[key] !== null && payload[key] !== "") {
        payload[key] = Number(payload[key]);
      }
    });

    if (isEdit) {
      updateIntake({ ...payload, guid: row.original.guid });
    } else {
      createIntake(payload);
    }
  };

  const title = isEdit
    ? t("visaIntake.editApplication") || "Arzany üýtgetmek"
    : t("visaIntake.addApplication") || "Arza goşmak";

  return (
    <CustomDialog open={true} close={closeModal} widthX={800}>
      <CustomDialogHeader variant="h5" title={title} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {fieldKeys.map((key) => (
            <DynamicVisaField
              key={key}
              fieldKey={key}
              control={control}
              t={t}
              employeeOptions={employeeOptions}
              initialClient={initialClient}
            />
          ))}
        </Grid>

        <FooterButton
          loading={isSubmitting || isCreating || isUpdating}
          onCancel={closeModal}
          type="submit"
          sx={{ mt: 3 }}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default VisaIntakeModal;
