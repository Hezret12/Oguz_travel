import { useState, useMemo, useCallback } from "react";
import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  Chip,
  Checkbox,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import { useInfiniteGet } from "../hooks/useInfiniteGet";
import { getAllUsersApi } from "../api/queries/getters";
import { useDebounce } from "../hooks/useDebounce";
import { useLocale } from "../hooks/useLocale";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// Chips rendered inside the input before collapsing the rest into "+N"
const MAX_VISIBLE_CHIPS = 3;
// Names listed in the "+N" tooltip before summarising the remainder
const MAX_TOOLTIP_NAMES = 12;

export default function AppUserAutocomplete({
  name,
  control,
  label,
  value: standaloneValue,
  onChange: standaloneOnChange,
  required = false,
  placeholder,
  fullWidth = true,
  size = "medium",
  disabled = false,
  multiple = true,
  initialOptions = [],
}) {
  const { t } = useLocale();

  // `inputValue` is what the field displays; `searchTerm` is what we query with.
  // They are split so MUI's internal resets (after a selection or a value change)
  // can't wipe what the user is typing or trigger a search for a selected label.
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);
  const trimmedSearch = debouncedSearch.trim();

  const {
    data: rawUsersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteGet({
    apiFn: getAllUsersApi,
    key: ["users", "autocomplete"],
    params: {
      limit: 40,
      search: trimmedSearch || undefined,
    },
  });

  // Keep a map of options to ensure selected items are preserved even if search changes
  const [selectedMap, setSelectedMap] = useState({});

  const fetchedOptions = useMemo(() => {
    let list = rawUsersData;
    if (!Array.isArray(list)) {
      if (Array.isArray(list?.data)) list = list.data;
      else if (Array.isArray(list?.data?.data)) list = list.data.data;
      else list = [];
    }

    return list.map((usr) => {
      const userGuid = usr?.guid || usr?.id;
      const emp = usr?.employee;
      const fullName =
        emp?.fullName ||
        usr?.fullName ||
        usr?.username ||
        usr?.phone_number ||
        "User";

      return {
        value: userGuid,
        userGuid: userGuid,
        employeeGuid: usr?.employee_guid || emp?.guid,
        label: fullName,
        name: fullName,
        phone: usr?.phone_number || emp?.phone_number || "",
        initials: (fullName || "User").slice(0, 2).toUpperCase(),
        color: "#0E8584",
      };
    });
  }, [rawUsersData]);

  // Every option we know about, used to resolve selected guids into chips.
  // `selectedMap` goes last so a selected option keeps a stable object identity.
  const knownOptions = useMemo(() => {
    const map = new Map();
    initialOptions.forEach((opt) => {
      if (opt?.value) map.set(opt.value, opt);
    });
    fetchedOptions.forEach((opt) => {
      if (opt?.value) map.set(opt.value, opt);
    });
    Object.values(selectedMap).forEach((opt) => {
      if (opt?.value) map.set(opt.value, opt);
    });
    return map;
  }, [fetchedOptions, initialOptions, selectedMap]);

  // Options shown in the dropdown. While searching, show only the server's
  // matches — previously selected users stay as chips but don't pollute results.
  const listOptions = useMemo(() => {
    if (trimmedSearch) return fetchedOptions;
    const map = new Map();
    initialOptions.forEach((opt) => {
      if (opt?.value) map.set(opt.value, opt);
    });
    Object.values(selectedMap).forEach((opt) => {
      if (opt?.value) map.set(opt.value, opt);
    });
    fetchedOptions.forEach((opt) => {
      if (opt?.value && !map.has(opt.value)) map.set(opt.value, opt);
    });
    return Array.from(map.values());
  }, [trimmedSearch, fetchedOptions, initialOptions, selectedMap]);

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
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const handleInputChange = useCallback(
    (_, newInputValue, reason) => {
      if (reason === "input") {
        setInputValue(newInputValue);
        setSearchTerm(newInputValue);
        return;
      }
      if (reason === "clear" || reason === "blur") {
        setInputValue(multiple ? "" : newInputValue);
        setSearchTerm("");
        return;
      }
      // "reset" / "selectOption" / "removeOption": in multiple mode keep the
      // typed search so several users can be picked from the same results.
      if (!multiple) {
        setInputValue(newInputValue);
        setSearchTerm("");
      }
    },
    [multiple]
  );

  const renderAutocompleteField = ({
    value,
    onChange,
    error,
    inputRef,
  }) => {
    const hasError = Boolean(error);
    const currentValues = Array.isArray(value) ? value : value ? [value] : [];

    const selectedValue = multiple
      ? currentValues.map((guid) => knownOptions.get(guid)).filter(Boolean)
      : knownOptions.get(value) || null;

    // A single-select value must exist in `options` or MUI warns.
    const options =
      !multiple && selectedValue && !listOptions.includes(selectedValue)
        ? [selectedValue, ...listOptions]
        : listOptions;

    const showSpinner = isLoading || isFetchingNextPage || (isFetching && Boolean(trimmedSearch));

    return (
      <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
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
          id={`${name || "user"}-autocomplete`}
          multiple={multiple}
          disableCloseOnSelect={multiple}
          openOnFocus
          disabled={disabled}
          options={options}
          value={selectedValue}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          filterOptions={(x) => x}
          popupIcon={<ChevronDown size={18} />}
          loading={isLoading || isFetchingNextPage}
          loadingText={t("loading")}
          noOptionsText={t("autocomplete.noUserFound")}
          getOptionKey={(option, index) =>
            option?.value ?? option?.userGuid ?? index
          }
          getOptionLabel={(option) => option.label || ""}
          isOptionEqualToValue={(option, val) =>
            option.value === (val?.value ?? val)
          }
          onChange={(_, newValue) => {
            if (multiple) {
              const selectedArr = Array.isArray(newValue) ? newValue : [];
              setSelectedMap((prev) => {
                const next = { ...prev };
                selectedArr.forEach((item) => {
                  if (item?.value) next[item.value] = item;
                });
                return next;
              });

              onChange(selectedArr.map((v) => v.value));
            } else {
              if (newValue?.value) {
                setSelectedMap((prev) => ({
                  ...prev,
                  [newValue.value]: newValue,
                }));
              }
              onChange(newValue ? newValue.value : "");
            }
          }}
          slotProps={{
            listbox: {
              onScroll: handleListboxScroll,
              style: { maxHeight: "240px", overflow: "auto" },
            },
          }}
          {...(multiple
            ? {
                renderValue: (selectedOptions, getItemProps) => {
                  const visible = selectedOptions.slice(0, MAX_VISIBLE_CHIPS);
                  const hidden = selectedOptions.slice(MAX_VISIBLE_CHIPS);

                  const chips = visible.map((opt, idx) => {
                    const { key: tagKey, ...tagProps } = getItemProps({ index: idx });
                    delete tagProps.ownerState;

                    return (
                      <Chip
                        {...tagProps}
                        key={tagKey || opt.value || idx}
                        label={opt.label}
                        size="small"
                        sx={{
                          borderRadius: "6px",
                          height: "24px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          maxWidth: "130px",
                          my: 0.25,
                          mr: 0.5,
                        }}
                      />
                    );
                  });

                  if (hidden.length > 0) {
                    const listed = hidden.slice(0, MAX_TOOLTIP_NAMES);
                    const rest = hidden.length - listed.length;

                    chips.push(
                      <Tooltip
                        key="__more__"
                        arrow
                        placement="top"
                        title={
                          <Box sx={{ py: 0.25 }}>
                            {listed.map((opt) => (
                              <Box key={opt.value} sx={{ fontSize: "0.75rem", lineHeight: 1.6 }}>
                                {opt.label}
                              </Box>
                            ))}
                            {rest > 0 && (
                              <Box sx={{ fontSize: "0.75rem", lineHeight: 1.6, opacity: 0.75, mt: 0.25 }}>
                                {t("autocomplete.moreSelected", { count: rest })}
                              </Box>
                            )}
                          </Box>
                        }
                      >
                        <Chip
                          label={`+${hidden.length}`}
                          size="small"
                          sx={{
                            borderRadius: "6px",
                            height: "24px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            my: 0.25,
                            mr: 0.5,
                            bgcolor: "action.selected",
                            color: "text.primary",
                            cursor: "default",
                          }}
                        />
                      </Tooltip>
                    );
                  }

                  return chips;
                },
              }
            : {})}
          renderOption={(optionProps, option, { selected, index }) => {
            const { key, ...cleanOptionProps } = optionProps;
            delete cleanOptionProps.ownerState;
            const optionKey =
              key ||
              option?.value ||
              `${option?.label || "opt"}-${index}`;

            return (
              <li key={optionKey} {...cleanOptionProps}>
                {multiple && (
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                )}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    {option.label}
                  </Typography>
                  {option.phone && (
                    <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                      {option.phone}
                    </Typography>
                  )}
                </Box>
              </li>
            );
          }}
          renderInput={(params) => {
            const { InputProps, slotProps: paramsSlotProps, ...otherParams } = params;
            delete otherParams.ownerState;

            return (
              <TextField
                {...otherParams}
                inputRef={inputRef}
                placeholder={
                  multiple &&
                  Array.isArray(selectedValue) &&
                  selectedValue.length > 0
                    ? ""
                    : placeholder
                }
                error={hasError}
                helperText={error?.message}
                fullWidth={fullWidth}
                size={size}
                slotProps={{
                  ...paramsSlotProps,
                  input: {
                    ...InputProps,
                    ...paramsSlotProps?.input,
                    endAdornment: (
                      <>
                        {showSpinner ? (
                          <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
                        ) : null}
                        {paramsSlotProps?.input?.endAdornment || InputProps?.endAdornment}
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
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    py: "4px",
                    // Keep room to type even when the row is full of chips
                    minWidth: "80px !important",
                  },
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
            );
          }}
        />
      </Box>
    );
  };

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ref }, fieldState: { error } }) =>
          renderAutocompleteField({ value, onChange, error, inputRef: ref })
        }
      />
    );
  }

  return renderAutocompleteField({
    value: standaloneValue,
    onChange: standaloneOnChange,
  });
}
