import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Box, Grid, Typography, TextField, Button, Chip } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import { isReservedFieldKey, slugifyFieldKey, toWordCase } from "../../../functions/visaCountryFieldConfigs";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { addCustomFieldApi } from "../../../api/queries/post";

export const CreateCustomFieldModal = ({
  open,
  onClose,
  candidateString,
  onSave,
}) => {
  const { t } = useLocale();
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);

  const { mutate: createCustomField, isPending } = useCreate({
    apiFn: addCustomFieldApi,
    key: "customFields",
    // The list is paginated server side, so the new record is fetched back
    // rather than pushed into the cached page (which would leave a wrong count).
    isPaginated: true,
    invalidateQueries: ["countries", "countryOptions", "countryVisaFields", "receivings"],
    onSuccess: (res) => {
      const createdItem = res?.data?.data || res?.data || res;
      if (onSave) {
        onSave(createdItem);
      }
      onClose();
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      labelTm: candidateString || "",
      labelRu: candidateString || "",
      labelEn: candidateString || "",
      fieldType: "text",
      sort_order: 0,
    },
  });

  const [labelTm, labelEn, fieldType] = useWatch({
    control,
    name: ["labelTm", "labelEn", "fieldType"],
  });

  const autoKey = useMemo(
    () => slugifyFieldKey(labelEn || labelTm),
    [labelEn, labelTm],
  );

  // The key is slugified from the label, so a label like "Status" would collide with a
  // column the intake record already owns; such a field could never be saved or shown.
  const isKeyReserved = isReservedFieldKey(autoKey);

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions((prev) => [...prev, optionInput.trim()]);
      setOptionInput("");
    }
  };

  const handleRemoveOption = (idx) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = (data) => {
    if (!data.labelTm?.trim() || !data.labelRu?.trim() || !data.labelEn?.trim())
      return;

    const computedFieldKey =
      autoKey || slugifyFieldKey(data.labelEn || data.labelTm);
    if (isReservedFieldKey(computedFieldKey)) return;

    const payload = {
      field_label: {
        tk: toWordCase(data.labelTm.trim()),
        ru: toWordCase(data.labelRu.trim()),
        en: toWordCase(data.labelEn.trim()),
      },
      field_key: computedFieldKey,
      field_type: data.fieldType,
      options: data.fieldType === "select" ? options : [],
      sort_order: Number(data.sort_order ?? 0) || 0,
    };

    createCustomField(payload);
  };

  const typeOptions = [
    { label: t("customFields.typeText"), value: "text" },
    { label: t("customFields.typeDate"), value: "date" },
    { label: t("customFields.typeNumber"), value: "number" },
    { label: t("customFields.typeSelect"), value: "select" },
  ];

  return (
    <CustomDialog open={open} close={onClose} widthX={700}>
      <CustomDialogHeader variant="h5" title={t("customFields.addTitle")} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="labelTm"
                control={control}
                label={t("customFields.labelTm")}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="labelRu"
                control={control}
                label={t("customFields.labelRu")}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="labelEn"
                control={control}
                label={t("customFields.labelEn")}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                name="fieldType"
                control={control}
                label={t("customFields.fieldType")}
                options={typeOptions}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="sort_order"
                control={control}
                label={t("customFields.sortOrder")}
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="body2"
                sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.875rem" }}
              >
                fieldKey (Auto)
              </Typography>
              <TextField
                value={autoKey}
                disabled
                fullWidth
                size="medium"
                error={isKeyReserved}
                helperText={
                  isKeyReserved
                    ? t("customFields.reservedKey", { key: autoKey })
                    : "English label-dan döredilýär"
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "7px",
                    minHeight: "44px",
                  },
                }}
              />
            </Grid>
            {fieldType === "select" && (
              <Grid size={12}>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.875rem" }}
                >
                  {t("customFields.options")}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                  <TextField
                    placeholder="Opsiýa adyny ýazyň..."
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    size="medium"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "7px",
                        minHeight: "44px",
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddOption}
                    sx={{
                      height: "44px",
                      borderRadius: "7px",
                      px: 3,
                      fontWeight: 600,
                    }}
                  >
                    Goş
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {options.map((opt, i) => (
                    <Chip
                      key={i}
                      label={opt}
                      onDelete={() => handleRemoveOption(i)}
                      color="primary"
                      sx={{ borderRadius: "6px", fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>

          <FooterButton
            loading={isPending}
            onCancel={onClose}
            type="submit"
            disabled={isKeyReserved}
          />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default CreateCustomFieldModal;
