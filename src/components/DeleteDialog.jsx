import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useLocale } from "../hooks/useLocale";

const DeleteDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  description,
  confirmText,
  cancelText,
}) => {
  const { t } = useLocale();

  const resolvedDescription = description ?? t("deleteDialog.description") ?? "Are you sure you want to delete this record? This action cannot be undone.";
  const resolvedConfirm     = confirmText ?? t("delete")                   ?? "Delete";
  const resolvedCancel      = cancelText  ?? t("cancel")                   ?? "Cancel";

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slots={{ transition: Fade }}
      transitionDuration={200}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)"
                : "0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
            backgroundColor: "background.paper",
            backgroundImage: "none",
          },
        },
        backdrop: {
          sx: {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(2, 6, 23, 0.7)"
                : "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          px: 3,
          pt: 3,
          pb: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        {/* Warning icon + title */}
        <Typography
          component="div"
          sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
        >
          <WarningAmberRoundedIcon
            sx={{ fontSize: 22, color: "error.main", flexShrink: 0 }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}
          >
            {t('delete')}
          </Typography>
        </Typography>

        <IconButton
          size="small"
          onClick={onClose}
          disabled={isLoading}
          aria-label="close"
          sx={{
            color: "text.secondary",
            width: 28,
            height: 28,
            flexShrink: 0,
            "&:hover": { color: "text.primary" },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent sx={{ px: 3, py: 0, pb: 2.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
          {resolvedDescription}
        </Typography>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 0, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isLoading}
          sx={{
            flex: 1,
            borderRadius: "9px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "14px",
            height: "38px",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              backgroundColor: "action.hover",
              borderColor: "text.secondary",
            },
          }}
        >
          {resolvedCancel}
        </Button>

        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isLoading}
          disableElevation
          startIcon={
            isLoading ? (
              <CircularProgress size={15} color="inherit" />
            ) : (
              <DeleteOutlineIcon sx={{ fontSize: "17px !important" }} />
            )
          }
          sx={{
            flex: 1,
            borderRadius: "9px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "14px",
            height: "38px",
            backgroundColor: "#ef4444",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(239,68,68,0.28)",
            transition: "all 200ms ease",
            "&:hover": {
              backgroundColor: "#dc2626",
              boxShadow: "0 4px 14px rgba(239,68,68,0.38)",
            },
            "&:active": { transform: "scale(0.98)" },
            "&.Mui-disabled": {
              backgroundColor: "action.disabledBackground",
              color: "action.disabled",
              boxShadow: "none",
            },
          }}
        >
          {resolvedConfirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
