import { forwardRef, useCallback, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
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
  Grid,
  MenuItem,
} from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getAllVisaFieldsApi } from "../../../api/queries/getters";
import { useLocale } from "../../../hooks/useLocale";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import {
  CANONICAL_RECURRING_FIELDS,
  findMatchingCatalogField,
  normalizeFieldString,
  slugifyFieldKey,
} from "../../../functions/visaCountryFieldConfigs";

const CreateCustomFieldModal = ({ open, onClose, candidateString, onSave }) => {
  const { t } = useLocale();
  const [labelTm, setLabelTm] = useState(candidateString || "");
  const [labelRu, setLabelRu] = useState(candidateString || "");
  const [labelEn, setLabelEn] = useState(candidateString || "");
  const [fieldType, setFieldType] = useState("text");
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState([]);

  const autoKey = useMemo(() => slugifyFieldKey(labelEn || labelTm), [labelEn, labelTm]);

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions((prev) => [...prev, optionInput.trim()]);
      setOptionInput("");
    }
  };

  const handleRemoveOption = (idx) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!labelTm.trim() || !labelRu.trim() || !labelEn.trim()) return;

    const newFieldObj = {
      fieldKey: autoKey || `custom_${Date.now()}`,
      labelTm: labelTm.trim(),
      labelRu: labelRu.trim(),
      labelEn: labelEn.trim(),
      fieldType,
      options: fieldType === "select" ? options : [],
      isDefault: false,
      isCustom: true,
    };
    onSave(newFieldObj);
    onClose();
  };

  return (
    <CustomDialog open={open} close={onClose} widthX={540}>
      <CustomDialogHeader variant="h6" title={t("visaIntake.createCustomFieldTitle") || "Täze meýdança döretmek"} />
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label="TM Label (Türkmen)"
              value={labelTm}
              onChange={(e) => setLabelTm(e.target.value)}
              required
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="RU Label (Русский)"
              value={labelRu}
              onChange={(e) => setLabelRu(e.target.value)}
              required
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="EN Label (English)"
              value={labelEn}
              onChange={(e) => setLabelEn(e.target.value)}
              required
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label={t("visaIntake.fieldTypeLabel") || "Meýdança görnüşi"}
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="text">{t("visaIntake.typeText") || "Tekst"}</MenuItem>
              <MenuItem value="date">{t("visaIntake.typeDate") || "Sene"}</MenuItem>
              <MenuItem value="number">{t("visaIntake.typeNumber") || "San"}</MenuItem>
              <MenuItem value="select">{t("visaIntake.typeSelect") || "Saýlawly"}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("visaIntake.fieldKeyPreview") || "fieldKey (Auto)"}
              value={autoKey}
              disabled
              fullWidth
              size="small"
              helperText="English label-dan döredilýär"
            />
          </Grid>
          {fieldType === "select" && (
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                {t("visaIntake.selectOptionsLabel") || "Saýlaw opsiýalary"}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  placeholder={t("visaIntake.addOptionPlaceholder") || "Opsiýa ady..."}
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  size="small"
                  fullWidth
                />
                <Button variant="outlined" onClick={handleAddOption} size="small">
                  Goş
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                {options.map((opt, i) => (
                  <Chip key={i} label={opt} onDelete={() => handleRemoveOption(i)} size="small" color="primary" />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 1 }}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            {t("cancel") || "Ýatyr"}
          </Button>
          <Button variant="contained" type="submit">
            {t("save") || "Ýatda sakla"}
          </Button>
        </Box>
      </Box>
    </CustomDialog>
  );
};

const CleanRoot = forwardRef(function CleanRoot(props, ref) {
  const domProps = { ...props };
  delete domProps.renderTags;
  delete domProps.ownerState;
  delete domProps.PaperProps;
  return <div ref={ref} {...domProps} />;
});

const ReorderableFieldItem = ({
  index,
  total,
  label,
  onMoveUp,
  onMoveDown,
  onRemove,
}) => {
  return (
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
        <DragIndicatorIcon
          sx={{ fontSize: 18, color: "text.disabled", cursor: "grab" }}
        />
        <Chip
          label={`#${index + 1}`}
          size="small"
          color="primary"
          sx={{
            height: 22,
            fontWeight: 700,
            fontSize: "0.7rem",
            borderRadius: "6px",
          }}
        />
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
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
};

export const CountryFieldSelector = ({ control, name = "fields" }) => {
  const { t, selectedLang } = useLocale();
  const [candidateString, setCandidateString] = useState(null);
  const [pendingUpdateFn, setPendingUpdateFn] = useState(null);

  const { data: allFieldsRaw = [], isLoading } = useGet({
    apiFn: getAllVisaFieldsApi,
    key: "visaFields",
  });

  const availableFields = useMemo(() => {
    const apiList = Array.isArray(allFieldsRaw) ? allFieldsRaw : [];
    const mapByFieldKey = new Map();

    CANONICAL_RECURRING_FIELDS.forEach((field) => {
      if (!field.isDefault && field.fieldKey) {
        mapByFieldKey.set(field.fieldKey, field);
      }
    });

    apiList.forEach((field) => {
      if (!field.isDefault) {
        const key = field.fieldKey || normalizeFieldString(field.labelTm);
        if (key) {
          const existing = mapByFieldKey.get(key);
          mapByFieldKey.set(key, { ...existing, ...field });
        }
      }
    });

    return Array.from(mapByFieldKey.values());
  }, [allFieldsRaw]);

  const customFilterOptions = useCallback((options, state) => {
    const rawQuery = state.inputValue?.trim();
    const query = normalizeFieldString(rawQuery);
    if (!query) return options;

    const filtered = options.filter((option) => {
      if (typeof option === "string") {
        return normalizeFieldString(option).includes(query);
      }

      const keyMatch = normalizeFieldString(option.fieldKey).includes(query);
      const tmMatch = normalizeFieldString(option.labelTm).includes(query);
      const ruMatch = normalizeFieldString(option.labelRu).includes(query);
      const enMatch = normalizeFieldString(option.labelEn).includes(query);

      const aliasMatch =
        Array.isArray(option.aliases) &&
        option.aliases.some((alias) =>
          normalizeFieldString(alias).includes(query)
        );

      return keyMatch || tmMatch || ruMatch || enMatch || aliasMatch;
    });

    const hasExactMatch = filtered.some((opt) => {
      if (typeof opt === "string") return normalizeFieldString(opt) === query;
      return (
        normalizeFieldString(opt.fieldKey) === query ||
        normalizeFieldString(opt.labelTm) === query ||
        normalizeFieldString(opt.labelRu) === query ||
        normalizeFieldString(opt.labelEn) === query
      );
    });

    if (!hasExactMatch && rawQuery) {
      filtered.push(rawQuery);
    }

    return filtered;
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
          const newArr = [...value];
          const temp = newArr[index - 1];
          newArr[index - 1] = newArr[index];
          newArr[index] = temp;
          onChange(newArr);
        };

        const handleMoveDown = (index) => {
          if (index >= value.length - 1) return;
          const newArr = [...value];
          const temp = newArr[index + 1];
          newArr[index + 1] = newArr[index];
          newArr[index] = temp;
          onChange(newArr);
        };

        const handleRemove = (index) => {
          const newArr = value.filter((_, i) => i !== index);
          onChange(newArr);
        };

        const handleClearAll = () => {
          onChange([]);
        };

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {t("visa.fieldsSelectorTitle") ||
                  "Ýurt üçin meýdançalar (Dynamic Columns)"}
              </Typography>
              {selectedCount > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={`${selectedCount} ${t("selected") || "saýlandy"}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      borderRadius: "6px",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteSweepIcon style={{ fontSize: 16 }} />}
                    onClick={handleClearAll}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.75rem",
                      py: 0.2,
                      px: 0.8,
                      minWidth: "auto",
                    }}
                  >
                    {t("clearAll") || "Aýyr"}
                  </Button>
                </Box>
              )}
            </Box>

            <Autocomplete
              multiple
              freeSolo
              disableCloseOnSelect
              slots={{ root: CleanRoot }}
              options={availableFields}
              loading={isLoading}
              filterOptions={customFilterOptions}
              getOptionLabel={(option) => {
                if (typeof option === "string") return option;
                const localized = selectedLang(option.labelTm) || option.labelTm;
                return (
                  localized ||
                  option.labelRu ||
                  option.labelEn ||
                  option.fieldKey ||
                  ""
                );
              }}
              isOptionEqualToValue={(option, val) => {
                if (typeof option === "string" || typeof val === "string") {
                  return (
                    normalizeFieldString(option) === normalizeFieldString(val)
                  );
                }
                if (option.guid && val.guid) return option.guid === val.guid;
                if (option.id && val.id) return option.id === val.id;
                return option.fieldKey === val.fieldKey;
              }}
              value={value}
              onChange={(_, newValue) => {
                const nextList = [];
                let freeSoloStr = null;

                (newValue || []).forEach((item) => {
                  if (typeof item === "string") {
                    const match = findMatchingCatalogField(
                      item,
                      availableFields
                    );
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
                  setPendingUpdateFn(() => (newFieldObj) => {
                    onChange([...nextList, newFieldObj]);
                  });
                } else {
                  onChange(nextList);
                }
              }}
              renderOption={(props, option, { selected }) => {
                const { key: optionKey, ...otherProps } = props;
                const isNew = typeof option === "string";
                const label = isNew
                  ? option
                  : selectedLang(option.labelTm) ||
                    option.labelTm ||
                    option.fieldKey;
                const fieldType = option.fieldType || "text";
                const fallbackKey = isNew
                  ? option
                  : option.guid || option.id || option.fieldKey || label;

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
                        "&:hover": {
                          backgroundColor: "action.selected",
                        },
                      }}
                    >
                      <AddBoxOutlinedIcon color="primary" fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                        + {t("visaIntake.createCustomFieldTitle") || "Täze meýdança goşmak"}: "{option}"
                      </Typography>
                    </Box>
                  );
                }

                return (
                  <Box
                    component="li"
                    key={optionKey || fallbackKey}
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
                      backgroundColor: selected
                        ? "action.selected"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flex: 1,
                      }}
                    >
                      {selected ? (
                        <CheckCircleOutlinedIcon
                          color="primary"
                          sx={{ fontSize: 18 }}
                        />
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
                        sx={{
                          fontWeight: selected ? 600 : 400,
                          color: "text.primary",
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>

                    {!isNew && (
                      <Chip
                        label={fieldType.toUpperCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          borderRadius: "4px",
                          backgroundColor:
                            fieldType === "date"
                              ? "info.soft"
                              : "action.hover",
                          color: "text.secondary",
                        }}
                      />
                    )}
                  </Box>
                );
              }}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => {
                  const isNew = typeof option === "string";
                  const label = isNew
                    ? option
                    : selectedLang(option.labelTm) ||
                      option.labelTm ||
                      option.fieldKey;

                  const tagProps = { ...getTagProps({ index }) };
                  const tagKey = tagProps.key;
                  delete tagProps.key;
                  delete tagProps.renderTags;
                  delete tagProps.ownerState;

                  const fallbackTagKey = isNew
                    ? `tag-${option}-${index}`
                    : `tag-${option.guid || option.id || option.fieldKey}-${index}`;

                  return (
                    <Chip
                      key={tagKey || fallbackTagKey}
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
                    placeholder={
                      t("visa.typeOrSelectField") ||
                      "Meýdança saýlaň ýa-da täze adyny ýazyň..."
                    }
                    error={Boolean(error)}
                    helperText={
                      error?.message ||
                      (t("visa.fieldSelectorHint") ||
                        "Default 7 meýdança awtomatiki birikdiriler. Listden köp meýdança saýlap bilersiňiz.")
                    }
                    slotProps={{
                      ...paramsSlotProps,
                      input: {
                        ...paramsSlotProps?.input,
                        endAdornment: (
                          <>
                            {isLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
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

            {selectedCount > 0 && (
              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    px: 0.5,
                  }}
                >
                  {t("visa.reorderFieldsHint") ||
                    "Saýlanan meýdançalaryň sıralamasy (Índeksi çalşyrmak üçin strelkalary basyň):"}
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
                  {value.map((item, index) => {
                    const isNew = typeof item === "string";
                    const label = isNew
                      ? item
                      : selectedLang(item.labelTm) ||
                        item.labelTm ||
                        item.fieldKey;

                    return (
                      <ReorderableFieldItem
                        key={
                          isNew
                            ? `reorder-${item}-${index}`
                            : `reorder-${item.guid || item.fieldKey}-${index}`
                        }
                        item={item}
                        index={index}
                        total={value.length}
                        label={label}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onRemove={handleRemove}
                      />
                    );
                  })}
                </Paper>
              </Box>
            )}

            {Boolean(candidateString) && (
              <CreateCustomFieldModal
                open={true}
                candidateString={candidateString}
                onClose={() => {
                  setCandidateString(null);
                  setPendingUpdateFn(null);
                }}
                onSave={(newFieldObj) => {
                  if (pendingUpdateFn) {
                    pendingUpdateFn(newFieldObj);
                  }
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
