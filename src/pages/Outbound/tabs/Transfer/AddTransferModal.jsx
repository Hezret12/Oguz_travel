import { useMemo, useState } from "react";
import { Grid } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { useValidShema } from "../../../../functions/useValidShema";
import { CustomDialog } from "../../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../../components/Dialog/CustomForm";
import CustomTextField from "../../../../components/CustomTextField";
import CustomSelect from "../../../../components/CustomSelect";
import FooterButton from "../../../../components/Dialog/FooterButton";
import CustomDatePicker from "../../../../components/CustomDatePicker";
import GlobalClientAutocomplete from "../../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import CurrencyAmount from "../../../../components/inputs/CurrencyAmount";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { useCreate } from "../../../../hooks/CRUD/useCreate";
import { getAllEmployeeApi, getAllOfficeApi } from "../../../../api/queries/getters";
import { addTransferApi } from "../../../../api/queries/post";
import { SOURCE_OPTIONS } from "../../constants";
import TransferFields from "./TransferFields";

const AddTransferModal = ({ open = true, onClose, table }) => {
  const { t, selectedLang } = useLocale();
  const { addOutbound } = useValidShema();

  const handleClose = () => {
    if (onClose) onClose();
    if (table) table.setCreatingRow(null);
  };

  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const { data: offices = [] } = useGet({
    apiFn: getAllOfficeApi,
    key: "offices",
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(addOutbound),
    defaultValues: {
      request_date: dayjs().format("YYYY-MM-DD"),
      operator_guid: "",
      client_name: "",
      prepared_by: "",
      net_fare: 0,
      price: 0,
      currency: "USD",
      source: SOURCE_OPTIONS[0].value,
      destinationCountry: "",
      transferType: "",
      carType: "",
      route: "",
      guestCount: 1,
      note: "",
    },
  });

  const [selectedClientObj, setSelectedClientObj] = useState(null);
  const currency = useWatch({ control, name: "currency" }) || "USD";

  const { mutate: createTransfer } = useCreate({
    apiFn: addTransferApi,
    key: ["outbound", "transfer"],
    onSuccess: () => {
      handleClose();
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      client_name: selectedClientObj?.fullName || data.client_name || "",
      client_guid: selectedClientObj?.guid || (typeof data.client_name === "string" && data.client_name.length > 20 ? data.client_name : undefined),
      request_date: data.request_date ? dayjs(data.request_date).format("YYYY-MM-DD") : null,
      net_fare: Number(data.net_fare || 0),
      price: Number(data.price || 0),
      currency: data.currency || "USD",
      guestCount: data.guestCount ? Number(data.guestCount) : undefined,
    };
    delete payload.profit;
    createTransfer(payload);
  };

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => {
        const officeShort = emp.office?.shortName
          ? selectedLang(emp.office.shortName) || selectedLang(emp.office.fullName) || ""
          : "";
        const label = officeShort ? `${emp.fullName} (${officeShort})` : emp.fullName;
        return { label, value: emp.guid };
      }),
    [employees, selectedLang]
  );

  const currencySymbol = {
    USD: "$",
    EUR: "€",
    TMT: "m",
    RUB: "₽",
  }[currency] || currency;

  return (
    <CustomDialog open={open} close={handleClose} widthX={750}>
      <CustomDialogHeader variant="h5" title={t("outbound.addSale") || "Satyş goşmak"} />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={4}>
            <CustomDatePicker name="request_date" control={control} label={t("outbound.requestDate") || "Arza senesi"} required />
          </Grid>
          <Grid size={8}>
            <GlobalClientAutocomplete
              name="client_name"
              control={control}
              label={t("outbound.clientName") || "Müşderiniň ady"}
              columns={["fullName"]}
              required
              onClientChange={(client) => setSelectedClientObj(client)}
            />
          </Grid>
          <Grid size={6}>
            <CustomSelect name="operator_guid" control={control} label={t("outbound.operator") || "Operator"} options={employeeOptions} required />
          </Grid>
          <Grid size={6}>
            <CustomSelect name="prepared_by" control={control} label={t("outbound.preparedBy") || "Taýýarlan"} options={employeeOptions} required />
          </Grid>
          <Grid size={4}>
            <CustomSelect name="source" control={control} label={t("outbound.source") || "Ulgam"} options={SOURCE_OPTIONS} required />
          </Grid>

          <TransferFields control={control} />

          <Grid size={4}>
            <CurrencyAmount
              name="net_fare"
              control={control}
              label={t("outbound.cost") || "Bahasy (alnan)"}
              currency={currency}
              onCurrencyChange={(curr) => setValue("currency", curr)}
              required
            />
          </Grid>
          <Grid size={4}>
            <CustomTextField name="price" control={control} type="number" label={t("outbound.price") || "Satuw bahasy"} startIcon={currencySymbol} required />
          </Grid>
          <Grid size={12}>
            <CustomTextField name="note" control={control} label={t("outbound.note") || "Bellik"} multiline rows={2} />
          </Grid>
        </Grid>
        <FooterButton loading={isSubmitting} onCancel={handleClose} type="submit" sx={{ mt: 3 }} />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddTransferModal;
