import { useMemo, useState, useCallback } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import OverflowTooltipLabel from "../../OverflowTooltipLabel";
import OverflowTooltipTypography from "../../OverflowTooltipTypography";
import { ChevronDown, User } from "lucide-react";
import { Controller } from "react-hook-form";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getAllEmployeeApi } from "../../../api/queries/getters";
import { useDebounce } from "../../../hooks/useDebounce";
import { useLocale } from "../../../hooks/useLocale";

const HighlightedText = ({ text, query }) => {
  const value = String(text ?? "");
  const normalizedQuery = (query || "").trim();

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
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(45, 212, 191, 0.3)"
              : "rgba(14, 133, 132, 0.2)",
          color: "inherit",
        }}
      >
        {value.slice(index, index + normalizedQuery.length)}
      </Box>
      {value.slice(index + normalizedQuery.length)}
    </>
  );
};

const getOfficeName = (office, selectedLang) => {
  if (!office) return "";
  if (typeof office === "string") return office;
  return (
    selectedLang(office.shortName) ||
    selectedLang(office.fullName) ||
    (typeof office.shortName === "string" ? office.shortName : "") ||
    (typeof office.fullName === "string" ? office.fullName : "") ||
    office.name ||
    ""
  );
};

const EmployeeOption = ({ employee, query, selected, selectedLang }) => {
  const officeName = getOfficeName(employee?.office, selectedLang);

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        width: "100%",
        px: 1.5,
        py: 0.85,
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: "8px",
        backgroundColor: selected
          ? theme.palette.mode === "dark"
            ? "rgba(45, 212, 191, 0.08)"
            : "rgba(14, 133, 132, 0.06)"
          : "transparent",
        transition: "all 150ms ease",
        gap: 0.35,
      })}
    >
      {/* Full Width Employee Name */}
      <OverflowTooltipTypography
        text={employee?.fullName || ""}
        variant="body2"
        sx={{
          fontWeight: 650,
          color: "text.primary",
          fontSize: "0.875rem",
          width: "100%",
        }}
      >
        <HighlightedText text={employee?.fullName} query={query} />
      </OverflowTooltipTypography>

      {/* Subtitle Row: Phone Number & Office Name Side-by-Side */}
      {(employee?.phone_number || officeName) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            noWrap
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
            }}
          >
            {employee?.phone_number || ""}
          </Typography>

          {officeName && (
            <OverflowTooltipTypography
              text={officeName}
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.75rem",
                fontWeight: 500,
                ml: "auto",
              }}
            >
              {officeName}
            </OverflowTooltipTypography>
          )}
        </Box>
      )}
    </Box>
  );
};

const EmployeeAutocompleteBase = ({
  value,
  onChange,
  onEmployeeChange,
  combinedOptions,
  formatEmployeeLabel,
  searchQuery,
  setSearchQuery,
  isFetching,
  disabled,
  handleListboxScroll,
  selectedLang,
  label,
  required,
  error,
  helperText,
  size = "medium",
  sx = {},
  t,
}) => {
  const selectedEmployee =
    combinedOptions.find((emp) => (emp?.guid || emp?.id) === value) || null;

  const isSmall = size === "small";

  return (
    <Box sx={{ width: "100%", ...sx }}>
      {label && (
        <OverflowTooltipLabel
          label={label}
          required={required}
          fontSize={isSmall ? "0.8125rem" : "0.875rem"}
        />
      )}
      <Autocomplete
        value={selectedEmployee}
        options={combinedOptions}
        loading={isFetching}
        disabled={disabled}
        size={size}
        clearOnBlur={false}
        autoHighlight
        popupIcon={<ChevronDown size={isSmall ? 16 : 18} />}
        getOptionKey={(option) =>
          option?.guid || option?.id || option?.fullName
        }
        isOptionEqualToValue={(option, val) =>
          (option?.guid || option?.id) === (val?.guid || val?.id)
        }
        getOptionLabel={(option) => formatEmployeeLabel(option)}
        filterOptions={(options) => options}
        onInputChange={(_, newInputValue, reason) => {
          if (reason === "input") {
            setSearchQuery(newInputValue);
          } else if (reason === "reset" || reason === "clear") {
            setSearchQuery("");
          }
        }}
        onChange={(_, employee) => {
          const guid = employee?.guid || employee?.id || "";
          onChange?.(guid);
          onEmployeeChange?.(employee || null);
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              marginTop: "6px",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 10px 30px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.12)"
                  : "0 10px 28px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.08)",
              backgroundImage: "none",
            },
          },
          listbox: {
            onScroll: handleListboxScroll,
          },
        }}
        noOptionsText={
          !isFetching && (
            <Box
              sx={{
                py: 2,
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  color: "text.secondary",
                }}
              >
                <User size={18} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.8125rem",
                }}
              >
                {t("noEmployeeFound")}
              </Typography>
            </Box>
          )
        }
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          delete optionProps.renderTags;
          delete optionProps.ownerState;
          const selected = optionProps["aria-selected"] === "true";
          const optionKey = option?.guid || option?.id || key;
          return (
            <Box
              component="li"
              key={optionKey}
              {...optionProps}
              sx={{ p: "4px 8px !important" }}
            >
              <EmployeeOption
                employee={option}
                query={searchQuery}
                selected={selected}
                selectedLang={selectedLang}
              />
            </Box>
          );
        }}
        renderInput={(params) => {
          const { slotProps: paramsSlotProps, ...textFieldProps } = params;
          delete textFieldProps.renderTags;
          delete textFieldProps.ownerState;

          return (
            <TextField
              {...textFieldProps}
              size={size}
              error={Boolean(error)}
              helperText={helperText}
              fullWidth
              slotProps={{
                ...paramsSlotProps,
                input: {
                  ...paramsSlotProps?.input,
                  endAdornment: (
                    <>
                      {isFetching && (
                        <CircularProgress
                          color="inherit"
                          size={16}
                          sx={{ mr: 1 }}
                        />
                      )}
                      {paramsSlotProps?.input?.endAdornment}
                    </>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: isSmall ? "8px" : "10px",
                  minHeight: isSmall ? "40px" : "44px",
                  height: isSmall ? "40px" : undefined,
                  fontSize: isSmall ? "0.875rem" : undefined,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "#ffffff",
                  transition: "all 0.2s ease-in-out",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
          );
        }}
      />
    </Box>
  );
};

export const GlobalEmployeeAutocomplete = ({
  name,
  control,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  initialEmployee = null,
  onEmployeeChange,
  size = "medium",
  error,
  helperText,
  sx = {},
  // Alternative list endpoint with the same response shape (e.g. a module
  // that only exposes its own scoped employees).
  apiFn = getAllEmployeeApi,
  queryKeyPrefix = "employees",
}) => {
  const { t, selectedLang } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [queryKeyPrefix, "autocomplete", debouncedSearch],
      queryFn: ({ pageParam = 1 }) =>
        apiFn({
          page: pageParam,
          limit: 40,
          ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        }),
      getNextPageParam: (lastPage, allPages) => {
        const responseBody = lastPage?.data;
        const meta = responseBody?.meta || responseBody?.data;
        const totalPages =
          meta?.totalPages ??
          responseBody?.totalPages ??
          responseBody?.data?.totalPages;
        const currentPage = allPages.length;
        if (totalPages && currentPage < totalPages) {
          return currentPage + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
      placeholderData: keepPreviousData,
      staleTime: 30_000,
    });

  const employees = useMemo(() => {
    if (!data?.pages) return [];
    const items = [];
    const seen = new Set();
    data.pages.forEach((page) => {
      const responseBody = page?.data;
      let pageItems = [];
      if (Array.isArray(responseBody?.data?.data)) {
        pageItems = responseBody.data.data;
      } else if (Array.isArray(responseBody?.data)) {
        pageItems = responseBody.data;
      } else if (Array.isArray(responseBody?.items)) {
        pageItems = responseBody.items;
      } else if (Array.isArray(responseBody)) {
        pageItems = responseBody;
      }
      pageItems.forEach((emp) => {
        const id = emp?.guid || emp?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          items.push(emp);
        }
      });
    });
    return items;
  }, [data]);

  const combinedOptions = useMemo(() => {
    if (!initialEmployee) return employees;
    const initialId = initialEmployee?.guid || initialEmployee?.id;
    if (!initialId) return employees;
    const exists = employees.some(
      (emp) => (emp?.guid || emp?.id) === initialId,
    );
    if (!exists) {
      return [initialEmployee, ...employees];
    }
    return employees;
  }, [employees, initialEmployee]);

  const formatEmployeeLabel = useCallback(
    (emp) => {
      if (!emp) return "";
      const off = getOfficeName(emp.office, selectedLang);
      return off ? `${emp.fullName} (${off})` : emp.fullName || "";
    },
    [selectedLang],
  );

  const handleListboxScroll = useCallback(
    (event) => {
      const listboxNode = event.currentTarget;
      if (
        listboxNode.scrollTop + listboxNode.clientHeight >=
        listboxNode.scrollHeight - 25
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <EmployeeAutocompleteBase
            value={field.value}
            onChange={field.onChange}
            onEmployeeChange={onEmployeeChange}
            combinedOptions={combinedOptions}
            formatEmployeeLabel={formatEmployeeLabel}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFetching={isFetching}
            disabled={disabled}
            handleListboxScroll={handleListboxScroll}
            selectedLang={selectedLang}
            label={label}
            placeholder={placeholder}
            required={required}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            size={size}
            sx={sx}
            t={t}
          />
        )}
      />
    );
  }

  return (
    <EmployeeAutocompleteBase
      value={value}
      onChange={onChange}
      onEmployeeChange={onEmployeeChange}
      combinedOptions={combinedOptions}
      formatEmployeeLabel={formatEmployeeLabel}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isFetching={isFetching}
      disabled={disabled}
      handleListboxScroll={handleListboxScroll}
      selectedLang={selectedLang}
      label={label}
      placeholder={placeholder}
      required={required}
      error={error}
      helperText={helperText}
      size={size}
      sx={sx}
      t={t}
    />
  );
};

export default GlobalEmployeeAutocomplete;
