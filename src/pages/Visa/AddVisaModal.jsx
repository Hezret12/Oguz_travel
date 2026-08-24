import { useMemo, useEffect } from "react";
import { Box, MenuItem, Tooltip, Typography } from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";


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
      price_tmt: 0,
      price_usd: 0,
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
      price_tmt: Number(values.price_tmt || 0),
      price_usd: Number(values.price_usd || 0),
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
        label: t("columns.passportNumber"),
      },
      {
        key: "dateOfBirth",
        label: t("columns.dateOfBirth"),
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
        title={t("sidebar.visaApplications")}
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
            label={`${t("price")} (TMT)`}
            endIcon="TMT"
          />

          <CustomTextField
            name="price_usd"
            control={control}
            type="number"
            label={`${t("price")} (USD)`}
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
