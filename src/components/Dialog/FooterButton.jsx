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
          borderRadius: "7px",
          textTransform: "none",
          fontWeight: 600,
          minWidth: 140,
          fontSize: "14px",
          borderColor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.14)" : theme.palette.divider,
          color: "text.primary",
          transition: "all 200ms ease",
          "&:hover": {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : theme.palette.action.hover,
            borderColor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : theme.palette.text.secondary,
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
          borderRadius: "7px",
          textTransform: "none",
          fontWeight: 600,
          minWidth: 140,
          fontSize: "14px",
          backgroundColor: "#0E8584",
          border: "0.5px solid #2CA7A6",
          color: "#ffffff",
          boxShadow: "0 2px 8px rgba(14, 133, 132, 0.30)",
          transition: "all 200ms ease",
          "&:hover": {
            backgroundColor: "#0C7776",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 14px rgba(14, 133, 132, 0.36)",
          },
          "&:active": {
            transform: "scale(0.98)",
            boxShadow: "0 1px 4px rgba(14, 133, 132, 0.24)",
          },
          "&.Mui-disabled": {
            backgroundColor: "action.disabledBackground",
            color: "action.disabled",
            boxShadow: "none",
          },
        }}
      >
        {saveText ?? t("save")}
      </Button>
    </Box>
  );
};

export default FooterButton;
