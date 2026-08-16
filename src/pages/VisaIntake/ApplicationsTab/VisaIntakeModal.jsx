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
} from "../../../functions/visaCountryFieldConfigs";

const DynamicVisaField = ({
  field,
  control,
  selectedLang,
  initialClient,
  employeeOptions = [],
}) => {
  const fieldKey = field.fieldKey;
  const label = selectedLang(field.labelTm) || field.labelTm || fieldKey;

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

  if (fieldKey === "note" || field.multiline) {
    return (
      <Grid size={12}>
        <CustomTextField
          name={fieldKey}
          control={control}
          label={label}
        />
      </Grid>
    );
  }

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

  if (field.fieldType === "select" && Array.isArray(field.options)) {
    const opts = field.options.map((opt) => ({
      label: typeof opt === "string" ? opt : opt.label,
      value: typeof opt === "string" ? opt : opt.value,
    }));
    return (
      <Grid size={{ xs: 12, sm: 4 }}>
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
      <Grid size={{ xs: 12, sm: 4 }}>
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
      <Grid size={{ xs: 12, sm: 4 }}>
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

  if (field.fieldType === "autocomplete" || field.optionsKey === "employees") {
    return (
      <Grid size={{ xs: 12, sm: 4 }}>
        <AppAutocomplete
          name={fieldKey}
          control={control}
          label={label}
          options={employeeOptions}
        />
      </Grid>
    );
  }

  return (
    <Grid size={{ xs: 12, sm: 4 }}>
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

  const effectiveCountryGuid =
    countryGuid ||
    itemData?.country_guid ||
    "";

  const { data: rawFields = [], isLoading: fieldsLoading } = useGet({
    apiFn: () =>
      effectiveCountryGuid
        ? getCountryVisaFieldsApi(effectiveCountryGuid)
        : Promise.resolve([]),
    key: ["countryVisaFields", effectiveCountryGuid],
    options: { enabled: Boolean(effectiveCountryGuid) },
  });

  const employeeParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
    params: employeeParams,
  });

  const employeeOptions = useMemo(() => {
    const list = Array.isArray(employees)
      ? employees
      : Array.isArray(employees?.data)
      ? employees.data
      : [];
    return list.map((emp) => {
      const officeObj = emp.office;
      const officeShort = officeObj
        ? selectedLang(officeObj.shortName) ||
          selectedLang(officeObj.fullName) ||
          (typeof officeObj.shortName === "string" ? officeObj.shortName : "") ||
          (typeof officeObj.fullName === "string" ? officeObj.fullName : "") ||
          (typeof officeObj === "string" ? officeObj : "")
        : "";
      const label = officeShort
        ? `${emp.fullName} (${officeShort})`
        : emp.fullName || "";
      return { label, value: emp.guid };
    });
  }, [employees, selectedLang]);

  const sortedFields = useMemo(() => {
    return sortVisaFields(rawFields);
  }, [rawFields]);

  const initialValues = useMemo(() => {
    const defaults = {};

    sortedFields.forEach((field) => {
      const key = field.fieldKey;

      if (itemData) {
        let val = itemData[key];
        if (val === undefined || val === null) {
          val = itemData.custom_field_values?.[key];
        }

        if (key === "client_guid") {
          defaults[key] = itemData.client_guid || itemData.client?.guid || "";
        } else if (key === "operator_guid" || key === "accepted_opr_guid") {
          defaults[key] =
            itemData.operator_guid ||
            itemData.operator?.guid ||
            itemData.accepted_opr_guid ||
            "";
        } else if (key === "operator2_guid" || key === "received_opr_guid") {
          defaults[key] =
            itemData.operator2_guid ||
            itemData.operator2?.guid ||
            itemData.received_opr_guid ||
            "";
        } else if (key === "visa_type" || key === "visa_category") {
          defaults[key] =
            itemData.visa_type ||
            itemData.visa_category ||
            itemData.custom_field_values?.visa_type ||
            itemData.custom_field_values?.visa_category ||
            "";
        } else if (val !== undefined && val !== null) {
          if (field.fieldType === "date") {
            defaults[key] = val ? dayjs(val) : null;
          } else {
            defaults[key] = val;
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
    const custom_field_values = {};
    const payload = {
      country_guid: effectiveCountryGuid,
    };

    if (isEditing && itemData?.guid) {
      payload.guid = itemData.guid;
    }

    sortedFields.forEach((field) => {
      const key = field.fieldKey;
      const val = formData[key];

      let formattedVal;
      if (field.fieldType === "date") {
        if (val && dayjs.isDayjs(val) && val.isValid()) {
          formattedVal = val.format("YYYY-MM-DD");
        } else if (typeof val === "string" && val) {
          formattedVal = val;
        } else {
          formattedVal = null;
        }
      } else if (field.fieldType === "number") {
        formattedVal = val !== "" && val !== null ? Number(val) : null;
      } else {
        formattedVal = val !== undefined && val !== null ? val : "";
      }

      if (key === "application_date") {
        payload.application_date = formattedVal;
      } else if (key === "client_guid") {
        payload.client_guid = formattedVal || null;
      } else if (key === "operator_guid" || key === "accepted_opr_guid") {
        payload.operator_guid = formattedVal || null;
      } else if (key === "operator2_guid" || key === "received_opr_guid") {
        payload.operator2_guid = formattedVal || null;
      } else if (key === "office_guid") {
        payload.office_guid = formattedVal || null;
      } else if (key === "visa_type" || key === "visa_category") {
        payload.visa_type = formattedVal || null;
      } else if (key === "note") {
        payload.note = formattedVal || null;
      } else {
        if (formattedVal !== null && formattedVal !== "") {
          custom_field_values[key] = formattedVal;
        }
      }
    });

    payload.custom_field_values = custom_field_values;

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
        phone_number: itemData.phone_number || "",
        passport_number: itemData.passport_number || "",
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
