import { useMemo, useEffect } from "react";
import { Box, MenuItem, Tooltip, Typography } from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";


import { useLocale } from "../../hooks/useLocale";
import { useValidShema } from "../../functions/useValidShema";
import { CustomDialog } from "../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../components/Dialog/CustomForm";
import CustomTextField from "../../components/CustomTextField";
import CustomSelect from "../../components/CustomSelect";
import FooterButton from "../../components/Dialog/FooterButton";
import GlobalClientAutocomplete from "../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete";
import { useGet } from "../../hooks/CRUD/useGet";
import { getAllPackageByIndexApi, getAllEmployeeApi } from "../../api/queries/getters";
import AgentAccordion from "../../components/global/AgentAccordion";
import CustomDatePicker from "../../components/CustomDatePicker";
import { useUpdate } from "../../hooks/CRUD/useUpdate";
import { updateVisaApi } from "../../api/queries/patch";

const EditVisaModal = ({ table, row }) => {
  const { t, selectedLang } = useLocale();
  const { addVisa } = useValidShema();

  // Fetch employees list
  const { data: employees = [] } = useGet({
    apiFn: getAllEmployeeApi,
    key: "employees",
  });

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
    [employees, selectedLang]
  );

  // Mutation to update Visa
  const { mutate: updateVisa, isPending: isSubmit } = useUpdate({
    apiFn: updateVisaApi,
    key: "visaApplications",
    idKey: "guid",
    onSuccessUpdate: () => {
      table.setEditingRow(null);
    },
  });

  // Form setup
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      guid: row?.original?.guid || null,
      index_number: row?.original?.index_number || "",
      datetime: row?.original?.datetime || dayjs().toISOString(),
      client_guid: row?.original?.client_guid || row?.original?.client?.guid || null,
      received_opr_guid: row?.original?.received_opr_guid || null,
      agent: {
        name: row?.original?.agent?.name || "",
        phone_number: row?.original?.agent?.phone_number || "",
      },
      package_guid: row?.original?.package_guid || null,
      service_guid: row?.original?.service_guid || null,
      hotel_booking_guid: row?.original?.hotel_booking_guid || null,
      translation_guid: row?.original?.translation_guid || null,
      courier_guid: row?.original?.courier_guid || null,
      price_tmt: row?.original?.price_tmt || 0,
      price_usd: row?.original?.price_usd || 0,
      note: row?.original?.note || "",
    },
    resolver: yupResolver(addVisa),
    mode: "onSubmit",
  });

  // Watch selected package values to automatically compute totals
  const selectedPackageGuid = useWatch({ control, name: "package_guid" });
  const selectedServiceGuid = useWatch({ control, name: "service_guid" });
  const selectedHotelGuid = useWatch({ control, name: "hotel_booking_guid" });
  const selectedTranslationGuid = useWatch({ control, name: "translation_guid" });
  const selectedCourierGuid = useWatch({ control, name: "courier_guid" });

  useEffect(() => {
    let tmtSum = 0;

    const selectedItems = [
      (mainPackages || []).find((p) => p.guid === selectedPackageGuid),
      (servicePackages || []).find((p) => p.guid === selectedServiceGuid),
      (hotelPackages || []).find((p) => p.guid === selectedHotelGuid),
      (translationPackages || []).find((p) => p.guid === selectedTranslationGuid),
      (courierPackages || []).find((p) => p.guid === selectedCourierGuid),
    ].filter(Boolean);

    selectedItems.forEach((item) => {
      const isSale = checkIsOnSale(item);
      const effectivePrice = isSale ? Number(item.sale_price) : Number(item.price);
      const priceVal = effectivePrice || 0;

      tmtSum += priceVal;
    });

    setValue("price_tmt", tmtSum);
  }, [
    selectedPackageGuid,
    selectedServiceGuid,
    selectedHotelGuid,
    selectedTranslationGuid,
    selectedCourierGuid,
    mainPackages,
    servicePackages,
    hotelPackages,
    translationPackages,
    courierPackages,
    setValue,
  ]);

  const closeDialog = () => {
    table.setEditingRow(null);
  };

  const submitHandler = (values) => {
    const payload = {
      ...values,
      price_tmt: Number(values.price_tmt || 0),
      price_usd: Number(values.price_usd || 0),
      agent:
        values.agent?.name || values.agent?.phone_number
          ? values.agent
          : null,
    };
    updateVisa(payload);
  };

  const autocompleteColumns = useMemo(
    () => [
      "fullName",
      "phone_number",
      { key: "passport_number", label: t("columns.passportNumber") || "Passport №" },
      { key: "dateOfBirth", label: t("columns.dateOfBirth") || "Doglan senesi" },
    ],
    [t]
  );

  const renderPackageOption = (item, option) => {
    const hasPrice = item?.price !== undefined && item?.price !== null;
    const hasDescription = Boolean(item?.description);
    const isOnSale = checkIsOnSale(item);

    return (
      <MenuItem
        key={option.id}
        value={option.id}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minWidth: "240px",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flexGrow: 1 }}>
          <Typography sx={{ fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {option.label}
          </Typography>
          {hasDescription && (
            <Tooltip
              title={item.description}
              arrow
              placement="top"
              slotProps={{
                tooltip: {
                  sx: {
                    fontSize: "0.8rem",
                    whiteSpace: "pre-line",
                    py: 0.75,
                    px: 1.25,
                    borderRadius: "6px",
                    maxWidth: 280,
                  },
                },
              }}
            >
              <HelpOutlineRoundedIcon
                sx={{
                  fontSize: "15px",
                  color: "text.secondary",
                  cursor: "help",
                  flexShrink: 0,
                  "&:hover": { color: "primary.main" },
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          )}
        </Box>

        {hasPrice && (
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, ml: 2, flexShrink: 0 }}>
            {isOnSale ? (
              <>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    textDecoration: "line-through",
                    color: "text.secondary",
                  }}
                >
                  {formatPrice(item.price, item.currency)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "error.main",
                  }}
                >
                  {formatPrice(item.sale_price, item.currency)}
                </Typography>
              </>
            ) : (
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {formatPrice(item.price, item.currency)}
              </Typography>
            )}
          </Box>
        )}
      </MenuItem>
    );
  };

  return (
    <CustomDialog widthX={860} open={true} close={closeDialog}>
      <CustomDialogHeader variant="h5" title={t("sidebar.visaApplications") || "Wiza arza"} />
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
              initialClient={row?.original?.client}
            />
          </Box>

          <CustomTextField
            name="index_number"
            control={control}
            label={t("columns.sortOrder") || "Index №"}
            required
          />

          <CustomDatePicker
            name="datetime"
            control={control}
            label={t("columns.dateTime") || "Sene we wagt"}
            showTime={true}
            required
          />

          <CustomSelect
            name="received_opr_guid"
            control={control}
            label={t("columns.operatorTwo") || "Kabul eden operator"}
            options={employeeOptions}
            required
          />

          <CustomSelect
            name="package_guid"
            control={control}
            label={t("sidebar.visa.packages") || "Bukja"}
            options={mainPackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <CustomSelect
            name="service_guid"
            control={control}
            label={t("columns.service") || "Hyzmat"}
            options={servicePackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <CustomSelect
            name="hotel_booking_guid"
            control={control}
            label={t("columns.hotelBron") || "Otel Bron"}
            options={hotelPackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <CustomSelect
            name="translation_guid"
            control={control}
            label={t("columns.translation") || "Terjime"}
            options={translationPackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <CustomSelect
            name="courier_guid"
            control={control}
            label={t("columns.courier") || "Kurer"}
            options={courierPackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <CustomTextField
            name="price_tmt"
            control={control}
            type="number"
            label={`${t("price") || "Baha"} (TMT)`}
            endIcon="TMT"
          />

          <CustomTextField
            name="price_usd"
            control={control}
            type="number"
            label={`${t("price") || "Baha"} (USD)`}
            endIcon="USD"
          />

          <Box sx={{ gridColumn: "span 2" }}>
            <AgentAccordion
              control={control}
              fullNameName="agent.name"
              phoneNumberName="agent.phone_number"
              title={t("columns.agent")}
              fullNameLabel={t("columns.agentFullName")}
              phoneNumberLabel={t("b2b.agentPhoneNumber") || "Agent Telefon"}
              inline
            />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <CustomTextField
              name="note"
              control={control}
              label={t("columns.note")}
            />
          </Box>
        </Box>

        <FooterButton loading={isSubmit} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default EditVisaModal;
