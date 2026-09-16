import { useMemo } from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";

import { useLocale } from "../../hooks/useLocale";
import { useValidShema } from "../../functions/useValidShema";
import { getBooleanPaymentOptions } from "../../functions/generalHelpers";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import FooterButton from "../../components/Dialog/FooterButton";
import GlobalClientAutocomplete from "../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import GlobalEmployeeAutocomplete from "../../components/global/GlobalEmployeeAutocomplete/GlobalEmployeeAutocomplete";
import CustomDatePicker from "../../components/CustomDatePicker";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { addVisaApi } from "../../api/queries/post";
import { VISA_STATUS } from "../../functions/statusChipConfigs";

const AddVisaModal = ({ table }) => {
  const { t } = useLocale();
  const { addVisa } = useValidShema();

  const statusOptions = useMemo(
    () => [
      { label: t("visa.statusProcess"), value: VISA_STATUS.PROCESS, color: "#2563eb" },
      { label: t("visa.statusDone"), value: VISA_STATUS.DONE, color: "#16a34a" },
      { label: t("visa.statusFail"), value: VISA_STATUS.FAIL, color: "#dc2626" },
    ],
    [t],
  );

  const paymentOptions = useMemo(() => getBooleanPaymentOptions(t), [t]);

  // Mutation to create Visa
  const { mutate: createVisa, isPending: isSubmit } = useCreate({
    apiFn: addVisaApi,
    key: "visaApplications",
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  // Form setup
  const { control, handleSubmit } = useForm({
    defaultValues: {
      index_number: "",
      datetime: dayjs().toISOString(),
      client_guid: null,
      received_opr_guid: null,
      status: VISA_STATUS.PROCESS,
      is_paid: true,
      agent: {
        name: "",
        phone_number: "",
      },
      price_tmt: null,
      price_usd: null,
      note: "",
    },
    resolver: yupResolver(addVisa),
    mode: "onSubmit",
  });

  const closeDialog = () => {
    table.setCreatingRow(null);
  };

  const submitHandler = (values) => {
    const payload = {
      ...values,
      status: values.status || VISA_STATUS.PROCESS,
      is_paid: Boolean(values.is_paid),
      price_tmt: Number(values.price_tmt || 0),
      price_usd: Number(values.price_usd || 0),
      agent:
        values.agent?.name || values.agent?.phone_number ? values.agent : null,
    };
    createVisa(payload);
  };

  const autocompleteColumns = useMemo(
    () => ["fullName", "passport_number", "phone_number", "dateOfBirth"],
    [],
  );

  return (
    <CustomDialog widthX={860} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("sidebar.visaApplications")} />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
            gap: 2.5,
            mb: 2,
          }}
        >
          <Box sx={{ gridColumn: "1 / -1" }}>
            <GlobalClientAutocomplete
              control={control}
              name="client_guid"
              label={t("columns.client")}
              columns={autocompleteColumns}
              required
            />
          </Box>

          <CustomTextField
            name="index_number"
            control={control}
            label={"№"}
            required
          />

          <CustomDatePicker
            name="datetime"
            control={control}
            label={t("columns.issueDate")}
            required
          />

          <GlobalEmployeeAutocomplete
            name="received_opr_guid"
            control={control}
            label={t("columns.operatorTwo")}
            required
          />

          <CustomSelect
            name="status"
            control={control}
            label={t("columns.visaStatus")}
            options={statusOptions}
            required
          />

          <CustomTextField
            name="price_tmt"
            control={control}
            type="number"
            label={`${t("price")}, TMT`}
            endIcon="TMT"
          />

          <CustomTextField
            name="price_usd"
            control={control}
            type="number"
            label={`${t("price")}, USD`}
            endIcon="USD"
          />

          <CustomSelect
            name="is_paid"
            control={control}
            label={t("columns.paymentStatus")}
            options={paymentOptions}
            required
          />

          <CustomTextField
            name="agent.name"
            control={control}
            label={t("columns.agentFullName")}
          />

          <CustomTextField
            name="agent.phone_number"
            control={control}
            label={t("columns.agentPhoneNumber")}
          />

          <Box sx={{ gridColumn: "1 / -1" }}>
            <CustomTextField
              name="note"
              control={control}
              label={t("columns.note")}
              multiline
              rows={2}
            />
          </Box>
        </Box>

        <FooterButton loading={isSubmit} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddVisaModal;
