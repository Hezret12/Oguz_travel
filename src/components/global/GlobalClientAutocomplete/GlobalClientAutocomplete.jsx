import { useMemo, useState, forwardRef } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import OverflowTooltipLabel from "../../OverflowTooltipLabel";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import AddIcon from "@mui/icons-material/Add";
import { ChevronDown } from "lucide-react";
import { Controller } from "react-hook-form";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { openAddClientModal } from "../../../store/slices/modalSlice";
import { getAllClientsApi } from "../../../api/queries/getters";
import { useDebounce } from "../../../hooks/useDebounce";

const DEFAULT_COLUMNS = ["fullName", "phone_number", "passport_number"];

const getResponseClients = (response) => response?.data?.data ?? [];
const normalizeClient = (client) => ({
  ...client,
  guid: client?.guid,
  fullName: client?.fullName || "",
  phone_number: client?.phone_number ?? "",
  passport_number: client?.passport_number ?? "",
});

const KEY_MAP = {
  phone_number: "phoneNumber",
  phoneNumber: "phoneNumber",
  passport_number: "passportNumber",
  passportNumber: "passportNumber",
  date_of_birth: "dateOfBirth",
  dateOfBirth: "dateOfBirth",
  dateofbirth: "dateOfBirth",
  passport_country: "passportCountryOfIssue",
  passportCountry: "passportCountryOfIssue",
  passportCountryOfIssue: "passportCountryOfIssue",
  passport_expiry_date: "passportExpiryDate",
  passportexpireDate: "passportExpiryDate",
  passportExpireDate: "passportExpiryDate",
  passportExpiryDate: "passportExpiryDate",
  passport_issue_date: "passportIssueDate",
  passportIssueDate: "passportIssueDate",
};

const formatDateValue = (value) => {
  if (!value) return "";
  const dateOnly = String(value).split("T")[0];
  const parts = dateOnly.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateOnly;
};

const resolveColumn = (column, t) => {
  if (typeof column === "string") {
    const rawKey = column;
    const translationKey = KEY_MAP[rawKey] || rawKey;
    const isDateField =
      translationKey === "dateOfBirth" ||
      translationKey === "passportExpiryDate" ||
      translationKey === "passportIssueDate";

    return {
      key: rawKey,
      propKey: translationKey,
      label: t(`columns.${translationKey}`, rawKey),
      format: isDateField ? formatDateValue : undefined,
    };
  }
  const rawKey = column.key;
  const translationKey = KEY_MAP[rawKey] || rawKey;
  const isDateField =
    translationKey === "dateOfBirth" ||
    translationKey === "passportExpiryDate" ||
    translationKey === "passportIssueDate";

  return {
    key: rawKey,
    propKey: translationKey,
    label: column.label ?? t(`columns.${translationKey}`, rawKey),
    format: column.format || (isDateField ? formatDateValue : undefined),
  };
};

const getColumnValue = (client, column, t) => {
  const { key, propKey, format } = resolveColumn(column, t);
  const rawValue =
    client?.[key] ??
    client?.[propKey] ??
    (key === "phone_number" ? client?.phoneNumber : undefined) ??
    (key === "passport_number" ? client?.passportNumber : undefined);

  if (format) return format(rawValue, client);
  // Stored as Male/Female; shown translated, as on the Clients page.
  if (key === "gender") {
    if (rawValue === "Female" || rawValue === "Women") return t("clients.genderWomen");
    if (rawValue === "Male" || rawValue === "Men") return t("clients.genderMen");
  }
  return rawValue ?? "";
};

const getClientSummary = (client, columns, t) =>
  columns
    .map((column) => getColumnValue(client, column, t))
    .filter(Boolean)
    .join(" | ");

const HighlightedText = ({ text, query }) => {
  const value = String(text ?? "");
  const normalizedQuery = query.trim();

  if (!normalizedQuery) return value || "-";

  const index = value
    .toLocaleLowerCase()
    .indexOf(normalizedQuery.toLocaleLowerCase());
  if (index < 0) return value || "-";

  return (
    <>
      {value.slice(0, index)}
      <Box
        component="mark"
        sx={{
          borderRadius: 0.5,
          px: 0.25,
          fontWeight: 700,
        }}
      >
        {value.slice(index, index + normalizedQuery.length)}
      </Box>
      {value.slice(index + normalizedQuery.length)}
    </>
  );
};

const COLUMN_FLEX = {
  fullName: "1.5 1 0%",
  phone_number: "1 1 0%",
  phoneNumber: "1 1 0%",
  passport_number: "1 1 0%",
  passportNumber: "1 1 0%",
  dateOfBirth: "1 1 0%",
  dateofbirth: "1 1 0%",
  date_of_birth: "1 1 0%",
  passportExpiryDate: "1 1 0%",
  passportexpireDate: "1 1 0%",
  passport_expiry_date: "1 1 0%",
  passportCountry: "1 1 0%",
  passportCountryOfIssue: "1 1 0%",
  passport_country: "1 1 0%",
};

const getColumnFlex = (key) => COLUMN_FLEX[key] || "1 1 0%";

const ClientOption = ({ client, columns, query, selected, t }) => (
  <Box
    sx={(theme) => ({
      display: "flex",
      alignItems: "center",
      gap: { xs: 1, sm: 1.5 },
      width: "100%",
      px: 1.5,
      py: 1,
      border: "1px solid",
      borderColor: selected ? "primary.main" : "transparent",
      borderRadius: 1.5,
      cursor: "pointer",
      backgroundColor: selected
        ? theme.palette.mode === "dark"
          ? "rgba(59, 130, 246, 0.08)"
          : "rgba(37, 99, 235, 0.06)"
        : "transparent",
      boxShadow: selected ? `0 0 0 1px ${theme.palette.primary.main}` : "none",
      transition:
        "background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
      "&:hover": {
        backgroundColor: selected
          ? theme.palette.mode === "dark"
            ? "rgba(59, 130, 246, 0.12)"
            : "rgba(37, 99, 235, 0.08)"
          : theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.04)"
            : "rgba(0, 0, 0, 0.03)",
        borderColor: selected ? "primary.main" : "divider",
      },
    })}
  >
    {columns.map((column, colIdx) => {
      const { key } = resolveColumn(column, t);
      const value = getColumnValue(client, column, t);

      return (
        <Box
          key={key ? `${key}-${colIdx}` : colIdx}
          sx={{
            flex: getColumnFlex(key),
            minWidth: 0,
          }}
        >
          <Typography
            component="span"
            variant="body2"
            noWrap
            sx={{
              display: "block",
              fontWeight: key === "fullName" ? 700 : 500,
            }}
          >
            <HighlightedText text={value} query={query} />
          </Typography>
        </Box>
      );
    })}
  </Box>
);

const ListboxWithHeader = forwardRef(function ListboxWithHeader(
  { children, columns: lbColumns, t: lbT, ...rest },
  ref,
) {
  delete rest.ownerState;
  return (
    // A custom listbox slot does not get MUI's own listbox styles, so the height
    // limit and scrolling are set here; without them the list runs off the screen.
    <ul
      ref={ref}
      {...rest}
      style={{
        listStyle: "none",
        margin: 0,
        maxHeight: "40vh",
        overflow: "auto",
        position: "relative",
        ...rest.style,
        padding: 0,
      }}
    >
      {lbColumns && lbColumns.length > 0 && (
        <Box
          component="li"
          aria-hidden
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            px: 2.5,
            py: 0.75,
            backgroundColor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            pointerEvents: "none",
          }}
        >
          {lbColumns.map((column, idx) => {
            const { key, label } = resolveColumn(column, lbT);
            return (
              <Typography
                key={key || idx}
                variant="caption"
                sx={{
                  flex: getColumnFlex(key),
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                  minWidth: 0,
                }}
              >
                {label}
              </Typography>
            );
          })}
        </Box>
      )}
      {children}
    </ul>
  );
});

const GlobalClientAutocompleteField = ({
  field,
  fieldState,
  clients,
  isLoading,
  label,
  placeholder,
  required,
  disabled,
  onClientChange,
  onAddClient,
  columns,
  sx,
  dispatch,
  t,
  inputValue,
  onInputValueChange,
  initialClient = null,
}) => {
  const [createdClient, setCreatedClient] = useState(initialClient);
  const [prevInitialClient, setPrevInitialClient] = useState(initialClient);

  if (initialClient !== prevInitialClient) {
    setPrevInitialClient(initialClient);
    setCreatedClient(initialClient);
  }

  const selectedClient =
    clients.find((client) => (client.guid) === field.value) ?? createdClient;

  const selectClient = (client) => {
    setCreatedClient(client);
    field.onChange(client?.guid ?? "");
    onClientChange?.(client ?? null);
    onInputValueChange(client ? getClientSummary(client, columns, t) : "");
  };

  const handleAddClient = () => {
    if (onAddClient) {
      onAddClient(inputValue);
      return;
    }

    dispatch(
      openAddClientModal({
        initialValues: { fullName: inputValue },
        onCreated: (created) => selectClient(normalizeClient(created)),
      }),
    );
  };

  const handleInputChange = (_, value, reason) => {
    if (reason === "input" || reason === "clear") {
      onInputValueChange(value);
    }
  };

  return (
    <>
      {label && (
        <OverflowTooltipLabel label={label} required={required} />
      )}
      <Autocomplete
        value={selectedClient}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        options={clients}
        loading={isLoading}
        disabled={disabled}
        clearOnBlur={false}
        autoHighlight
        popupIcon={<ChevronDown size={18} />}
        getOptionKey={(option) => option?.guid || getClientSummary(option, columns, t)}
        isOptionEqualToValue={(option, value) => (option?.guid) === (value?.guid)}
        getOptionLabel={(option) => getClientSummary(option, columns, t)}
        filterOptions={(options) => options}
        noOptionsText={
          !isLoading && (
            <Box
              sx={{
                py: 2.5,
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  color: "text.secondary",
                }}
              >
                <PersonSearchIcon sx={{ fontSize: 24 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {t("noClientFound")}
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddClient}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 2.5,
                  py: 0.75,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                {t("addClient")}
              </Button>
            </Box>
          )
        }
        onChange={(_, client) => selectClient(client)}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          delete optionProps.renderTags;
          delete optionProps.ownerState;
          const selected = optionProps["aria-selected"] === "true";
          const optionKey = option?.guid || option?.id || key;
          return (
            <li key={optionKey} {...optionProps} style={{ padding: "4px 8px", cursor: "pointer" }}>
              <ClientOption
                client={option}
                columns={columns}
                query={
                  selectedClient &&
                    inputValue === getClientSummary(selectedClient, columns, t)
                    ? ""
                    : inputValue
                }
                selected={selected}
                t={t}
              />
            </li>
          );
        }}
        renderInput={(params) => {
          const { slotProps: paramsSlotProps, ...textFieldProps } = params;
          delete textFieldProps.renderTags;
          delete textFieldProps.ownerState;

          return (
            <TextField
              {...textFieldProps}
              placeholder={placeholder}
              required={required}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              slotProps={{
                ...paramsSlotProps,
                input: {
                  ...paramsSlotProps?.input,
                  startAdornment: (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mr: 1,
                        }}
                      >
                        <PersonSearchIcon sx={{ fontSize: 20 }} />
                      </Box>
                      {paramsSlotProps?.input?.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {isLoading && (
                        <CircularProgress
                          color="inherit"
                          size={16}
                          aria-label={t("loading", "Loading")}
                        />
                      )}
                      {paramsSlotProps?.input?.endAdornment}
                    </>
                  ),
                },
                htmlInput: {
                  ...paramsSlotProps?.htmlInput,
                  "aria-label":
                    label ?? placeholder ?? t("columns.client"),
                },
              }}
            />
          );
        }}
        slots={{
          listbox: ListboxWithHeader,
        }}
        slotProps={{
          listbox: {
            columns,
            t,
          },
          paper: {
            sx: {
              mt: 0.75,
              p: 0.5,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              width: "max-content !important",
              minWidth: "100%",
              maxWidth: "min(100vw - 32px, 1000px)",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 10px 30px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.12)"
                  : "0 10px 28px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.08)",
              backgroundImage: "none",
            },
          },
        }}
        sx={{
          ...sx,
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            minHeight: "44px",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.03)"
                : "#ffffff",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            },
            "&.Mui-focused": {
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 0 0 3px rgba(59, 130, 246, 0.16)"
                  : "0 0 0 3px rgba(37, 99, 235, 0.12)",
            },
          },
          "& .MuiAutocomplete-input": { minWidth: 0 },
          "& .MuiFormHelperText-root": {
            position: "absolute",
            bottom: "-20px",
            left: 0,
            mx: 1,
            mt: 0,
            fontSize: "0.75rem",
            fontWeight: 500,
            lineHeight: 1.2,
          },
        }}
      />
    </>
  );
};

const GlobalAutoCompleteClient = ({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  onClientChange,
  onAddClient,
  columns = DEFAULT_COLUMNS,
  sx = {},
  initialClient = null,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [prevInitialClient, setPrevInitialClient] = useState(initialClient);
  const [inputValue, setInputValue] = useState(
    initialClient ? getClientSummary(initialClient, columns, t) : ""
  );

  if (initialClient !== prevInitialClient) {
    setPrevInitialClient(initialClient);
    setInputValue(initialClient ? getClientSummary(initialClient, columns, t) : "");
  }
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(inputValue, 400);
  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 20,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    }),
    [debouncedSearch],
  );
  const { data: response, isFetching } = useQuery({
    queryKey: ["clients", "autocomplete", queryParams],
    queryFn: () => getAllClientsApi(queryParams),
    enabled: isOpen,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  const clients = useMemo(() => {
    const items = getResponseClients(response);
    if (!Array.isArray(items)) return [];
    const normalized = items.map(normalizeClient);
    const seen = new Set();
    return normalized.filter((client, idx) => {
      const key = client?.guid || `${client?.fullName}-${client?.phone_number}-${idx}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [response]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Box onFocus={() => setIsOpen(true)}>
          <GlobalClientAutocompleteField
            field={field}
            fieldState={fieldState}
            clients={clients}
            isLoading={isFetching}
            label={label}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            onClientChange={onClientChange}
            onAddClient={onAddClient}
            columns={columns}
            sx={sx}
            dispatch={dispatch}
            t={t}
            inputValue={inputValue}
            onInputValueChange={setInputValue}
            initialClient={initialClient}
          />
        </Box>
      )}
    />
  );
};

export default GlobalAutoCompleteClient;
