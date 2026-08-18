import { useState, useMemo, useCallback } from "react";
import {
  Autocomplete,
  Box,
  TextField,
  Typography,
  Chip,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import { useInfiniteGet } from "../hooks/useInfiniteGet";
import { getAllUsersApi } from "../api/queries/getters";
import { useDebounce } from "../hooks/useDebounce";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, 350);

  const {
    data: rawUsersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteGet({
    apiFn: getAllUsersApi,
    key: ["users", "autocomplete"],
    params: {
      limit: 40,
      search: debouncedSearch.trim() || undefined,
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

  // Combine fetched options with initial / preserved options
  const options = useMemo(() => {
    const map = new Map();
    initialOptions.forEach((opt) => {
      if (opt?.value) map.set(opt.value, opt);
    });
    Object.values(selectedMap).forEach((opt) => {
      if (opt?.value) map.set(opt.value, opt);
    });
    fetchedOptions.forEach((opt) => {
      if (opt?.value) map.set(opt.value, opt);
    });
    return Array.from(map.values());
  }, [fetchedOptions, initialOptions, selectedMap]);

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

  const renderAutocompleteField = ({
    value,
    onChange,
    error,
    inputRef,
  }) => {
    const hasError = Boolean(error);
    const currentValues = Array.isArray(value) ? value : value ? [value] : [];

    const selectedValue = multiple
      ? options.filter((opt) => currentValues.includes(opt.value))
      : options.find((opt) => opt.value === value) || null;

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
          filterOptions={(x) => x}
          popupIcon={<ChevronDown size={18} />}
          loading={isLoading || isFetchingNextPage}
          onInputChange={(_, newInputValue, reason) => {
            if (reason === "input" || reason === "clear") {
              setInputValue(newInputValue);
            }
          }}
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
              const newMap = { ...selectedMap };
              selectedArr.forEach((item) => {
                if (item?.value) newMap[item.value] = item;
              });
              setSelectedMap(newMap);

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
                renderTags: (selectedOptions, getTagProps) => {
                  return selectedOptions.map((opt, idx) => {
                    const tagProps = { ...getTagProps({ index: idx }) };
                    const tagKey = tagProps.key;
                    delete tagProps.key;
                    delete tagProps.renderTags;
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
                },
              }
            : {})}
          renderOption={(optionProps, option, { selected, index }) => {
            const { key, ...cleanOptionProps } = optionProps;
            delete cleanOptionProps.renderTags;
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
            delete otherParams.renderTags;
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
                        {isLoading || isFetchingNextPage ? (
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
