import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
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
  alpha,
} from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import SearchIcon from "@mui/icons-material/Search";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useDebounce } from "../../../hooks/useDebounce";
import { getCustomFieldsApi } from "../../../api/queries/getters";
import { useLocale } from "../../../hooks/useLocale";
import { CreateCustomFieldModal } from "../CustomFieldsTab/CreateCustomFieldModal";
import {
  findMatchingCatalogField,
  normalizeFieldString,
} from "../../../functions/visaCountryFieldConfigs";

const getItemKey = (item) => item?.guid || item?.fieldKey;

/** Custom root slot — strips non-DOM props MUI Autocomplete leaks */
const AutocompleteRoot = forwardRef(function AutocompleteRoot(props, ref) {
  const domProps = { ...props };
  delete domProps.renderTags;
  delete domProps.ownerState;
  delete domProps.ListboxProps;
  return <div ref={ref} {...domProps} />;
});

/* ── Draggable selected-field row ─────────────────────────────────── */
const SelectedFieldItem = ({
  index,
  label,
  fieldType,
  onRemove,
  isDragging,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
}) => (
  <Box
    draggable
    onDragStart={(e) => onDragStart(e, index)}
    onDragOver={(e) => onDragOver(e, index)}
    onDragEnd={onDragEnd}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 1.5,
      py: 0.6,
      borderRadius: "8px",
      border: "1px solid",
      borderColor: dragOverIndex === index ? "primary.main" : "divider",
      backgroundColor: isDragging ? "action.selected" : "background.paper",
      boxShadow: isDragging
        ? "0 4px 12px rgba(0,0,0,0.12)"
        : "0 1px 2px rgba(0,0,0,0.03)",
      opacity: isDragging ? 0.55 : 1,
      cursor: "grab",
      transition: "all 0.15s ease",
      "&:hover": {
        backgroundColor: "action.hover",
        borderColor: "primary.light",
      },
      "&:active": { cursor: "grabbing" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
      <DragIndicatorIcon sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }} />
      <Chip
        label={index + 1}
        size="small"
        color="primary"
        sx={{
          height: 20,
          minWidth: 20,
          fontWeight: 700,
          fontSize: "0.7rem",
          borderRadius: "6px",
          flexShrink: 0,
          "& .MuiChip-label": { px: 0.6 },
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "text.primary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
      {fieldType && (
        <Chip
          label={String(fieldType).toUpperCase()}
          size="small"
          sx={{
            height: 18,
            fontSize: "0.6rem",
            fontWeight: 700,
            borderRadius: "4px",
            backgroundColor: fieldType === "date" ? "info.main" : "action.hover",
            color: fieldType === "date" ? "info.contrastText" : "text.secondary",
            flexShrink: 0,
            "& .MuiChip-label": { px: 0.5 },
          }}
        />
      )}
    </Box>
    <Tooltip title="Poz" arrow>
      <IconButton
        size="small"
        color="error"
        onClick={() => onRemove(index)}
        sx={{ p: 0.3, ml: 0.5, flexShrink: 0 }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  </Box>
);

/* ═══════════════════════════════════════════════════════════════════ */
/*  CountryFieldSelector                                              */
/* ═══════════════════════════════════════════════════════════════════ */
export const CountryFieldSelector = ({ control, name = "fields" }) => {
  const { t } = useLocale();

  const [candidateString, setCandidateString] = useState(null);
  const [pendingUpdateFn, setPendingUpdateFn] = useState(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  const [accumulatedFields, setAccumulatedFields] = useState([]);

  /* Reset page on search change (React 19-safe in-render state adjustment) */
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevSearch) {
    setPrevSearch(debouncedSearch);
    setPage(1);
  }

  const { data: pageData = [], isLoading, isFetching, pageCount } = usePagginationGet({
    apiFn: getCustomFieldsApi,
    key: "customFields",
    params: { limit: 20, page, search: debouncedSearch || undefined },
  });

  /* Accumulate pages (React 19-safe) */
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

  const fieldValue = useWatch({ control, name, defaultValue: [] });

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

  const getFieldLabel = useCallback((item) => {
    if (typeof item === "string") return item;
    return item.field_label?.tk || item.fieldKey || "";
  }, []);

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

  const handleListboxScroll = useCallback(
    (event) => {
      const node = event.currentTarget;
      const isBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 25;
      if (isBottom && page < pageCount && !isFetching && !isLoading) {
        setPage((p) => p + 1);
      }
    },
    [page, pageCount, isFetching, isLoading],
  );

  const handleInputChange = useCallback((_, value, reason) => {
    if (reason === "input" || reason === "clear") {
      setSearchInput(value);
    }
  }, []);

  const isOptionEqual = useCallback((option, val) => {
    if (typeof option === "string" || typeof val === "string") {
      return normalizeFieldString(option) === normalizeFieldString(val);
    }
    if (option.guid && val.guid) return option.guid === val.guid;
    return option.fieldKey === val.fieldKey;
  }, []);

  const dragIndexRef = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      render={({ field: { onChange, value = [] }, fieldState: { error } }) => {
        const selectedCount = value?.length || 0;

        const handleDragStart = (e, index) => {
          dragIndexRef.current = index;
          e.dataTransfer.effectAllowed = "move";
        };
        const handleDragOver = (e, index) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (dragOverIndex !== index) setDragOverIndex(index);
        };
        const handleDragEnd = () => {
          const fromIndex = dragIndexRef.current;
          const toIndex = dragOverIndex;
          dragIndexRef.current = null;
          setDragOverIndex(null);
          if (fromIndex == null || toIndex == null || fromIndex === toIndex) return;
          const arr = [...value];
          const [moved] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, moved);
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              border: "1px solid",
              borderColor: error ? "error.main" : "divider",
              borderRadius: "12px",
              p: 2,
              backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
            }}
          >
            {/* ── Header ──────────────────────────────────────────── */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {t("customFields.title")}
                </Typography>
                {selectedCount > 0 && (
                  <Chip
                    label={selectedCount}
                    size="small"
                    color="primary"
                    sx={{
                      height: 22,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      borderRadius: "6px",
                      "& .MuiChip-label": { px: 0.7 },
                    }}
                  />
                )}
              </Box>
              {selectedCount > 0 && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteSweepIcon sx={{ fontSize: 16 }} />}
                  onClick={handleClearAll}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    py: 0.2,
                    px: 1,
                    minWidth: "auto",
                    borderRadius: "6px",
                  }}
                >
                  {t("clearAll")}
                </Button>
              )}
            </Box>

            {/* ── Search Autocomplete (NO inline tags — fixed height) */}
            <Autocomplete
              multiple
              freeSolo
              disableCloseOnSelect
              options={mergedOptions}
              loading={isLoading || isFetching}
              inputValue={searchInput}
              onInputChange={handleInputChange}
              slots={{ root: AutocompleteRoot }}
              slotProps={{
                listbox: {
                  onScroll: handleListboxScroll,
                  sx: { maxHeight: 280 },
                },
              }}
              filterOptions={customFilterOptions}
              getOptionLabel={getFieldLabel}
              isOptionEqualToValue={isOptionEqual}
              value={value}
              onChange={handleChange}
              /* Hide tags completely — selected items shown in list below */
              renderValue={() => null}
              renderOption={(props, option, { selected }) => {
                const { key: optionKey, ...otherProps } = props;
                delete otherProps.renderTags;
                delete otherProps.ownerState;
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
                        py: 0.8,
                        borderRadius: "6px",
                        my: 0.2,
                        color: "primary.main",
                        fontWeight: 600,
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <AddBoxOutlinedIcon color="primary" fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                        + {t("customFields.addTitle")}: &quot;{option}&quot;
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
                      py: 0.8,
                      gap: 1.5,
                      borderRadius: "6px",
                      my: 0.2,
                      backgroundColor: selected ? "action.selected" : "transparent",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
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
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: selected ? 600 : 400,
                          color: "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                    <Chip
                      label={String(fieldType).toUpperCase()}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        borderRadius: "4px",
                        backgroundColor: fieldType === "date" ? "info.main" : "action.hover",
                        color: fieldType === "date" ? "info.contrastText" : "text.secondary",
                        flexShrink: 0,
                        "& .MuiChip-label": { px: 0.5 },
                      }}
                    />
                  </Box>
                );
              }}
              renderInput={(params) => {
                const textFieldProps = { ...params };
                const paramsSlotProps = textFieldProps.slotProps;
                delete textFieldProps.slotProps;
                delete textFieldProps.renderTags;
                delete textFieldProps.ownerState;

                const inputSlotProps = paramsSlotProps?.input
                  ? { ...paramsSlotProps.input }
                  : {};
                delete inputSlotProps.renderTags;
                delete inputSlotProps.ownerState;

                const cleanedInputProps = textFieldProps.InputProps
                  ? { ...textFieldProps.InputProps }
                  : {};
                delete textFieldProps.InputProps;
                delete cleanedInputProps.renderTags;
                delete cleanedInputProps.ownerState;

                return (
                  <TextField
                    {...textFieldProps}
                    placeholder={t("customFields.searchPlaceholder", "Meýdança gözleň...")}
                    error={Boolean(error)}
                    helperText={error?.message}
                    slotProps={{
                      ...paramsSlotProps,
                      input: {
                        ...cleanedInputProps,
                        ...inputSlotProps,
                        startAdornment: (
                          <SearchIcon sx={{ fontSize: 20, color: "text.disabled", mr: 0.5, flexShrink: 0 }} />
                        ),
                        endAdornment: (
                          <>
                            {(isLoading || isFetching) && (
                              <CircularProgress color="inherit" size={18} />
                            )}
                            {inputSlotProps?.endAdornment || cleanedInputProps?.endAdornment}
                          </>
                        ),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        height: "42px",
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                );
              }}
            />

            {/* ── Selected fields list with drag reorder (STATIC FIXED HEIGHT) ─── */}
            {selectedCount > 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  height: 220,
                  overflowY: "auto",
                  borderColor: "divider",
                  "&::-webkit-scrollbar": { width: 5 },
                  "&::-webkit-scrollbar-thumb": {
                    borderRadius: 3,
                    backgroundColor: "action.disabled",
                  },
                }}
              >
                {value.map((item, index) => (
                  <SelectedFieldItem
                    key={
                      typeof item === "string"
                        ? `sel-${item}-${index}`
                        : `sel-${getItemKey(item) || index}`
                    }
                    index={index}
                    label={getFieldLabel(item)}
                    fieldType={typeof item === "object" ? item.field_type : null}
                    isDragging={dragIndexRef.current === index}
                    dragOverIndex={dragOverIndex}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onRemove={handleRemove}
                  />
                ))}
              </Paper>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 220,
                  borderRadius: "10px",
                  border: "1px dashed",
                  borderColor: "divider",
                  color: "text.disabled",
                  backgroundColor: "action.hover",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {t("customFields.emptyState", "Heniz meýdança saýlanmady")}
                </Typography>
              </Box>
            )}

            {/* ── Create custom field modal ───────────────────────── */}
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
