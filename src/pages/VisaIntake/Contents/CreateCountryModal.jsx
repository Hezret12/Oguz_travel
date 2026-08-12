import { useForm } from "react-hook-form";
import { Grid, Box, Alert } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";
import CustomTextField from "../../../components/CustomTextField";
import CountryFieldSelector from "./CountryFieldSelector";
import { createCountryApi } from "../../../api/queries/post";
import { useCreate } from "../../../hooks/CRUD/useCreate";

const schema = yup.object().shape({
  nameTm: yup.string().required("Ýurt ady (TM) hökmany"),
  nameRu: yup.string().nullable(),
  nameEn: yup.string().nullable(),
  fields: yup.array().nullable(),
});

export const CreateCountryModal = ({ open, onClose, onRefresh }) => {
  const { t } = useLocale();

  const { mutate: createCountry, isLoading } = useCreate({
    apiFn: createCountryApi,
    key: "countries",
    onSuccess: () => {
      onRefresh?.();
      onClose?.();
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      nameTm: "",
      nameRu: "",
      nameEn: "",
      fields: [],
    },
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const submitHandler = async (data) => {
    try {
      const selectedItems = data.fields || [];
      const existingFieldIds = [];
      const newFields = [];

      selectedItems.forEach((item) => {
        if (typeof item === "string") {
          newFields.push(item);
        } else if (item && typeof item === "object") {
          if (item.guid || item.id) {
            existingFieldIds.push(item.guid || item.id);
          } else {
            const label =
              item.labelTm || item.labelRu || item.labelEn || item.fieldKey;
            if (label) newFields.push(label);
          }
        }
      });

      const payload = {
        nameTm: data.nameTm,
        nameRu: data.nameRu || data.nameTm,
        nameEn: data.nameEn || data.nameTm,
        existingFieldIds,
        newFields,
      };

      await createCountry(payload);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CustomDialog widthX={680} open={open} close={onClose}>
      <CustomDialogHeader variant="h5" title={t("visaIntake.addCountryTitle")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Alert
            severity="info"
            sx={{
              borderRadius: "10px",
              fontSize: "0.825rem",
              py: 0.5,
              borderColor: "info.light",
            }}
          >
            <strong>
              {t("visaIntake.defaultFieldsInfoTitle")}
            </strong>{" "}
            {t("visaIntake.defaultFieldsInfoDesc")}
          </Alert>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                name="nameTm"
                control={control}
                label={t("columns.countryNameTm")}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                name="nameRu"
                control={control}
                label={t("columns.countryNameRu")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomTextField
                name="nameEn"
                control={control}
                label={t("columns.countryNameEn")}
              />
            </Grid>
          </Grid>

          <CountryFieldSelector control={control} name="fields" />

          <FooterButton loading={isLoading} onCancel={onClose} type="submit" />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default CreateCountryModal;
