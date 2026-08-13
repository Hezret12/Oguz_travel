import { useMemo } from "react";
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
import { updateCountryApi } from "../../../api/queries/patch";
import { getCountryVisaFieldsApi } from "../../../api/queries/getters";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useGet } from "../../../hooks/CRUD/useGet";

const schema = yup.object().shape({
  code: yup.string().required("Ýurt kody (Code) hökmany"),
  nameTm: yup.string().required("Ýurt ady (TM) hökmany"),
  nameRu: yup.string().nullable(),
  nameEn: yup.string().nullable(),
  fields: yup.array().nullable(),
});

export const EditCountryModal = ({ open, close, row, table, onRefresh }) => {
  const { t } = useLocale();

  const countryData = row?.original;
  const country_guid = countryData?.guid;

  const { data: rawCountryFields = [] } = useGet({
    apiFn: () =>
      country_guid ? getCountryVisaFieldsApi(country_guid) : Promise.resolve([]),
    key: ["countryVisaFields", country_guid],
    options: { enabled: Boolean(country_guid) },
  });

  const countryFields = useMemo(
    () => (Array.isArray(rawCountryFields) ? rawCountryFields : []),
    [rawCountryFields]
  );

  const handleClose = () => {
    if (table) {
      table.setEditingRow(null);
    }
    close?.();
  };

  const { mutate: updateCountry, isPending } = useUpdate({
    apiFn: updateCountryApi,
    key: "countries",
    idKey: "guid",
    onSuccessUpdate: () => {
      onRefresh?.();
      handleClose();
    },
  });

  const currentFields = useMemo(() => {
    if (Array.isArray(countryData?.custom_fields) && countryData.custom_fields.length > 0) {
      return countryData.custom_fields;
    }
    return countryFields;
  }, [countryData, countryFields]);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      code: countryData?.code || "",
      nameTm: countryData?.name?.tk || "",
      nameRu: countryData?.name?.ru || "",
      nameEn: countryData?.name?.en || "",
      fields: currentFields,
    },
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const submitHandler = async (data) => {
    try {
      const selectedItems = data.fields || [];
      const custom_field_guids = selectedItems
        .map((item) => (typeof item === "object" && item !== null ? (item.guid) : null))
        .filter(Boolean);

      const countryCode = data.code.trim().toUpperCase();

      const payload = {
        guid: country_guid,
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

      await updateCountry(payload);
    } catch (err) {
      console.error(err);
    }
  };

  const isModalOpen =
    open !== undefined
      ? Boolean(open)
      : Boolean(table && table.getState().editingRow?.id === row?.id);

  return (
    <CustomDialog widthX={750} open={isModalOpen} close={handleClose}>
      <CustomDialogHeader
        variant="h5"
        title={t("visaIntake.editCountryTitle")}
      />
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

          <FooterButton loading={isPending} onCancel={handleClose} type="submit" />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default EditCountryModal;

