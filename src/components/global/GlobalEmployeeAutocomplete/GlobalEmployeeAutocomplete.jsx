import { useMemo, useState, useCallback } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import { ChevronDown, Building2, User } from "lucide-react";
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
  const positionName =
    Array.isArray(employee?.positions) && employee.positions.length > 0
      ? selectedLang(employee.positions[0]?.name) ||
        employee.positions[0]?.name?.tk ||
        ""
      : "";

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        px: 1.5,
        py: 1,
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: "8px",
        backgroundColor: selected
          ? theme.palette.mode === "dark"
            ? "rgba(45, 212, 191, 0.08)"
            : "rgba(14, 133, 132, 0.06)"
          : "transparent",
        transition: "all 150ms ease",
        gap: 1.5,
      })}
    >
      {/* Left: Employee Details */}
      <Box
        sx={{
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
        }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: 650,
            color: "text.primary",
            fontSize: "0.875rem",
          }}
        >
          <HighlightedText text={employee?.fullName} query={query} />
        </Typography>

        {(positionName || employee?.phone_number) && (
          <Typography
            variant="caption"
            noWrap
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
            }}
          >
            {positionName
              ? `${positionName}${
                  employee?.phone_number ? ` • ${employee.phone_number}` : ""
                }`
              : employee?.phone_number}
          </Typography>
        )}
      </Box>

      {/* Right: Office Name */}
      {officeName && (
        <Chip
          icon={<Building2 size={12} />}
          label={officeName}
          size="small"
          variant="outlined"
          sx={{
            ml: "auto",
            flexShrink: 0,
            fontWeight: 600,
            fontSize: "0.75rem",
            height: "24px",
            borderRadius: "6px",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.12)",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.04)"
                : "rgba(0, 0, 0, 0.02)",
            "& .MuiChip-icon": {
              color: "primary.main",
            },
          }}
        />
      )}
    </Box>
  );
};

export const GlobalEmployeeAutocomplete = ({
  name,
  control,
  label,
  placeholder,
  required = false,
  disabled = false,
  initialEmployee = null,
  onEmployeeChange,
  sx = {},
}) => {
  const { t, selectedLang } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["employees", "autocomplete", debouncedSearch],
    queryFn: ({ pageParam = 1 }) =>
      getAllEmployeeApi({
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

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedEmployee =
          combinedOptions.find(
            (emp) => (emp?.guid || emp?.id) === field.value,
          ) || null;

        return (
          <Box sx={{ width: "100%", ...sx }}>
            {label && (
              <Tooltip title={label} arrow placement="top-start">
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    mb: 0.75,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "default",
                  }}
                >
                  {label}
                  {required && (
                    <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                  )}
                </Typography>
              </Tooltip>
            )}
            <Autocomplete
              value={selectedEmployee}
              options={combinedOptions}
              loading={isFetching}
              disabled={disabled}
              clearOnBlur={false}
              autoHighlight
              popupIcon={<ChevronDown size={18} />}
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
                field.onChange(guid);
                onEmployeeChange?.(employee || null);
              }}
              slotProps={{
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
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.03)",
                        color: "text.secondary",
                      }}
                    >
                      <User size={20} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      {t("noEmployeeFound", "Işgär tapylmady")}
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
                    placeholder={
                      placeholder || t("selectEmployee", "Işgär saýlaň...")
                    }
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
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
                        borderRadius: "10px",
                        minHeight: "44px",
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.03)"
                            : "#ffffff",
                        transition: "all 0.2s ease-in-out",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
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
      }}
    />
  );
};

export default GlobalEmployeeAutocomplete;
