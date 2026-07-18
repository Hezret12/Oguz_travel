import { useMemo, useEffect } from "react";
import { Box, MenuItem, Tooltip, Typography } from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";

const checkIsOnSale = (item) => {
  if (!item || !item.sale_price || Number(item.sale_price) <= 0) return false;
  if (!item.sale_start_date || !item.sale_end_date) return false;

  const parseLocalDate = (dateStr) => {
    if (typeof dateStr === "string") {
      if (dateStr.includes("T")) {
        const d = new Date(dateStr);
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      }
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2]),
        );
      }
    }
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = parseLocalDate(item.sale_start_date);
  start.setHours(0, 0, 0, 0);

  const end = parseLocalDate(item.sale_end_date);
  end.setHours(23, 59, 59, 999);

  return now >= start && now <= end;
};

const formatPrice = (price, currency = "TMT") => {
  const num = Number(price || 0);
  const parts = num.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const symbols = {
    USD: "$",
    EUR: "€",
    TMT: "m",
    RUB: "₽",
  };
  const symbol = symbols[currency] || currency;
  return `${parts[0]},${parts[1]} ${symbol}`;
};

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
import {
  getAllPackageByIndexApi,
  getAllEmployeeApi,
} from "../../api/queries/getters";
import AgentAccordion from "../../components/global/AgentAccordion";
import CustomDatePicker from "../../components/CustomDatePicker";
import { useCreate } from "../../hooks/CRUD/useCreate";
import { addVisaApi } from "../../api/queries/post";

const AddVisaModal = ({ table }) => {
  const { t, selectedLang } = useLocale();
  const { addVisa } = useValidShema();

  // Fetch package categories by their respective indices (1 to 5)
  const { data: mainPackages = [] } = useGet({
    apiFn: getAllPackageByIndexApi,
    key: "visa-packages-byindex",
    params: { index: 1 },
  });

  const { data: servicePackages = [] } = useGet({
    apiFn: getAllPackageByIndexApi,
    key: "visa-packages-byindex",
    params: { index: 2 },
  });

  const { data: hotelPackages = [] } = useGet({
    apiFn: getAllPackageByIndexApi,
    key: "visa-packages-byindex",
    params: { index: 3 },
  });

  const { data: translationPackages = [] } = useGet({
    apiFn: getAllPackageByIndexApi,
    key: "visa-packages-byindex",
    params: { index: 4 },
  });

  const { data: courierPackages = [] } = useGet({
    apiFn: getAllPackageByIndexApi,
    key: "visa-packages-byindex",
    params: { index: 5 },
  });

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
    [employees, selectedLang],
  );

  // Raw arrays are passed directly to CustomSelect to allow displaying price and description details.

  // Mutation to create Visa
  const { mutate: createVisa, isPending: isSubmit } = useCreate({
    apiFn: addVisaApi,
    key: "visaApplications",
    onSuccess: () => {
      table.setCreatingRow(null);
    },
  });

  // Form setup
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      index_number: "",
      datetime: dayjs().toISOString(),
      client_guid: null,
      received_opr_guid: null,
      agent: {
        name: "",
        phone_number: "",
      },
      package_guid: null,
      service_guid: null,
      hotel_booking_guid: null,
      translation_guid: null,
      courier_guid: null,
      price_tmt: 0,
      price_usd: 0,
      note: "",
    },
    resolver: yupResolver(addVisa),
    mode: "onSubmit",
  });

  // Watch selected package values to automatically compute totals
  const selectedPackageGuid = useWatch({ control, name: "package_guid" });
  const selectedServiceGuid = useWatch({ control, name: "service_guid" });
  const selectedHotelGuid = useWatch({ control, name: "hotel_booking_guid" });
  const selectedTranslationGuid = useWatch({
    control,
    name: "translation_guid",
  });
  const selectedCourierGuid = useWatch({ control, name: "courier_guid" });

  useEffect(() => {
    let tmtSum = 0;

    const selectedItems = [
      (mainPackages || []).find((p) => p.guid === selectedPackageGuid),
      (servicePackages || []).find((p) => p.guid === selectedServiceGuid),
      (hotelPackages || []).find((p) => p.guid === selectedHotelGuid),
      (translationPackages || []).find(
        (p) => p.guid === selectedTranslationGuid,
      ),
      (courierPackages || []).find((p) => p.guid === selectedCourierGuid),
    ].filter(Boolean);

    selectedItems.forEach((item) => {
      const isSale = checkIsOnSale(item);
      const effectivePrice = isSale
        ? Number(item.sale_price)
        : Number(item.price);
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
    table.setCreatingRow(null);
  };

  const submitHandler = (values) => {
    const payload = {
      ...values,
      price_tmt: Number(values.price_tmt || 0),
      price_usd: Number(values.price_usd || 0),
      // Set empty strings/nulls cleanly for optional objects if agent is empty
      agent:
        values.agent?.name || values.agent?.phone_number ? values.agent : null,
    };
    createVisa(payload);
  };

  const autocompleteColumns = useMemo(
    () => [
      "fullName",
      "phone_number",
      {
        key: "passport_number",
        label: t("columns.passportNumber") || "Passport №",
      },
      {
        key: "dateOfBirth",
        label: t("columns.dateOfBirth") || "Doglan senesi",
      },
    ],
    [t],
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            flexGrow: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
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
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1,
              ml: 2,
              flexShrink: 0,
            }}
          >
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
      <CustomDialogHeader
        variant="h5"
        title={t("sidebar.visaApplications") || "Wiza arza goşmak"}
      />
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
            label={t("columns.dateTime")}
            showTime={true}
            required
          />

          <CustomSelect
            name="received_opr_guid"
            control={control}
            label={t("columns.operatorTwo")}
            options={employeeOptions}
            required
          />

          <CustomSelect
            name="package_guid"
            control={control}
            label={t("sidebar.visa.packages")}
            options={mainPackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <CustomSelect
            name="service_guid"
            control={control}
            label={t("columns.service")}
            options={servicePackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <CustomSelect
            name="hotel_booking_guid"
            control={control}
            label={t("columns.hotelBron")}
            options={hotelPackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <CustomSelect
            name="translation_guid"
            control={control}
            label={t("columns.translation")}
            options={translationPackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <CustomSelect
            name="courier_guid"
            control={control}
            label={t("columns.courier")}
            options={courierPackages}
            getRowId={(item) => item.guid}
            getRowLabel={(item) => item.name}
            renderOption={renderPackageOption}
          />

          <AgentAccordion
            control={control}
            fullNameName="agent.name"
            phoneNumberName="agent.phone_number"
            title={t("columns.agent")}
            fullNameLabel={t("columns.agentFullName")}
            phoneNumberLabel={t("b2b.agentPhoneNumber")}
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

export default AddVisaModal;
