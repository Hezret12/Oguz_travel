import { useMemo, useState } from "react";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";

import { useLocale } from "../../hooks/useLocale";
import { useValidShema } from "../../functions/useValidShema";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import CustomTextField from "../../components/CustomTextField";
import FooterButton from "../../components/Dialog/FooterButton";
import GlobalClientAutocomplete from "../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import GlobalEmployeeAutocomplete from "../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import CustomDatePicker from "../../components/CustomDatePicker";
import AppAutocomplete from "../../components/AppAutocomplete";
import { useReferralCountryOptions } from "./functions/useReferralCountryOptions";
import LabelWithTooltip from "../../components/LabelWithTooltip";
import { YH_INPUT_PROPS } from "../../functions/yhNumber";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { updateReferralLetterApi } from "../../api/queries/patch";

const EditReferralLetterModal = ({ table, row }) => {
  const { t } = useLocale();
  const { addReferralLetter } = useValidShema();
  const countryOptions = useReferralCountryOptions();

  const { mutate: updateReferralLetter, isPending: isSubmit } = useUpdate({
    apiFn: updateReferralLetterApi,
    key: "referralLetters",
    idKey: "guid",
    // The letter-stock report counts used ÝH numbers from these letters.
    invalidateQueries: ["stockLetters"],
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  // The autocomplete only knows clients it has searched for, so the saved
  // client is handed to it to show the current selection on open.
  const initialClient = useMemo(() => {
    const original = row?.original;
    if (original?.client?.guid) return original.client;
    if (original?.client_guid) return { guid: original.client_guid, fullName: original.client_name || "" };
    return null;
  }, [row]);

  const initialValues = useMemo(() => {
    return {
      guid: row?.original?.guid || null,
      date_time: row?.original?.date_time || null,
      client_guid: row?.original?.client_guid || row?.original?.client?.guid || null,
      received_opr_guid: row?.original?.received_opr_guid || null,
      // The API sends the country only as the nested relation.
      refferal_country_guid:
        row?.original?.refferal_country_guid || row?.original?.refferalCountry?.guid || null,
      bgn_departure: row?.original?.bgn_departure || row?.original?.tranzit || null,
      bgn_arrival: row?.original?.bgn_arrival || null,
      travel_document_number: row?.original?.travel_document_number || null,
      departure_date: row?.original?.departure_date || null,
      return_date: row?.original?.return_date || null,
      price:
        row?.original?.price !== undefined
          ? String(row.original.price)
          : "",
      currency: "TMT",
      contract_date: row?.original?.contract_date || null,
      note: row?.original?.note || "",
    };
  }, [row]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(addReferralLetter),
    mode: "onSubmit",
  });

  const [prevRowId, setPrevRowId] = useState(null);
  const currentRowId = row?.original ? row.original.guid || row.original.id : null;
  if (currentRowId !== prevRowId) {
    setPrevRowId(currentRowId);
    reset(initialValues);
  }

  const closeDialog = () => {
    table.setEditingRow(null);
  };

  const submitHandler = (values) => {
    const formattedDate = values.date_time
      ? dayjs(values.date_time).format("YYYY-MM-DD")
      : null;

    updateReferralLetter({
      ...values,
      date_time: values.date_time || formattedDate,
      datetime: values.date_time || formattedDate,
      date: formattedDate,
      price: Number(values.price || 0),
      currency: "TMT",
    });
  };

  const autocompleteColumns = useMemo(
    () => [
      "fullName",
      "gender",
      "dateOfBirth",
      { key: "passport_number", label: t("columns.passportNumber") },
    ],
    [t],
  );

  return (
    <CustomDialog widthX={860} open={true} close={closeDialog}>
      <CustomDialogHeader
        variant="h5"
        title={t("referralLetter.edit")}
      />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Grid container spacing={2.5} sx={{ mb: 2 }}>
          <Grid size={12}>
            <GlobalClientAutocomplete
              control={control}
              name="client_guid"
              label={t("columns.client")}
              columns={autocompleteColumns}
              initialClient={initialClient}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <GlobalEmployeeAutocomplete
              name="received_opr_guid"
              control={control}
              label={t("outbound.operator")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <AppAutocomplete
              name="refferal_country_guid"
              control={control}
              label={t("columns.destinationCountry")}
              options={countryOptions}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CustomTextField
              name="travel_document_number"
              control={control}
              placeholder="0369420"
              InputProps={YH_INPUT_PROPS}
              label={
                <LabelWithTooltip
                  label={t("columns.syhNo", "S-ÝH №")}
                  tooltip={t("referralLetter.travel_doc_tooltip")}
                />
              }
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CustomTextField
              name="bgn_departure"
              control={control}
              label={t("columns.bgnDeparture")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CustomTextField
              name="bgn_arrival"
              control={control}
              label={t("columns.bgnArrival")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CustomDatePicker
              name="departure_date"
              validateFormat
              control={control}
              label={t("columns.departureDate")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CustomDatePicker
              name="return_date"
              validateFormat
              control={control}
              label={t("columns.returnDate")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              name="price"
              control={control}
              label={t("price")}
              type="number"
              allowNegative={false}
              endIcon="TMT"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomDatePicker
              name="contract_date"
              validateFormat
              control={control}
              label={t("columns.contractDate")}
            />
          </Grid>

          <Grid size={12}>
            <CustomTextField
              name="note"
              control={control}
              label={t("columns.note")}
            />
          </Grid>
        </Grid>

        <FooterButton loading={isSubmit} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditReferralLetterModal;
