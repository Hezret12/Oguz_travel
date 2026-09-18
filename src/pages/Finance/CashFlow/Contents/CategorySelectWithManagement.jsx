import { useState, useMemo } from "react";
import { Controller } from "react-hook-form";
import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Tooltip,
  FormHelperText,
  Divider,
} from "@mui/material";
import { Plus, Settings2, ChevronDown } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getAllCategoriesApi } from "../../../../api/queries/getters";
import ManageCategoriesDialog from "./ManageCategoriesDialog";

const selectSx = {
  borderRadius: "8px",
  bgcolor: "background.paper",
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
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "0 8px 24px rgba(0,0,0,0.5)"
          : "0 4px 20px rgba(0,0,0,0.08)",
      maxHeight: 280,
    },
  },
};

const CategorySelectWithManagement = ({
  name = "category_guid",
  control,
  setValue,
  label,
  required = false,
}) => {
  const { t, selectedLang } = useLocale();
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const displayLabel = label || t("category", "Kategoriýa");

  const { data: categoriesData, isLoading } = useGet({
    apiFn: getAllCategoriesApi,
    key: "categories",
  });

  const categories = useMemo(() => {
    const raw =
      categoriesData?.data?.data ??
      categoriesData?.data ??
      categoriesData ??
      [];
    return Array.isArray(raw) ? raw : [];
  }, [categoriesData]);

  const getCatLabel = (cat) => {
    if (!cat) return "";
    if (typeof cat.name === "object" && cat.name) {
      return selectedLang(cat.name) || cat.name.tk || cat.name.ru || cat.name.en || "";
    }
    return String(cat.name || "");
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const currentValue = field.value || "";

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
                        bgcolor: "action.hover",
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
                      {isLoading
                        ? t("loading", "Ýüklenýär...")
                        : t("finance.selectCategory", "Kategoriýa saýlaň...")}
                    </Typography>
                  </MenuItem>

                  {categories.map((cat) => (
                    <MenuItem key={cat.guid} value={cat.guid}>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        {getCatLabel(cat)}
                      </Typography>
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
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "primary.main",
                      }}
                    >
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
                        bgcolor: "action.hover",
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
