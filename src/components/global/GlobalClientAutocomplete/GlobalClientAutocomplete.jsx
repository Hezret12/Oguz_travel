import { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
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

const resolveColumn = (column, t) =>
  typeof column === "string"
    ? { key: column, label: t(`columns.${column}`, column) }
    : {
      key: column.key,
      label: column.label ?? t(`columns.${column.key}`, column.key),
      format: column.format,
    };

const getColumnValue = (client, column, t) => {
  const { key, format } = resolveColumn(column, t);
  const rawValue = client?.[key];

  if (format) return format(rawValue, client);
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

const ClientOption = ({ client, columns, query, selected, t }) => (
  <Box
    sx={(theme) => ({
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(${columns.length > 2 ? 130 : 190}px, 1fr))`,
      gap: { xs: 1, sm: 1.5 },
      width: "100%",
      px: 1.5,
      py: 1.25,
      border: "1px solid",
      borderColor: selected ? "primary.main" : "divider",
      borderRadius: 1.5,
      boxShadow: selected ? `0 0 0 1px ${theme.palette.primary.main}` : "none",
      transition:
        "background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
    })}
  >
    {columns.map((column, colIdx) => {
      const { key, label } = resolveColumn(column, t);
      const value = getColumnValue(client, column, t);

      return (
        <Box key={key ? `${key}-${colIdx}` : colIdx} sx={{ minWidth: 0 }}>
          <Typography
            component="span"
            variant="caption"
            sx={{
              display: "block",
              mb: 0.25,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </Typography>
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
    clients.find((client) => (client.guid || client.id) === field.value) ?? createdClient;

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
        <Typography
          variant="body2"
          sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.875rem" }}
        >
          {label}
          {required && (
            <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
          )}
        </Typography>
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
        getOptionKey={(option) => option?.guid || option?.id || getClientSummary(option, columns, t)}
        isOptionEqualToValue={(option, value) => (option?.guid || option?.id) === (value?.guid || value?.id)}
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
            <li key={optionKey} {...optionProps} style={{ padding: "4px 8px" }}>
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
                    label ?? placeholder ?? t("columns.client", "Client"),
                },
              }}
            />
          );
        }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              mt: 0.75,
              p: 0.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              width: "max-content !important",
              minWidth: "100%",
              maxWidth: "min(100vw - 32px, 1000px)",
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
      const key = client?.guid || client?.id || `${client?.fullName}-${client?.phone_number}-${idx}`;
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
