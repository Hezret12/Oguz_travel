import { forwardRef, useCallback, useMemo, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Button,
} from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDebounce } from "../../../hooks/useDebounce";
import { getCustomFieldsApi } from "../../../api/queries/getters";
import { useLocale } from "../../../hooks/useLocale";
import { CreateCustomFieldModal } from "../CustomFieldsTab/CreateCustomFieldModal";
import {
  findMatchingCatalogField,
  normalizeFieldString,
} from "../../../functions/visaCountryFieldConfigs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getItemKey = (item) => item?.guid || item?.fieldKey;

const CleanRoot = forwardRef(function CleanRoot(props, ref) {
  const { renderTags, ownerState, PaperProps, ...domProps } = props;
  return <div ref={ref} {...domProps} />;
});

// ─── ReorderableFieldItem ─────────────────────────────────────────────────────

const ReorderableFieldItem = ({ index, total, label, onMoveUp, onMoveDown, onRemove }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 1.5,
      py: 0.7,
      borderRadius: "8px",
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: "background.paper",
      boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.03)",
      transition: "all 0.18s ease-in-out",
      "&:hover": {
        backgroundColor: "action.hover",
        borderColor: "primary.main",
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.06)",
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
      <DragIndicatorIcon sx={{ fontSize: 18, color: "text.disabled", cursor: "grab" }} />
      <Chip
        label={`#${index + 1}`}
        size="small"
        color="primary"
        sx={{ height: 22, fontWeight: 700, fontSize: "0.7rem", borderRadius: "6px" }}
      />
      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
        {label}
      </Typography>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
      <Tooltip title="Ýokary süýşür (Move Up)">
        <span>
          <IconButton
            size="small"
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            sx={{ p: 0.4, borderRadius: "6px" }}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Aşak süýşür (Move Down)">
        <span>
          <IconButton
            size="small"
            disabled={index === total - 1}
            onClick={() => onMoveDown(index)}
            sx={{ p: 0.4, borderRadius: "6px" }}
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Poz (Remove)">
        <IconButton
          size="small"
          color="error"
          onClick={() => onRemove(index)}
          sx={{ p: 0.4, borderRadius: "6px" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

// ─── CountryFieldSelector ─────────────────────────────────────────────────────

export const CountryFieldSelector = ({ control, name = "fields" }) => {
  const { t } = useLocale();

  // Create-field modal state
  const [candidateString, setCandidateString] = useState(null);
  const [pendingUpdateFn, setPendingUpdateFn] = useState(null);

  // Pagination & search state
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  // Accumulated fields for infinite scroll
  const [accumulatedFields, setAccumulatedFields] = useState([]);

  // ── React 19 in-render state adjustment: reset page on search change ──
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevSearch) {
    setPrevSearch(debouncedSearch);
    setPage(1);
  }

  // ── Fetch current page ──
  const { data: pageData = [], isLoading, isFetching, pageCount } = usePagginationGet({
    apiFn: getCustomFieldsApi,
    key: "customFields",
    params: { limit: 20, page, search: debouncedSearch || undefined },
  });

  // ── React 19 in-render state adjustment: accumulate pages ──
  const [prevDataKey, setPrevDataKey] = useState("");
  const currentDataKey = `${debouncedSearch}_${page}_${pageData?.length ?? 0}_${pageData?.[0]?.guid ?? ""}`;

  if (currentDataKey !== prevDataKey) {
    setPrevDataKey(currentDataKey);
    if (Array.isArray(pageData)) {
      if (page === 1) {
        setAccumulatedFields(pageData);
      } else if (pageData.length > 0) {
        setAccumulatedFields((prev) => {
          const existing = new Set(prev.map(getItemKey));
          const unique = pageData.filter((item) => !existing.has(getItemKey(item)));
          return [...prev, ...unique];
        });
      }
    }
  }

  // ── Watch field value at top level (Rule 13: useWatch, not watch) ──
  const fieldValue = useWatch({ control, name, defaultValue: [] });

  // ── Merge fetched options with already-selected values ──
  const mergedOptions = useMemo(() => {
    const list = Array.isArray(accumulatedFields) ? [...accumulatedFields] : [];
    if (Array.isArray(fieldValue)) {
      const existingKeys = new Set(list.map(getItemKey));
      fieldValue.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          const key = getItemKey(item);
          if (key && !existingKeys.has(key)) {
            list.push(item);
            existingKeys.add(key);
          }
        }
      });
    }
    return list;
  }, [accumulatedFields, fieldValue]);

  // ── Label resolver ──
  const getFieldLabel = useCallback((item) => {
    if (typeof item === "string") return item;
    return item.field_label?.tk || item.fieldKey || "";
  }, []);

  // ── Local + server filter ──
  const customFilterOptions = useCallback((options, state) => {
    const rawQuery = state.inputValue?.trim();
    const query = normalizeFieldString(rawQuery);
    if (!query) return options;

    const filtered = options.filter((option) => {
      if (typeof option === "string") {
        return normalizeFieldString(option).includes(query);
      }
      return (
        normalizeFieldString(option.fieldKey || option.guid).includes(query) ||
        normalizeFieldString(option.field_label?.tk).includes(query) ||
        normalizeFieldString(option.field_label?.ru).includes(query) ||
        normalizeFieldString(option.field_label?.en).includes(query) ||
        normalizeFieldString(option.field_type).includes(query)
      );
    });

    const hasExact = filtered.some((opt) => {
      if (typeof opt === "string") return normalizeFieldString(opt) === query;
      return (
        normalizeFieldString(opt.fieldKey || opt.guid) === query ||
        normalizeFieldString(opt.field_label?.tk) === query ||
        normalizeFieldString(opt.field_label?.ru) === query ||
        normalizeFieldString(opt.field_label?.en) === query
      );
    });

    if (!hasExact && rawQuery) {
      filtered.push(rawQuery);
    }

    return filtered;
  }, []);

  // ── Scroll handler for infinite loading ──
  const handleListboxScroll = useCallback(
    (event) => {
      const node = event.currentTarget;
      const isBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 25;
      if (isBottom && page < pageCount && !isFetching && !isLoading) {
        setPage((p) => p + 1);
      }
    },
    [page, pageCount, isFetching, isLoading]
  );

  // ── Autocomplete input change handler ──
  const handleInputChange = useCallback((_, value, reason) => {
    if (reason === "input" || reason === "clear") {
      setSearchInput(value);
    }
  }, []);

  // ── Option equality ──
  const isOptionEqual = useCallback((option, val) => {
    if (typeof option === "string" || typeof val === "string") {
      return normalizeFieldString(option) === normalizeFieldString(val);
    }
    if (option.guid && val.guid) return option.guid === val.guid;
    return option.fieldKey === val.fieldKey;
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      render={({ field: { onChange, value = [] }, fieldState: { error } }) => {
        const selectedCount = value?.length || 0;

        const handleMoveUp = (index) => {
          if (index <= 0) return;
          const arr = [...value];
          [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
          onChange(arr);
        };

        const handleMoveDown = (index) => {
          if (index >= value.length - 1) return;
          const arr = [...value];
          [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
          onChange(arr);
        };

        const handleRemove = (index) => onChange(value.filter((_, i) => i !== index));
        const handleClearAll = () => onChange([]);

        const handleChange = (_, newValue) => {
          const nextList = [];
          let freeSoloStr = null;

          (newValue || []).forEach((item) => {
            if (typeof item === "string") {
              const match = findMatchingCatalogField(item, accumulatedFields);
              if (match) {
                nextList.push(match);
              } else {
                freeSoloStr = item;
              }
            } else {
              nextList.push(item);
            }
          });

          if (freeSoloStr) {
            setCandidateString(freeSoloStr);
            setPendingUpdateFn(() => (newFieldObj) => onChange([...nextList, newFieldObj]));
          } else {
            onChange(nextList);
          }
        };

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
                {t("customFields.title")}
              </Typography>
              {selectedCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={`${selectedCount} saýlandy`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ borderRadius: "6px", fontWeight: 600, fontSize: "0.75rem" }}
                  />
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteSweepIcon style={{ fontSize: 16 }} />}
                    onClick={handleClearAll}
                    sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.2, px: 0.8, minWidth: "auto" }}
                  >
                    {t("clearAll")}
                  </Button>
                </Box>
              )}
            </Box>

            {/* Autocomplete */}
            <Autocomplete
              multiple
              freeSolo
              disableCloseOnSelect
              slots={{ root: CleanRoot }}
              options={mergedOptions}
              loading={isLoading || isFetching}
              inputValue={searchInput}
              onInputChange={handleInputChange}
              ListboxProps={{ onScroll: handleListboxScroll }}
              filterOptions={customFilterOptions}
              getOptionLabel={getFieldLabel}
              isOptionEqualToValue={isOptionEqual}
              value={value}
              onChange={handleChange}
              renderOption={(props, option, { selected }) => {
                const { key: optionKey, ...otherProps } = props;
                const isNew = typeof option === "string";
                const label = getFieldLabel(option);
                const fieldType = option.field_type || "text";

                if (isNew) {
                  return (
                    <Box
                      component="li"
                      key={optionKey || `new-${option}`}
                      {...otherProps}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        borderRadius: "6px",
                        my: 0.2,
                        color: "primary.main",
                        fontWeight: 600,
                        backgroundColor: "action.hover",
                        "&:hover": { backgroundColor: "action.selected" },
                      }}
                    >
                      <AddBoxOutlinedIcon color="primary" fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                        + {t("customFields.addTitle")}: "{option}"
                      </Typography>
                    </Box>
                  );
                }

                return (
                  <Box
                    component="li"
                    key={optionKey || option.guid || option.fieldKey || label}
                    {...otherProps}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1.5,
                      py: 1,
                      gap: 1.5,
                      borderRadius: "6px",
                      my: 0.2,
                      backgroundColor: selected ? "action.selected" : "transparent",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                      {selected ? (
                        <CheckCircleOutlinedIcon color="primary" sx={{ fontSize: 18 }} />
                      ) : (
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "1.5px solid",
                            borderColor: "divider",
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: selected ? 600 : 400, color: "text.primary" }}
                      >
                        {label}
                      </Typography>
                    </Box>
                    <Chip
                      label={String(fieldType).toUpperCase()}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        borderRadius: "4px",
                        backgroundColor: fieldType === "date" ? "info.soft" : "action.hover",
                        color: "text.secondary",
                      }}
                    />
                  </Box>
                );
              }}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => {
                  const isNew = typeof option === "string";
                  const label = getFieldLabel(option);
                  const tagProps = { ...getTagProps({ index }) };
                  const tagKey = tagProps.key;
                  delete tagProps.key;
                  delete tagProps.renderTags;
                  delete tagProps.ownerState;

                  return (
                    <Chip
                      key={tagKey || `tag-${getItemKey(option) || option}-${index}`}
                      {...tagProps}
                      label={label}
                      size="small"
                      icon={
                        isNew ? (
                          <AddBoxOutlinedIcon style={{ fontSize: 16 }} />
                        ) : (
                          <CheckCircleOutlinedIcon style={{ fontSize: 16 }} />
                        )
                      }
                      color={isNew ? "secondary" : "primary"}
                      variant={isNew ? "outlined" : "filled"}
                      sx={{
                        borderRadius: "8px",
                        fontWeight: 500,
                        fontSize: "0.8rem",
                        maxWidth: "100%",
                        my: "2px",
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      }}
                    />
                  );
                })
              }
              renderInput={(params) => {
                const { slotProps: paramsSlotProps, ...textFieldProps } = params;
                return (
                  <TextField
                    {...textFieldProps}
                    placeholder="Meýdança saýlaň ýa-da gözleň..."
                    error={Boolean(error)}
                    helperText={error?.message || "Ýurt üçin meýdançalary saýlaň."}
                    slotProps={{
                      ...paramsSlotProps,
                      input: {
                        ...paramsSlotProps?.input,
                        endAdornment: (
                          <>
                            {(isLoading || isFetching) && (
                              <CircularProgress color="inherit" size={20} />
                            )}
                            {paramsSlotProps?.input?.endAdornment}
                          </>
                        ),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "6px",
                        maxHeight: selectedCount > 3 ? "160px" : "none",
                        overflowY: selectedCount > 3 ? "auto" : "visible",
                        py: 1,
                        px: 1.5,
                        alignContent: "flex-start",
                      },
                    }}
                  />
                );
              }}
            />

            {/* Reorderable selected list */}
            {selectedCount > 0 && (
              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary", px: 0.5 }}
                >
                  Saýlanan meýdançalaryň sıralamasy:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.8,
                    maxHeight: 240,
                    overflowY: "auto",
                    backgroundColor: "action.hover",
                    borderColor: "divider",
                  }}
                >
                  {value.map((item, index) => (
                    <ReorderableFieldItem
                      key={
                        typeof item === "string"
                          ? `reorder-${item}-${index}`
                          : `reorder-${getItemKey(item) || index}-${index}`
                      }
                      index={index}
                      total={value.length}
                      label={getFieldLabel(item)}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      onRemove={handleRemove}
                    />
                  ))}
                </Paper>
              </Box>
            )}

            {/* Create custom field modal */}
            {Boolean(candidateString) && (
              <CreateCustomFieldModal
                open={true}
                candidateString={candidateString}
                onClose={() => {
                  setCandidateString(null);
                  setPendingUpdateFn(null);
                }}
                onSave={(newFieldObj) => {
                  pendingUpdateFn?.(newFieldObj);
                  setCandidateString(null);
                  setPendingUpdateFn(null);
                }}
              />
            )}
          </Box>
        );
      }}
    />
  );
};

export default CountryFieldSelector;
