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
  code: yup.string().required("Ýurt kody (Code) hökmany"),
  nameTm: yup.string().required("Ýurt ady, Tm hökmany"),
  nameRu: yup.string().nullable(),
  nameEn: yup.string().nullable(),
  fields: yup.array().nullable(),
});

export const CreateCountryModal = ({ open, onClose, onRefresh }) => {
  const { t } = useLocale();

  const { mutate: createCountry, isPending } = useCreate({
    apiFn: createCountryApi,
    key: "countries",
    // The list is paginated server side, so the new record is fetched back
    // rather than pushed into the cached page (which would leave a wrong count).
    isPaginated: true,
    invalidateQueries: ["countryOptions", "countryVisaFields", "receivings", "customFields"],
    onSuccess: () => {
      onRefresh?.();
      onClose?.();
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      code: "",
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
      const custom_field_guids = selectedItems
        .map((item) => (typeof item === "object" && item !== null ? (item.guid || item.id) : null))
        .filter(Boolean);

      const countryCode = data.code.trim().toUpperCase();

      const payload = {
        code: countryCode,
        nameTm: data.nameTm,
        nameRu: data.nameRu || data.nameTm,
        nameEn: data.nameEn || data.nameTm,
        name: {
          tk: data.nameTm,
          ru: data.nameRu || data.nameTm,
          en: data.nameEn || data.nameTm,
        },
        custom_field_guids,
      };

      await createCountry(payload);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CustomDialog widthX={800} open={open} close={onClose}>
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
            </strong>
            {t("visaIntake.defaultFieldsInfoDesc")}
          </Alert>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <CustomTextField
                name="code"
                control={control}
                label={t("columns.code")}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <CustomTextField
                name="nameTm"
                control={control}
                label={t("columns.countryNameTm")}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <CustomTextField
                name="nameRu"
                control={control}
                label={t("columns.countryNameRu")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <CustomTextField
                name="nameEn"
                control={control}
                label={t("columns.countryNameEn")}
              />
            </Grid>
          </Grid>

          <CountryFieldSelector control={control} name="fields" />

          <FooterButton loading={isPending} onCancel={onClose} type="submit" />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default CreateCountryModal;


