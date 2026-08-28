import { useState } from "react";
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
  ListItemSecondaryAction,
  Chip,
  Divider,
  Tooltip,
  Paper,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  FolderPlus,
  Layers,
} from "lucide-react";
import { useLocale } from "../../../hooks/useLocale";
import { useFinanceCategories } from "../../../functions/financeCategories";

const ManageCategoriesDialog = ({ open, onClose, onSelectCategory }) => {
  const { t } = useLocale();
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
  } = useFinanceCategories();

  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdd = (e) => {
    e?.preventDefault();
    if (!newCatName.trim()) {
      setErrorMsg(t("finance.enterCategoryName"));
      return;
    }

    addCategory(
      { name: newCatName.trim(), label: newCatName.trim() },
      {
        onSuccess: (res) => {
          const created = res?.data?.data || res?.data;
          setNewCatName("");
          setErrorMsg("");
          if (onSelectCategory && (created?.value || created?.guid)) {
            onSelectCategory(created.value || created.guid);
            onClose?.();
          }
        },
      }
    );
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id || cat.value);
    setEditName(cat.label);
    setErrorMsg("");
  };

  const handleSaveEdit = (cat) => {
    if (!editName.trim()) return;
    updateCategory(
      {
        id: cat.id || cat.value,
        value: cat.value,
        guid: cat.guid || cat.id || cat.value,
        name: editName.trim(),
        label: editName.trim(),
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditName("");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = (cat) => {
    deleteCategory(cat.value || cat.guid || cat.id);
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            bgcolor: "background.paper",
            backgroundImage: "none",
            boxShadow: (th) =>
              th.palette.mode === "dark"
                ? "0 20px 45px rgba(0,0,0,0.65)"
                : "0 16px 36px rgba(0,0,0,0.12)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: "10px",
              bgcolor: (th) => alpha(th.palette.primary.main, 0.12),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Layers size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
              {t("finance.manageCategories")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("finance.categoryDesc")}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Quick Add Form */}
        <Paper
          component="form"
          onSubmit={handleAdd}
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "12px",
            bgcolor: (th) =>
              th.palette.mode === "dark"
                ? alpha(th.palette.common.white, 0.04)
                : alpha(th.palette.primary.main, 0.03),
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="body2"
            sx={{ mb: 1.2, fontWeight: 600, color: "text.primary", display: "flex", alignItems: "center", gap: 0.8 }}
          >
            <FolderPlus size={16} />
            {t("finance.addNewCategory")}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder={t("finance.categoryPlaceholder", "Mysall: Ýangyç, Kese aragatnaşyk, Internet...")}
              error={Boolean(errorMsg)}
              helperText={errorMsg}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "9px",
                  bgcolor: "background.paper",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              disabled={isCreating}
              startIcon={
                isCreating ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Plus size={16} />
                )
              }
              sx={{
                borderRadius: "9px",
                px: 2.5,
                fontWeight: 600,
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              {isCreating ? t("saving", "Ýüklenýär...") : t("add", "Goş")}
            </Button>
          </Box>
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* Existing Categories List */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
            {t("finance.allCategories", "Ähli kategoriýalar")} ({categories.length})
          </Typography>
        </Box>

        <List
          disablePadding
          sx={{
            maxHeight: 320,
            overflowY: "auto",
            pr: 0.5,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 3,
              backgroundColor: "divider",
            },
          }}
        >
          {categories.map((cat) => {
            const isEditing = editingId === (cat.id || cat.value);
            const isBuiltIn = Boolean(cat.isBuiltIn);

            return (
              <ListItem
                key={cat.id || cat.value}
                sx={{
                  py: 1,
                  px: 1.5,
                  mb: 0.75,
                  borderRadius: "10px",
                  bgcolor: (th) =>
                    th.palette.mode === "dark"
                      ? alpha(th.palette.common.white, 0.02)
                      : alpha(th.palette.common.black, 0.015),
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                {isEditing ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", mr: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(cat);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          bgcolor: "background.paper",
                          height: 36,
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      color="primary"
                      disabled={isUpdating}
                      onClick={() => handleSaveEdit(cat)}
                      sx={{ bgcolor: (th) => alpha(th.palette.primary.main, 0.1) }}
                    >
                      {isUpdating ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <Check size={16} />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleCancelEdit}
                      sx={{ color: "text.secondary" }}
                    >
                      <X size={16} />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {cat.label}
                          </Typography>
                          <Chip
                            label={isBuiltIn ? t("finance.builtIn", "Esasy") : t("finance.custom", "Ýörite")}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "10px",
                              fontWeight: 600,
                              bgcolor: (th) =>
                                isBuiltIn
                                  ? alpha(th.palette.text.secondary, 0.1)
                                  : alpha(th.palette.primary.main, 0.12),
                              color: isBuiltIn ? "text.secondary" : "primary.main",
                            }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {!isBuiltIn && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                              onClick={() => handleDelete(cat)}
                              sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                            >
                              <Trash2 size={15} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: "9px",
            borderColor: "divider",
            color: "text.primary",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("close", "Ýap")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageCategoriesDialog;
