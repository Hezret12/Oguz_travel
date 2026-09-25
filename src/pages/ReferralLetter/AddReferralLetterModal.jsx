import { useMemo } from "react";
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
import LabelWithTooltip from "../../components/LabelWithTooltip";
import { YH_INPUT_PROPS } from "../../functions/yhNumber";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { addReferralLetterApi } from "../../api/queries/post";

const AddReferralLetterModal = ({ table }) => {
  const { t } = useLocale();
  const { addReferralLetter } = useValidShema();

  const { mutate: createReferralLetter, isPending: isSubmit } = useCreate({
    apiFn: addReferralLetterApi,
    key: "referralLetters",
    // The list is paginated server side, so the new record is fetched back
    // rather than pushed into the cached page (which would leave a wrong count).
    isPaginated: true,
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      date_time: dayjs().format("YYYY-MM-DD"),
      client_guid: null,
      received_opr_guid: null,
      destination_country: null,
      bgn_departure: null,
      bgn_arrival: null,
      travel_document_number: null,
      departure_date: null,
      return_date: null,
      price: null,
      currency: "TMT",
      contract_date: null,
      note: null,
    },
    resolver: yupResolver(addReferralLetter),
    mode: "onSubmit",
  });

  const closeDialog = () => {
    table.setCreatingRow(null);
  };

  const submitHandler = (values) => {
    const formattedDate = values.date_time
      ? dayjs(values.date_time).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");

    createReferralLetter({
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
      <CustomDialogHeader variant="h5" title={t("referralLetter.add")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Grid container spacing={2.5} sx={{ mb: 2 }}>
          <Grid size={12}>
            <GlobalClientAutocomplete
              control={control}
              name="client_guid"
              label={t("columns.client")}
              columns={autocompleteColumns}
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
            <CustomTextField
              name="destination_country"
              control={control}
              label={t("columns.destinationCountry")}
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

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomTextField
              name="bgn_departure"
              control={control}
              label={t("columns.bgnDeparture")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomTextField
              name="bgn_arrival"
              control={control}
              label={t("columns.bgnArrival")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomDatePicker
              name="departure_date"
              validateFormat
              control={control}
              label={t("columns.departureDate")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomDatePicker
              name="return_date"
              validateFormat
              control={control}
              label={t("columns.returnDate")}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
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
          <Grid size={{ xs: 12, sm: 6 }}>
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

export default AddReferralLetterModal;
