import { useMemo, useState } from "react";
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
import GlobalClientAutocomplete from "../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import GlobalEmployeeAutocomplete from "../../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { addReceivingApi } from "../../../api/queries/post";
import { updateReceivingApi } from "../../../api/queries/patch";
import { getCountryVisaFieldsApi } from "../../../api/queries/getters";
import {
  sortVisaFields,
  isOperatorField,
  isNotesField,
} from "../../../functions/visaCountryFieldConfigs";
import { VISA_STATUS } from "../../../functions/statusChipConfigs";

const DynamicVisaField = ({
  field,
  control,
  selectedLang,
  initialClient,
}) => {
  const fieldKey = field.fieldKey;
  const label = selectedLang(field.label) || field.fieldKey;

  if (
    isOperatorField(fieldKey) ||
    field.fieldType === "autocomplete" ||
    field.optionsKey === "employees"
  ) {
    return (
      <Grid size={{ xs: 12, sm: 6 }}>
        <GlobalEmployeeAutocomplete
          name={fieldKey}
          control={control}
          label={label}
          required={field.is_required}
        />
      </Grid>
    );
  }

  if (isNotesField(field) || fieldKey === "note" || field.multiline) {
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

  const sortedFields = useMemo(() => {
    return sortVisaFields(rawFields);
  }, [rawFields]);

  const statusOptions = useMemo(
    () => [
      { label: t("visa.statusProcess"), value: VISA_STATUS.PROCESS, color: "#2563eb" },
      { label: t("visa.statusDone"), value: VISA_STATUS.DONE, color: "#16a34a" },
      { label: t("visa.statusFail"), value: VISA_STATUS.FAIL, color: "#dc2626" },
    ],
    [t],
  );

  const initialValues = useMemo(() => {
    const defaults = { status: itemData?.status || VISA_STATUS.PROCESS };

    const customValues =
      typeof itemData?.custom_field_values === "string"
        ? (() => {
            try {
              return JSON.parse(itemData.custom_field_values);
            } catch {
              return {};
            }
          })()
        : itemData?.custom_field_values || {};

    sortedFields.forEach((field) => {
      const key = field.fieldKey;

      if (itemData) {
        let val;
        if (key === "client_guid") {
          val = itemData.client_guid || "";
        } else if (key === "accepted_opr_guid") {
          val = itemData.accepted_opr_guid || itemData.operator_guid || "";
        } else if (key === "application_date") {
          val = itemData.application_date;
        } else if (key === "note" || key === "notes") {
          val = itemData.note ?? itemData.notes ?? customValues?.note ?? "";
        } else {
          val = customValues?.[key];
        }

        if (key === "client_guid") {
          defaults[key] = val || "";
        } else if (key === "accepted_opr_guid") {
          defaults[key] = val || "";
        } else if (val !== undefined && val !== null) {
          defaults[key] = field.fieldType === "date" ? (val ? dayjs(val) : null) : val;
        } else {
          defaults[key] = field.fieldType === "date" ? null : "";
        }
      } else {
        defaults[key] = field.fieldType === "date" ? null : "";
      }
    });

    return defaults;
  }, [sortedFields, itemData]);

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(
          table &&
            (table.getState().creatingRow ||
              table.getState().editingRow?.id === row?.id)
        );

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  const [prevModalKey, setPrevModalKey] = useState(null);
  const currentModalKey = isModalOpen ? itemData?.guid || "new" : null;
  if (currentModalKey !== prevModalKey) {
    setPrevModalKey(currentModalKey);
    reset(initialValues);
  }

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
      status: formData.status || VISA_STATUS.PROCESS,
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
      } else if (key === "office_guid") {
        payload.office_guid = formattedVal || null;
      } else if (key === "note") {
        payload.note = formattedVal || null;
      } else {
        custom_field_values[key] = formattedVal !== undefined ? formattedVal : "";
      }
    });

    payload.custom_field_values = custom_field_values;

    if (isEditing) {
      updateReceiving(payload);
    } else {
      createReceiving(payload);
    }
  };

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
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomSelect
                  name="status"
                  control={control}
                  label={t("columns.visaStatus")}
                  options={statusOptions}
                  required
                />
              </Grid>

              {sortedFields.map((field) => (
                <DynamicVisaField
                  key={field.fieldKey}
                  field={field}
                  control={control}
                  selectedLang={selectedLang}
                  initialClient={initialClient}
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
