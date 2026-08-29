import { useState, useRef } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
  IconButton,
  Tooltip,
  TextField,
  CircularProgress,
  alpha,
  Divider,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { ChevronDown, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import OverflowTooltipLabel from "../../../components/OverflowTooltipLabel";
import { useLocale } from "../../../hooks/useLocale";
import { useFinanceCategories } from "../../../functions/financeCategories";

const selectRootSx = {
  borderRadius: "7px",
  minHeight: "44px",
  height: "44px",
  backgroundColor: (theme) =>
    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "divider",
  },
  "&:hover": {
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.main",
    },
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
  },
  "& .MuiSelect-select": {
    py: "10px",
    display: "flex",
    alignItems: "center",
  },
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "7px",
    minHeight: "44px",
    height: "44px",
    backgroundColor: (theme) =>
      theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "primary.main" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" },
  },
  "& .MuiOutlinedInput-input": {
    py: "10px",
    fontSize: "0.875rem",
  },
};

const menuPaperProps = {
  paper: {
    sx: {
      borderRadius: "12px",
      marginTop: "6px",
      maxHeight: 300,
      backgroundColor: "background.paper",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0px 12px 32px rgba(0, 0, 0, 0.55)"
          : "0px 10px 30px rgba(0, 0, 0, 0.1)",
      border: "1px solid",
      borderColor: "divider",
      "& .MuiList-root": { padding: "6px 0" },
      "& .MuiMenuItem-root": {
        borderRadius: "8px",
        margin: "3px 6px",
        padding: "8px 12px",
        fontSize: "0.875rem",
      },
    },
  },
};

const actionBtnSx = {
  height: "44px",
  width: "40px",
  borderRadius: "7px",
  border: "1px solid",
  borderColor: "divider",
  bgcolor: (theme) =>
    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
  color: "text.secondary",
  flexShrink: 0,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
    borderColor: "primary.main",
    color: "primary.main",
  },
};

const CategorySelectWithManagement = ({
  name = "category",
  control,
  setValue,
  label,
  required = false,
  defaultValue = "",
}) => {
  const { t } = useLocale();
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useFinanceCategories();

  const [mode, setMode] = useState("select"); // "select" | "add" | "edit"
  const [inputText, setInputText] = useState("");
  const [inlineError, setInlineError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  const displayLabel = label || t("category");

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const currentValue = field.value || defaultValue || "";

        const allOptions = [...categories];
        if (
          currentValue &&
          !allOptions.some(
            (c) => c.value === currentValue || c.label === currentValue
          )
        ) {
          allOptions.unshift({
            value: currentValue,
            label: currentValue,
            isBuiltIn: false,
          });
        }

        const selectedOption = allOptions.find(
          (c) => c.value === currentValue || c.label === currentValue
        );
        const isCustomSelected =
          Boolean(selectedOption) && !selectedOption.isBuiltIn;

        const updateFieldValue = (newVal) => {
          if (setValue) {
            setValue(name, newVal, { shouldDirty: true, shouldValidate: true });
          } else {
            field.onChange(newVal);
          }
        };

        const handleStartAdd = () => {
          setInputText("");
          setInlineError("");
          setMode("add");
          setIsOpen(false);
        };

        const handleStartEdit = () => {
          if (!selectedOption || !isCustomSelected) return;
          setInputText(selectedOption.label || "");
          setInlineError("");
          setMode("edit");
          setIsOpen(false);
        };

        const handleCancelInline = () => {
          setInputText("");
          setInlineError("");
          setMode("select");
        };

        const handleSaveAdd = () => {
          const trimmed = inputText.trim();
          if (!trimmed) {
            setInlineError(t("finance.enterCategoryName"));
            return;
          }

          addCategory(
            { name: trimmed, label: trimmed },
            {
              onSuccess: (res) => {
                const created = res?.data?.data || res?.data;
                const createdVal = created?.value || created?.guid || trimmed;
                updateFieldValue(createdVal);
                handleCancelInline();
              },
            }
          );
        };

        const handleSaveEdit = () => {
          const trimmed = inputText.trim();
          if (!trimmed) {
            setInlineError(t("finance.enterCategoryName"));
            return;
          }
          if (!selectedOption) return;

          updateCategory(
            {
              id: selectedOption.id || selectedOption.value,
              value: selectedOption.value,
              guid: selectedOption.guid || selectedOption.id || selectedOption.value,
              name: trimmed,
              label: trimmed,
            },
            {
              onSuccess: () => {
                handleCancelInline();
              },
            }
          );
        };

        const handleDelete = () => {
          if (!selectedOption || !isCustomSelected) return;
          deleteCategory(
            selectedOption.value || selectedOption.guid || selectedOption.id,
            {
              onSuccess: () => {
                updateFieldValue("");
              },
            }
          );
        };

        return (
          <Box sx={{ width: "100%", position: "relative" }}>
            {displayLabel && (
              <OverflowTooltipLabel
                label={
                  mode !== "select"
                    ? `${displayLabel} (${mode === "add" ? t("finance.addNewCategory") : t("edit")})`
                    : displayLabel
                }
                required={required}
              />
            )}

            <FormControl
              fullWidth
              size="medium"
              error={Boolean(error || inlineError)}
            >
              {mode === "select" ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Select
                    value={currentValue}
                    onChange={(e) => field.onChange(e.target.value)}
                    open={isOpen}
                    onOpen={() => setIsOpen(true)}
                    onClose={() => setIsOpen(false)}
                    displayEmpty
                    fullWidth
                    sx={selectRootSx}
                    MenuProps={{ slotProps: menuPaperProps }}
                    IconComponent={() => (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "absolute",
                          right: 12,
                          top: "calc(50% - 9px)",
                          color: "text.secondary",
                          pointerEvents: "none",
                          transform: isOpen ? "rotate(180deg)" : "none",
                          transition:
                            "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease",
                        }}
                      >
                        <ChevronDown size={18} />
                      </Box>
                    )}
                  >
                    <MenuItem value="" disabled>
                      <Typography sx={{ color: "text.disabled", fontSize: "0.875rem" }}>
                        {t("finance.selectCategory")}
                      </Typography>
                    </MenuItem>

                    {allOptions.map((opt) => (
                      <MenuItem key={opt.id || opt.value} value={opt.value}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.875rem" }}>
                            {opt.label}
                          </Typography>
                          {!opt.isBuiltIn && (
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "10px",
                                color: "primary.main",
                                bgcolor: (th) => alpha(th.palette.primary.main, 0.1),
                                px: 0.8,
                                py: 0.2,
                                borderRadius: "4px",
                                fontWeight: 600,
                              }}
                            >
                              {t("finance.custom")}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}

                    <Divider sx={{ my: 0.5 }} />

                    <MenuItem
                      value="__ADD_NEW__"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartAdd();
                      }}
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 0.75,
                      }}
                    >
                      <Plus size={15} />
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "primary.main" }}>
                        + {t("finance.addNewCategory")}
                      </Typography>
                    </MenuItem>
                  </Select>

                  {/* Add Button - Always Available */}
                  <Tooltip title={t("finance.addNewCategory")}>
                    <IconButton
                      type="button"
                      onClick={handleStartAdd}
                      sx={{
                        ...actionBtnSx,
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                        color: "primary.main",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                        "&:hover": {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <Plus size={18} />
                    </IconButton>
                  </Tooltip>

                  {/* Edit Button - Active for custom selected category */}
                  {isCustomSelected && (
                    <Tooltip title={t("edit")}>
                      <IconButton
                        type="button"
                        onClick={handleStartEdit}
                        sx={actionBtnSx}
                      >
                        <Pencil size={16} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Delete Button - Active for custom selected category */}
                  {isCustomSelected && (
                    <Tooltip title={t("delete")}>
                      <IconButton
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDelete}
                        sx={{
                          ...actionBtnSx,
                          "&:hover": {
                            bgcolor: (th) => alpha(th.palette.error.main, 0.08),
                            borderColor: "error.main",
                            color: "error.main",
                          },
                        }}
                      >
                        {isDeleting ? (
                          <CircularProgress size={15} color="error" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ) : (
                /* Inline Add / Edit Mode */
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <TextField
                    fullWidth
                    autoFocus
                    inputRef={inputRef}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (inlineError) setInlineError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (mode === "add") handleSaveAdd();
                        else handleSaveEdit();
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        handleCancelInline();
                      }
                    }}
                    placeholder={t("finance.categoryPlaceholder")}
                    error={Boolean(inlineError)}
                    sx={inputSx}
                  />

                  <Tooltip title={t("save")}>
                    <span>
                      <IconButton
                        type="button"
                        disabled={isCreating || isUpdating}
                        onClick={mode === "add" ? handleSaveAdd : handleSaveEdit}
                        sx={{
                          height: "44px",
                          width: "40px",
                          borderRadius: "7px",
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          flexShrink: 0,
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        }}
                      >
                        {isCreating || isUpdating ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <Check size={18} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title={t("cancel")}>
                    <IconButton
                      type="button"
                      onClick={handleCancelInline}
                      sx={actionBtnSx}
                    >
                      <X size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {(error || inlineError) && (
                <FormHelperText
                  error
                  sx={{
                    position: "absolute",
                    bottom: "-20px",
                    left: 0,
                    mx: 1,
                    mt: 0,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {inlineError || error?.message || t("required")}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        );
      }}
    />
  );
};

export default CategorySelectWithManagement;
