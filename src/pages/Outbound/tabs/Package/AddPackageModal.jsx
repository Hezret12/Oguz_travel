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
import { getAllEmployeeApi } from "../../../../api/queries/getters";
import { addPackageApi } from "../../../../api/queries/post";
import { PARTNER_OPTIONS, getPaymentOptions } from "../../constants";
import PackageFields from "./PackageFields";

const AddPackageModal = ({ open = true, onClose, table }) => {
  const { t, selectedLang } = useLocale();
  const { addOutbound } = useValidShema();
  const paymentOptions = useMemo(() => getPaymentOptions(t), [t]);

  const handleClose = () => {
    if (onClose) onClose();
    if (table) table.setCreatingRow(null);
  };

  const { data: employees = [], isLoading: isLoadingEmployees } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(addOutbound),
    defaultValues: {
      application_date: dayjs().format("YYYY-MM-DD"),
      opr_guid: "",
      client_name: "",
      prepared_opr_guid: "",
      destination_country: "",
      net_fare: 0,
      price: 0,
      currency: "USD",
      partner: "",
      note: "",
      is_paid: 2,
    },
  });

  const [selectedClientObj, setSelectedClientObj] = useState(null);
  const currency = useWatch({ control, name: "currency" }) || "USD";

  const { mutate: createPackage } = useCreate({
    apiFn: addPackageApi,
    key: ["outbound", "package"],
    onSuccess: () => {
      handleClose();
    },
  });

  const onSubmit = (data) => {
    const payload = {
      application_date: data.application_date
        ? new Date(data.application_date).toISOString()
        : new Date().toISOString(),
      opr_guid: data.opr_guid || null,
      client_guid:
        selectedClientObj?.guid ||
        (typeof data.client_name === "string" && data.client_name.length > 20
          ? data.client_name
          : null),
      prepared_opr_guid: data.prepared_opr_guid || null,
      destination_country: data.destination_country || "",
      net_fare: Number(data.net_fare || 0),
      price: Number(data.price || 0),
      currency: data.currency || "USD",
      partner: data.partner || "",
      note: data.note || "",
      is_paid: Number(data.is_paid) || 2,
    };
    createPackage(payload);
  };

  const employeeOptions = useMemo(
    () =>
      (employees || []).map((emp) => {
        const officeShort = emp.office?.shortName
          ? selectedLang(emp.office.shortName) ||
            selectedLang(emp.office.fullName) ||
            ""
          : "";
        const label = officeShort
          ? `${emp.fullName} (${officeShort})`
          : emp.fullName;
        return { label, value: emp.guid };
      }),
    [employees, selectedLang],
  );

  const currencySymbol =
    {
      USD: "$",
      EUR: "€",
      TMT: "m",
      RUB: "₽",
    }[currency] || currency;

  return (
    <CustomDialog open={open} close={handleClose} widthX={750}>
      <CustomDialogHeader
        variant="h5"
        title={t("outbound.addSale") || "Satyş goşmak"}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={4}>
            <CustomDatePicker
              name="application_date"
              control={control}
              label={t("outbound.requestDate") || "Arza senesi"}
              required
            />
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
            <CustomSelect
              name="opr_guid"
              control={control}
              label={t("outbound.operator")}
              options={employeeOptions}
              isLoading={isLoadingEmployees}
              required
            />
          </Grid>
          <Grid size={6}>
            <CustomSelect
              name="prepared_opr_guid"
              control={control}
              label={t("outbound.preparedBy")}
              options={employeeOptions}
              isLoading={isLoadingEmployees}
              required
            />
          </Grid>

          <Grid size={4}>
            <CustomSelect
              name="is_paid"
              control={control}
              label={t("columns.paymentStatus")}
              options={paymentOptions}
              required
            />
          </Grid>
          <Grid size={4}>
            <CurrencyAmount
              name="net_fare"
              control={control}
              label={t("columns.netFare")}
              currency={currency}
              onCurrencyChange={(curr) => setValue("currency", curr)}
              required
            />
          </Grid>
          <Grid size={4}>
            <CustomTextField
              name="price"
              control={control}
              type="number"
              label={t("outbound.price")}
              startIcon={currencySymbol}
              required
            />
          </Grid>

          <Grid size={6}>
            <CustomTextField
              name="partner"
              control={control}
              label={t("outbound.partner")}
              required
            />
          </Grid>

          <PackageFields control={control} />

          <Grid size={12}>
            <CustomTextField
              name="note"
              control={control}
              label={t("outbound.note")}
            />
          </Grid>
        </Grid>
        <FooterButton
          loading={isSubmitting}
          onCancel={handleClose}
          type="submit"
          sx={{ mt: 3 }}
        />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddPackageModal;
