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
  nameTm: yup.string().required("Ýurt ady (TM) hökmany"),
  nameRu: yup.string().nullable(),
  nameEn: yup.string().nullable(),
  fields: yup.array().nullable(),
});

export const EditCountryModal = ({ open, close, row, table, onRefresh }) => {
  const { t } = useLocale();

  const countryData = row?.original;
  const countryGuid = countryData?.guid || countryData?.id;

  const { data: rawCountryFields = [] } = useGet({
    apiFn: () =>
      countryGuid ? getCountryVisaFieldsApi(countryGuid) : Promise.resolve([]),
    key: ["countryVisaFields", countryGuid],
    options: { enabled: Boolean(countryGuid) },
  });

  const countryFields = Array.isArray(rawCountryFields) ? rawCountryFields : [];

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

  const nonDefaultFields = useMemo(
    () => countryFields.filter((f) => !f.isDefault),
    [countryFields]
  );

  const { control, handleSubmit } = useForm({
    defaultValues: {
      nameTm: countryData?.nameTm || "",
      nameRu: countryData?.nameRu || "",
      nameEn: countryData?.nameEn || "",
      fields: nonDefaultFields,
    },
    values: {
      nameTm: countryData?.nameTm || "",
      nameRu: countryData?.nameRu || "",
      nameEn: countryData?.nameEn || "",
      fields: nonDefaultFields,
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
        guid: countryGuid,
        nameTm: data.nameTm,
        nameRu: data.nameRu || data.nameTm,
        nameEn: data.nameEn || data.nameTm,
        existingFieldIds,
        newFields,
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
    <CustomDialog widthX={680} open={isModalOpen} close={handleClose}>
      <CustomDialogHeader variant="h5" title={t("visa.editCountryTitle")} />
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
              {t("visa.defaultFieldsInfoTitle") || "Standart Meýdançalar:"}
            </strong>{" "}
            {t("visa.defaultFieldsInfoDesc") ||
              "Müşderi, Arza berlen senesi, Edara, Operator, Doglan senesi, Pasaport belgisi, Wiza görnüşi we Bellikler awtomatiki birikdirilýär."}
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

          <FooterButton loading={isPending} onCancel={handleClose} type="submit" />
        </Box>
      </CustomForm>
    </CustomDialog>
  );
};

export default EditCountryModal;
