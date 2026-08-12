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
import { slugifyFieldKey } from "../../../functions/visaCountryFieldConfigs";

export const CreateCustomFieldModal = ({ open, onClose, candidateString, onSave }) => {
  const { t } = useLocale();
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      labelTm: candidateString || "",
      labelRu: candidateString || "",
      labelEn: candidateString || "",
      fieldType: "text",
    },
  });

  const [labelTm, labelEn, fieldType] = useWatch({
    control,
    name: ["labelTm", "labelEn", "fieldType"],
  });

  const autoKey = useMemo(
    () => slugifyFieldKey(labelEn || labelTm),
    [labelEn, labelTm]
  );

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
    if (!data.labelTm?.trim() || !data.labelRu?.trim() || !data.labelEn?.trim()) return;

    const newFieldObj = {
      fieldKey: autoKey || `custom_${Date.now()}`,
      labelTm: data.labelTm.trim(),
      labelRu: data.labelRu.trim(),
      labelEn: data.labelEn.trim(),
      fieldType: data.fieldType,
      options: data.fieldType === "select" ? options : [],
      isDefault: false,
      isCustom: true,
    };
    onSave(newFieldObj);
    onClose();
  };

  const typeOptions = [
    { label: t("visaIntake.typeText") || "Tekst (Text)", value: "text" },
    { label: t("visaIntake.typeDate") || "Sene (Date)", value: "date" },
    { label: t("visaIntake.typeNumber") || "San (Number)", value: "number" },
    { label: t("visaIntake.typeSelect") || "Saýlawly (Dropdown Select)", value: "select" },
  ];

  return (
    <CustomDialog open={open} close={onClose} widthX={700}>
      <CustomDialogHeader
        variant="h5"
        title={t("visaIntake.createCustomFieldTitle") || "Täze meýdança döretmek"}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <CustomTextField
                name="labelTm"
                control={control}
                label="TM Label (Türkmen)"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="labelRu"
                control={control}
                label="RU Label (Русский)"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                name="labelEn"
                control={control}
                label="EN Label (English)"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                name="fieldType"
                control={control}
                label={t("visaIntake.fieldTypeLabel") || "Meýdança görnüşi"}
                options={typeOptions}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="body2"
                sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.875rem" }}
              >
                {t("visaIntake.fieldKeyPreview") || "fieldKey (Auto)"}
              </Typography>
              <TextField
                value={autoKey}
                disabled
                fullWidth
                size="medium"
                helperText="English label-dan döredilýär"
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
                  {t("visaIntake.selectOptionsLabel") || "Saýlaw opsiýalary"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                  <TextField
                    placeholder={
                      t("visaIntake.addOptionPlaceholder") || "Opsiýa adyny ýazyň..."
                    }
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
                    sx={{ height: "44px", borderRadius: "7px", px: 3, fontWeight: 600 }}
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

          <FooterButton onCancel={onClose} type="submit" />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default CreateCustomFieldModal;
