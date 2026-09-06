import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
  CircularProgress,
  Collapse,
} from "@mui/material";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  Globe,
  Tag,
} from "lucide-react";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { getAllCategoriesApi } from "../../../api/queries/getters";
import { addCategoryApi } from "../../../api/queries/post";
import { updateCategoryApi } from "../../../api/queries/patch";
import { deleteCategoryApi } from "../../../api/queries/delete";
import DeleteDialog from "../../../components/DeleteDialog";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";

const ManageCategoriesDialog = ({ open, onClose, onSelectCategory }) => {
  const { t, selectedLang } = useLocale();

  const [nameTm, setNameTm] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [showMultiLang, setShowMultiLang] = useState(false);

  const [editingGuid, setEditingGuid] = useState(null);
  const [editNameTm, setEditNameTm] = useState("");
  const [editNameRu, setEditNameRu] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editShowMultiLang, setEditShowMultiLang] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const { data: categoriesData, isLoading, refetch } = useGet({
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

  const { mutate: createCategory, isPending: isCreating } = useCreate({
    apiFn: addCategoryApi,
    key: "categories",
    onSuccess: (res) => {
      const created = res?.data?.data || res?.data;
      setNameTm("");
      setNameRu("");
      setNameEn("");
      setShowMultiLang(false);
      setErrorMsg("");
      refetch();
      if (onSelectCategory && created?.guid) {
        onSelectCategory(created.guid);
      }
    },
  });

  const { mutate: updateCategory, isPending: isUpdating } = useUpdate({
    apiFn: updateCategoryApi,
    key: "categories",
    idKey: "guid",
    onSuccessUpdate: () => {
      setEditingGuid(null);
      setEditNameTm("");
      setEditNameRu("");
      setEditNameEn("");
      setEditShowMultiLang(false);
      refetch();
    },
  });

  const { mutate: deleteCategoryMutation } = useDelete({
    deleteFn: deleteCategoryApi,
    queryKey: "categories",
    idKey: "guid",
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => {
      deleteCategoryMutation(item.guid);
      if (editingGuid === item.guid) {
        setEditingGuid(null);
      }
    },
  });

  const handleAdd = (e) => {
    e?.preventDefault();
    const trimmedTm = nameTm.trim();
    if (!trimmedTm) {
      setErrorMsg(t("finance.enterCategoryName", "Kategoriýanyň adyny ýazyň"));
      return;
    }

    const payload = {
      name: {
        tk: trimmedTm,
        ru: (nameRu.trim() || trimmedTm),
        en: (nameEn.trim() || trimmedTm),
      },
    };

    createCategory(payload);
  };

  const handleStartEdit = (cat) => {
    setEditingGuid(cat.guid);
    const n = typeof cat.name === "object" ? cat.name : {};
    setEditNameTm(n.tk || (typeof cat.name === "string" ? cat.name : ""));
    setEditNameRu(n.ru || "");
    setEditNameEn(n.en || "");
    setEditShowMultiLang(Boolean(n.ru || n.en));
    setErrorMsg("");
  };

  const handleSaveEdit = (cat) => {
    const trimmedTm = editNameTm.trim();
    if (!trimmedTm) return;

    const payload = {
      guid: cat.guid,
      name: {
        tk: trimmedTm,
        ru: (editNameRu.trim() || trimmedTm),
        en: (editNameEn.trim() || trimmedTm),
      },
    };

    updateCategory(payload);
  };

  const handleCancelEdit = () => {
    setEditingGuid(null);
    setEditNameTm("");
    setEditNameRu("");
    setEditNameEn("");
    setEditShowMultiLang(false);
  };

  const getCatDisplayName = (cat) => {
    if (!cat) return "";
    if (typeof cat.name === "object" && cat.name) {
      return selectedLang(cat.name) || cat.name.tk || cat.name.ru || cat.name.en || "";
    }
    return String(cat.name || "");
  };

  return (
    <>
      <Dialog
        open={Boolean(open)}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "14px",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 12px 36px rgba(0,0,0,0.6)"
                  : "0 8px 32px rgba(0,0,0,0.12)",
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1.5,
            pt: 2.5,
            px: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tag size={20} color="inherit" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("finance.manageCategories", "Kategoriýalary dolandyrmak")}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Add Category Section */}
          <Box
            component="form"
            onSubmit={handleAdd}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}
            >
              + {t("finance.addNewCategory", "Täze kategoriýa goşmak")}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t("finance.categoryNameTm", "Kategoriýa ady (TK) *")}
                value={nameTm}
                onChange={(e) => {
                  setNameTm(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                disabled={isCreating}
                error={Boolean(errorMsg)}
                helperText={errorMsg}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.paper",
                    borderRadius: "8px",
                  },
                }}
              />
              <Tooltip title={t("finance.multiLangSupport", "Beýleki diller (RU/EN)")}>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => setShowMultiLang((prev) => !prev)}
                  sx={{
                    minWidth: "40px",
                    px: 1,
                    height: "40px",
                    borderRadius: "8px",
                    color: showMultiLang ? "primary.main" : "text.secondary",
                    borderColor: showMultiLang ? "primary.main" : "divider",
                  }}
                >
                  <Globe size={18} />
                </Button>
              </Tooltip>
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating || !nameTm.trim()}
                sx={{
                  height: "40px",
                  px: 2.5,
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                {isCreating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <>
                    <Plus size={16} style={{ marginRight: 4 }} />
                    {t("add", "Goş")}
                  </>
                )}
              </Button>
            </Box>

            <Collapse in={showMultiLang}>
              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("finance.categoryNameRu", "Название (RU)")}
                  value={nameRu}
                  onChange={(e) => setNameRu(e.target.value)}
                  disabled={isCreating}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                      borderRadius: "8px",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("finance.categoryNameEn", "Name (EN)")}
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  disabled={isCreating}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                      borderRadius: "8px",
                    },
                  }}
                />
              </Box>
            </Collapse>
          </Box>

          {/* List Categories */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {t("finance.existingCategories", "Bar bolan kategoriýalar")} ({categories.length})
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : categories.length === 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: "10px",
                border: "1px dashed",
                borderColor: "divider",
                color: "text.secondary",
              }}
            >
              <Typography variant="body2">
                {t("finance.noCategoriesFound", "Häzirlikçe kategoriýa ýok")}
              </Typography>
            </Box>
          ) : (
            <List
              sx={{
                maxHeight: "320px",
                overflowY: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "10px",
                p: 0,
              }}
            >
              {categories.map((cat, idx) => {
                const isEditing = editingGuid === cat.guid;
                const displayName = getCatDisplayName(cat);

                return (
                  <Box key={cat.guid}>
                    <ListItem
                      sx={{
                        py: 1.2,
                        px: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: isEditing ? "action.hover" : "transparent",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      {isEditing ? (
                        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={editNameTm}
                              onChange={(e) => setEditNameTm(e.target.value)}
                              placeholder="Kategoriýa ady (TK) *"
                              autoFocus
                              disabled={isUpdating}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "background.paper",
                                  borderRadius: "6px",
                                },
                              }}
                            />
                            <Tooltip title={t("finance.multiLangSupport", "Beýleki diller (RU/EN)")}>
                              <IconButton
                                size="small"
                                onClick={() => setEditShowMultiLang((prev) => !prev)}
                                sx={{
                                  color: editShowMultiLang ? "primary.main" : "text.secondary",
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                <Globe size={16} />
                              </IconButton>
                            </Tooltip>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={isUpdating || !editNameTm.trim()}
                              onClick={() => handleSaveEdit(cat)}
                              sx={{
                                bgcolor: "primary.main",
                                color: "#fff",
                                "&:hover": { bgcolor: "primary.dark" },
                                width: 34,
                                height: 34,
                              }}
                            >
                              <Check size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              sx={{ width: 34, height: 34 }}
                            >
                              <X size={16} />
                            </IconButton>
                          </Box>

                          <Collapse in={editShowMultiLang}>
                            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                              <TextField
                                size="small"
                                fullWidth
                                value={editNameRu}
                                onChange={(e) => setEditNameRu(e.target.value)}
                                placeholder="Название (RU)"
                                disabled={isUpdating}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    bgcolor: "background.paper",
                                    borderRadius: "6px",
                                  },
                                }}
                              />
                              <TextField
                                size="small"
                                fullWidth
                                value={editNameEn}
                                onChange={(e) => setEditNameEn(e.target.value)}
                                placeholder="Name (EN)"
                                disabled={isUpdating}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    bgcolor: "background.paper",
                                    borderRadius: "6px",
                                  },
                                }}
                              />
                            </Box>
                          </Collapse>
                        </Box>
                      ) : (
                        <>
                          <ListItemText
                            primary={
                              <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                                {displayName}
                              </Typography>
                            }
                            secondary={
                              typeof cat.name === "object" && (cat.name.ru || cat.name.en) ? (
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  {[cat.name.ru, cat.name.en].filter(Boolean).join(" • ")}
                                </Typography>
                              ) : null
                            }
                          />

                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {onSelectCategory && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                  onSelectCategory(cat.guid);
                                  onClose?.();
                                }}
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  textTransform: "none",
                                  px: 1,
                                }}
                              >
                                {t("select", "Saýla")}
                              </Button>
                            )}

                            <Tooltip title={t("edit", "Üýtget")}>
                              <IconButton
                                size="small"
                                onClick={() => handleStartEdit(cat)}
                                sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                              >
                                <Pencil size={15} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t("delete", "Poz")}>
                              <IconButton
                                size="small"
                                onClick={() => deleteDialog.open(cat)}
                                sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                              >
                                <Trash2 size={15} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </>
                      )}
                    </ListItem>
                    {idx < categories.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
          >
            {t("close", "Ýapmak")}
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteDialog
        open={deleteDialog.isOpen}
        close={deleteDialog.close}
        action={deleteDialog.confirm}
        title={t("finance.deleteCategoryTitle", "Kategoriýany pozmak")}
        description={t(
          "finance.deleteCategoryDesc",
          "Bu kategoriýany pozmak isleýärsiňizmi? Bu amal yzyna gaýtarylyp bilinmez."
        )}
      />
    </>
  );
};

export default ManageCategoriesDialog;
