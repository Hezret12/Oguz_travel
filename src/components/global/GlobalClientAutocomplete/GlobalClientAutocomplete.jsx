import { useMemo, useState, forwardRef } from "react";
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
import { Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useClientsQuery } from "../../../pages/Clients/hooks/useClientsQuery";
import ClientOption from "../ClientOption/ClientOption";
import { openAddClientModal } from "../../../store/slices/modalSlice";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim();

const matchesQuery = (client, query) => {
  if (!query) return true;
  const normalizedQuery = normalize(query);

  return [
    client.fullName,
    client.passportNumber,
    client.phoneNumber,
    client.clientId,
  ].some((value) => normalize(value).includes(normalizedQuery));
};

// eslint-disable-next-line no-unused-vars
const CustomListbox = forwardRef(({ children, ownerState, ...rest }, ref) => {
  return (
    <div ref={ref} {...rest}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "#f8fafc",
          borderBottom: "2px solid",
          borderColor: "divider",
          px: "16px",
          py: 1,
        }}
      >
        <ClientOption isHeader dense />
      </Box>

      {children}
    </div>
  );
});
CustomListbox.displayName = "CustomListbox";

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
  sx,
  dispatch,
  t,
}) => {
  const [inputValue, setInputValue] = useState("");

  const selectedClient =
    clients.find((client) => client.id === field.value) ?? null;
  const filteredClients = useMemo(
    () => clients.filter((client) => matchesQuery(client, inputValue)),
    [clients, inputValue],
  );

  const handleAddClient = () => {
    if (onAddClient) {
      onAddClient(inputValue);
      return;
    }

    dispatch(
      openAddClientModal({
        initialValues: {
          fullName: inputValue,
        },
        onCreated: (createdClient) => {
          field.onChange(createdClient?.id ?? "");
          onClientChange?.(createdClient ?? null);
          setInputValue(createdClient?.fullName ?? "");
        },
      }),
    );
  };

  return (
    <>
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 0.75,
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "text.primary",
          }}
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
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        options={filteredClients}
        loading={isLoading}
        disabled={disabled}
        clearOnBlur={false}
        autoHighlight
        popupIcon={<KeyboardArrowDownIcon />}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(option) => {
          if (!option) return "";
          const name = option.fullName ?? "";
          const id = option.clientId ? `ID: ${option.clientId}` : "";
          const passport = option.passportNumber
            ? `Pass: ${option.passportNumber}`
            : "";
          const phone = option.phoneNumber
            ? `Tel: +993 ${option.phoneNumber}`
            : "";
          return [name, id, passport, phone].filter(Boolean).join("  |  ");
        }}
        filterOptions={(options) => options}
        noOptionsText={
          <Box sx={{ py: 1.5, px: 1 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
              {t(
                "pages.clients.autocomplete.noClientFound",
                "No client found.",
              )}
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddClient}
              size="small"
              sx={{ textTransform: "none", px: 0, fontWeight: 700 }}
            >
              {t("pages.clients.autocomplete.addClient", "+ Add Client")}
            </Button>
          </Box>
        }
        onChange={(_, newClient) => {
          field.onChange(newClient?.id ?? "");
          onClientChange?.(newClient ?? null);
          setInputValue(newClient?.fullName ?? "");
        }}
        slots={{ listbox: CustomListbox }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <ClientOption client={option} dense />
            </li>
          );
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              placeholder={placeholder}
              required={required}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              slotProps={{
                ...params.slotProps,
                input: {
                  ...params.slotProps?.input,
                  startAdornment: (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mr: 1,
                          color: "text.secondary",
                        }}
                      >
                        <PersonSearchIcon sx={{ fontSize: 20 }} />
                      </Box>
                      {params.slotProps?.input?.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {isLoading ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : null}
                      {params.slotProps?.input?.endAdornment}
                    </>
                  ),
                },
              }}
            />
          );
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
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#ffffff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
            },
            "&.Mui-focused": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.02)"
                  : "#ffffff",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 0 0 3px rgba(59, 130, 246, 0.16)"
                  : "0 0 0 3px rgba(37, 99, 235, 0.12)",
            },
          },
          "& .MuiFormHelperText-root": {
            mx: 1,
            mt: 0.5,
            fontSize: "0.75rem",
            fontWeight: 500,
          },
        }}
      />
    </>
  );
};

const GlobalClientAutocomplete = ({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  onClientChange,
  onAddClient,
  sx = {},
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: clients = [], isLoading } = useClientsQuery();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <GlobalClientAutocompleteField
          field={field}
          fieldState={fieldState}
          clients={clients}
          isLoading={isLoading}
          label={label}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onClientChange={onClientChange}
          onAddClient={onAddClient}
          sx={sx}
          dispatch={dispatch}
          t={t}
        />
      )}
    />
  );
};

export default GlobalClientAutocomplete;
