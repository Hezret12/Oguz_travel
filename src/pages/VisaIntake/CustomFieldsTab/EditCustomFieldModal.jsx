import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Box, Grid, Typography, TextField, Button, Chip } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import FooterButton from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import { slugifyFieldKey } from "../../../functions/visaCountryFieldConfigs";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { updateCustomFieldApi } from "../../../api/queries/patch";

export const EditCustomFieldModal = ({
  open,
  onClose,
  table,
  row,
  onRefresh,
}) => {
  const { t } = useLocale();

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().editingRow?.id === row?.id);

  const handleClose = () => {
    if (table) {
      table.setEditingRow(null);
    }
    onClose?.();
  };

  const itemData = row?.original || {};

  const [prevGuid, setPrevGuid] = useState(null);
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);

  const currentGuid = isModalOpen && itemData ? itemData.guid : null;

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      labelTm: itemData?.field_label?.tk || itemData?.labelTm || "",
      labelRu: itemData?.field_label?.ru || itemData?.labelRu || "",
      labelEn: itemData?.field_label?.en || itemData?.labelEn || "",
      fieldType: itemData?.field_type || itemData?.fieldType || "text",
      sort_order: itemData?.sort_order ?? 0,
    },
  });

  if (currentGuid !== prevGuid) {
    setPrevGuid(currentGuid);
    setOptions(Array.isArray(itemData?.options) ? itemData.options : []);
    reset({
      labelTm: itemData?.field_label?.tk || itemData?.labelTm || "",
      labelRu: itemData?.field_label?.ru || itemData?.labelRu || "",
      labelEn: itemData?.field_label?.en || itemData?.labelEn || "",
      fieldType: itemData?.field_type || itemData?.fieldType || "text",
      sort_order: itemData?.sort_order ?? 0,
    });
  }

  const { mutate: updateCustomField, isPending } = useUpdate({
    apiFn: updateCustomFieldApi,
    key: "customFields",
    idKey: "guid",
    invalidateQueries: ["countries", "countryOptions", "countryVisaFields", "receivings"],
    onSuccessUpdate: () => {
      onRefresh?.();
      handleClose();
    },
  });

  const [fieldType] = useWatch({
    control,
    name: ["fieldType"],
  });

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
    if (!itemData.guid) return;

    const computedFieldKey =
      itemData.field_key ||
      itemData.fieldKey ||
      slugifyFieldKey(data.labelEn || data.labelTm);

    const payload = {
      guid: itemData.guid,
      field_label: {
        tk: data.labelTm.trim(),
        ru: data.labelRu.trim(),
        en: data.labelEn.trim(),
      },
      field_key: computedFieldKey,
      field_type: data.fieldType,
      options: data.fieldType === "select" ? options : [],
      sort_order: Number(data.sort_order ?? 0) || 0,
    };

    updateCustomField(payload);
  };

  const typeOptions = [
    { label: t("customFields.typeText"), value: "text" },
    { label: t("customFields.typeDate"), value: "date" },
    { label: t("customFields.typeNumber"), value: "number" },
    { label: t("customFields.typeSelect"), value: "select" },
  ];

  return (
    <CustomDialog open={isModalOpen} close={handleClose} widthX={700}>
      <CustomDialogHeader variant="h5" title={t("customFields.editTitle")} />
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
            onCancel={handleClose}
            type="submit"
          />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default EditCustomFieldModal;
