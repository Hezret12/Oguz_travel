import { useState, useMemo } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
  IconButton,
  Tooltip,
  alpha,
  Divider,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { ChevronDown, Plus, Settings2 } from "lucide-react";
import { useLocale } from "../../../hooks/useLocale";
import { useFinanceCategories } from "../../../functions/financeCategories";
import ManageCategoriesDialog from "./ManageCategoriesDialog";

const selectSx = {
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
  },
};

const menuPaperProps = {
  paper: {
    sx: {
      borderRadius: "12px",
      marginTop: "4px",
      maxHeight: 320,
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 8px 24px rgba(0,0,0,0.5)"
          : "0 4px 20px rgba(0,0,0,0.08)",
    },
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
  const { categories } = useFinanceCategories();
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const displayLabel = label || t("category", "Kategoriýa");

  return (
    <>
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

          const handleSelectCreated = (newVal) => {
            if (setValue) {
              setValue(name, newVal, { shouldDirty: true, shouldValidate: true });
            } else {
              field.onChange(newVal);
            }
          };

          return (
            <FormControl fullWidth size="medium" error={Boolean(error)}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.75,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {displayLabel} {required && "*"}
                </Typography>
                <Tooltip
                  title={t(
                    "finance.manageCategoriesTooltip",
                    "Kategoriýa goşmak / sazlamak"
                  )}
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setIsManageOpen(true)}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      border: "none",
                      background: "transparent",
                      color: "primary.main",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      p: 0.5,
                      borderRadius: "6px",
                      "&:hover": {
                        bgcolor: (th) => alpha(th.palette.primary.main, 0.08),
                        textDecoration: "underline",
                      },
                    }}
                  >
                    <Plus size={14} />
                    <span>{t("finance.addEditCategory", "Kategoriýa goş / sazla")}</span>
                  </Box>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Select
                  value={currentValue}
                  onChange={(e) => field.onChange(e.target.value)}
                  open={isOpen}
                  onOpen={() => setIsOpen(true)}
                  onClose={() => setIsOpen(false)}
                  displayEmpty
                  fullWidth
                  sx={selectSx}
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
                    <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                      {t("finance.selectCategory", "Kategoriýa saýlaň...")}
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
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
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
                            Ýörite
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
                      setIsOpen(false);
                      setIsManageOpen(true);
                    }}
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      py: 1,
                    }}
                  >
                    <Plus size={16} />
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "primary.main" }}>
                      + {t("finance.addNewCategory", "Täze kategoriýa goşmak...")}
                    </Typography>
                  </MenuItem>
                </Select>

                <Tooltip title={t("finance.manageCategories", "Kategoriýalary dolandyrmak")}>
                  <IconButton
                    type="button"
                    onClick={() => setIsManageOpen(true)}
                    sx={{
                      height: 48,
                      width: 48,
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      color: "text.secondary",
                      flexShrink: 0,
                      "&:hover": {
                        bgcolor: (th) => alpha(th.palette.primary.main, 0.08),
                        borderColor: "primary.main",
                        color: "primary.main",
                      },
                    }}
                  >
                    <Settings2 size={20} />
                  </IconButton>
                </Tooltip>
              </Box>

              {error && (
                <FormHelperText error sx={{ mx: 0.5, mt: 0.5 }}>
                  {error.message || t("requiredField", "Bu meýdan hökmany")}
                </FormHelperText>
              )}
            </FormControl>
          );
        }}
      />

      <ManageCategoriesDialog
        open={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        onSelectCategory={(val) => {
          if (setValue) {
            setValue(name, val, { shouldDirty: true, shouldValidate: true });
          }
        }}
      />
    </>
  );
};

export default CategorySelectWithManagement;
