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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import { useInfiniteGet } from "../hooks/CRUD/useInfiniteGet";
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
  const debouncedSearch = useDebounce(inputValue, 400);

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

  const renderAutocompleteField = ({ value, onChange, error }) => {
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
          disabled={disabled}
          options={options}
          value={selectedValue}
          filterOptions={(x) => x} // Disable local filter so API search results dictate options
          popupIcon={<KeyboardArrowDownIcon />}
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
              // Preserve selected options into selectedMap
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
          renderTags={(selectedOptions, getTagProps) => {
            return selectedOptions.map((opt, idx) => {
              const tagProps = { ...getTagProps({ index: idx }) };
              const tagKey = tagProps.key;
              delete tagProps.key;

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
          }}
          renderOption={(optionProps, option, { selected, index }) => {
            const cleaned = { ...optionProps };
            const optionKey =
              cleaned.key ||
              option?.value ||
              `${option?.label || "opt"}-${index}`;
            delete cleaned.key;

            return (
              <li key={optionKey} {...cleaned}>
                {multiple && (
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                )}
                <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                  {option.label}
                </Typography>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
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
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading || isFetchingNextPage ? (
                      <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
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
                  mx: 1,
                  mt: 0.5,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                },
              }}
            />
          )}
        />
      </Box>
    );
  };

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) =>
          renderAutocompleteField({ value, onChange, error })
        }
      />
    );
  }

  return renderAutocompleteField({
    value: standaloneValue,
    onChange: standaloneOnChange,
  });
}
