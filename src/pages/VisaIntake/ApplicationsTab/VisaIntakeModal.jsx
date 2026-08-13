import { useMemo } from "react";
import { Grid, CircularProgress, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import CustomDatePicker from "../../../components/CustomDatePicker";
import AppAutocomplete from "../../../components/AppAutocomplete";
import GlobalClientAutocomplete from "../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { addReceivingApi } from "../../../api/queries/post";
import { updateReceivingApi } from "../../../api/queries/patch";
import {
  getAllEmployeeApi,
  getCountryVisaFieldsApi,
} from "../../../api/queries/getters";
import {
  sortVisaFields,
  isOperatorField,
  isOperator2Field,
  isClientField,
  isNotesField,
} from "../../../functions/visaCountryFieldConfigs";

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

  if (fieldKey === "note" || field.multiline) {
    return (
      <Grid size={12}>
        <CustomTextField
          name={fieldKey}
          control={control}
          label={label}
          multiline
          rows={3}
        />
      </Grid>
    );
  }

  if (isOperatorField(fieldKey) || isOperator2Field(fieldKey)) {
    return (
      <Grid size={{ xs: 12, sm: 6 }}>
        <AppAutocomplete
          name={fieldKey}
          control={control}
          label={label}
          options={employeeOptions}
        />
      </Grid>
    );
  }

  if (field.fieldType === "select" && Array.isArray(field.options)) {
    const opts = field.options.map((opt) => ({
      label: typeof opt === "string" ? opt : opt.label,
      value: typeof opt === "string" ? opt : opt.value,
    }));
    return (
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          name={fieldKey}
          control={control}
          label={label}
          options={opts}
          required={field.is_required}
        />
      </Grid>
    );
  }

  if (field.fieldType === "date") {
    return (
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomDatePicker
          name={fieldKey}
          control={control}
          label={label}
          required={field.is_required}
        />
      </Grid>
    );
  }

  if (field.fieldType === "number") {
    return (
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomTextField
          name={fieldKey}
          control={control}
          label={label}
          type="number"
          required={field.is_required}
        />
      </Grid>
    );
  }

  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <CustomTextField
        name={fieldKey}
        control={control}
        label={label}
        required={field.is_required}
      />
    </Grid>
  );
};

export const VisaIntakeModal = ({
  open,
  close,
  row,
  table,
  onRefresh,
  countryGuid,
}) => {
  const { t, selectedLang } = useLocale();
  const itemData = row?.original || null;
  const isEditing = Boolean(itemData);

  const { data: rawFields = [], isLoading: fieldsLoading } = useGet({
    apiFn: () =>
      countryGuid ? getCountryVisaFieldsApi(countryGuid) : Promise.resolve([]),
    key: ["countryVisaFields", countryGuid],
    options: { enabled: Boolean(countryGuid) },
  });

  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const sortedFields = useMemo(() => {
    return sortVisaFields(rawFields);
  }, [rawFields]);

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
    [employees, selectedLang]
  );

  const initialValues = useMemo(() => {
    const defaults = {};

    sortedFields.forEach((field) => {
      const key = field.fieldKey;

      if (itemData) {
        if (key === "client_guid") {
          defaults[key] = itemData.client_guid || itemData.client?.guid || "";
        } else if (key === "operator_guid") {
          defaults[key] = itemData.operator_guid || itemData.operator?.guid || "";
        } else if (key === "operator2_guid") {
          defaults[key] = itemData.operator2_guid || itemData.operator2?.guid || "";
        } else if (itemData[key] !== undefined && itemData[key] !== null) {
          if (field.fieldType === "date") {
            defaults[key] = itemData[key] ? dayjs(itemData[key]) : null;
          } else {
            defaults[key] = itemData[key];
          }
        } else {
          defaults[key] = field.fieldType === "date" ? null : "";
        }
      } else {
        if (field.fieldType === "date") {
          defaults[key] = key === "application_date" ? dayjs() : null;
        } else {
          defaults[key] = "";
        }
      }
    });

    return defaults;
  }, [sortedFields, itemData]);

  const { control, handleSubmit } = useForm({
    defaultValues: initialValues,
    values: initialValues,
    mode: "onSubmit",
  });

  const { mutate: createReceiving, isPending: isCreating } = useCreate({
    apiFn: addReceivingApi,
    key: "receivings",
    onSuccess: () => {
      onRefresh?.();
      handleClose();
    },
  });

  const { mutate: updateReceiving, isPending: isUpdating } = useUpdate({
    apiFn: updateReceivingApi,
    key: "receivings",
    idKey: "guid",
    onSuccessUpdate: () => {
      onRefresh?.();
      handleClose();
    },
  });

  const handleClose = () => {
    if (table) {
      table.setCreatingRow(null);
      table.setEditingRow(null);
    }
    close?.();
  };

  const submitHandler = async (formData) => {
    const payload = {
      country_guid: countryGuid,
    };

    if (isEditing && itemData?.guid) {
      payload.guid = itemData.guid;
    }

    sortedFields.forEach((field) => {
      const key = field.fieldKey;
      const val = formData[key];

      if (field.fieldType === "date") {
        if (val && dayjs.isDayjs(val) && val.isValid()) {
          payload[key] = val.format("YYYY-MM-DD");
        } else if (typeof val === "string" && val) {
          payload[key] = val;
        } else {
          payload[key] = null;
        }
      } else if (field.fieldType === "number") {
        payload[key] = val !== "" && val !== null ? Number(val) : null;
      } else {
        payload[key] = val !== undefined && val !== null ? val : "";
      }
    });

    if (isEditing) {
      updateReceiving(payload);
    } else {
      createReceiving(payload);
    }
  };

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(
          table &&
            (table.getState().creatingRow ||
              table.getState().editingRow?.id === row?.id)
        );

  const initialClient = useMemo(() => {
    if (itemData?.client) return itemData.client;
    if (itemData?.client_guid) {
      return {
        guid: itemData.client_guid,
        fullName: itemData.client_name || itemData.client_guid,
      };
    }
    return null;
  }, [itemData]);

  const dialogTitle = isEditing
    ? t("visaIntake.editApplication")
    : t("visaIntake.addApplication");

  return (
    <CustomDialog widthX={780} open={isModalOpen} close={handleClose}>
      <CustomDialogHeader variant="h5" title={dialogTitle} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {fieldsLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress size={36} />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {sortedFields.map((field) => (
                <DynamicVisaField
                  key={field.fieldKey}
                  field={field}
                  control={control}
                  selectedLang={selectedLang}
                  initialClient={initialClient}
                  employeeOptions={employeeOptions}
                />
              ))}
            </Grid>
          )}

          <FooterButton
            loading={isCreating || isUpdating}
            onCancel={handleClose}
            type="submit"
          />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default VisaIntakeModal;
