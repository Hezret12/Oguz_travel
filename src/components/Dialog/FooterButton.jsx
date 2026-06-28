import { Box, Button, CircularProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useLocale } from "../../hooks/useLocale";

export const FooterButton = ({
  loading = false,
  onCancel,
  onSave,
  saveText,
  cancelText,
  type = "submit",
  sx,
}) => {
  const { t } = useLocale();

  return (
    <Box
      sx={[
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1.5,
          mt: 4,
        },
        sx,
      ]}
    >
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={loading}
        sx={{
          height: "40px",
          px: 2.5,
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
          minWidth: 140,
          fontSize: "14px",
          borderColor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "#d1d5db",
          color: "text.primary",
          transition: "all 200ms ease",
          "&:hover": {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#f9fafb",
            borderColor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.4)" : "#9ca3af",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
        }}
      >
        {cancelText ?? t("cancel") ?? "Iptal"}
      </Button>

      <Button
        type={type}
        variant="contained"
        onClick={onSave}
        disabled={loading}
        disableElevation
        startIcon={
          loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SaveIcon sx={{ fontSize: "18px !important" }} />
          )
        }
        sx={{
          height: "40px",
          px: 3,
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
          minWidth: 140,
          fontSize: "14px",
          backgroundColor: "#16a34a",
          color: "#ffffff",
          boxShadow: "0 2px 8px rgba(22, 163, 74, 0.30)",
          transition: "all 200ms ease",
          "&:hover": {
            backgroundColor: "#15803d",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 14px rgba(22, 163, 74, 0.38)",
          },
          "&:active": {
            transform: "scale(0.98)",
            boxShadow: "0 1px 4px rgba(22, 163, 74, 0.25)",
          },
          "&.Mui-disabled": {
            backgroundColor: "action.disabledBackground",
            color: "action.disabled",
            boxShadow: "none",
          },
        }}
      >
        {saveText ?? t("actions.save")}
      </Button>
    </Box>
  );
};

export default FooterButton;
