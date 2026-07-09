import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckIcon from "@mui/icons-material/Check";
import { useLocale } from "../hooks/useLocale";

const FilterDrawer = ({
  open,
  onClose,
  onApply,
  onCancel,
  onReset,
  showFooter = true,
  children,
}) => {
  const { t } = useLocale();


  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={(theme) => ({
        zIndex: theme.zIndex.drawer + 2,
      })}
      slotProps={{
        paper: {
          sx: (theme) => ({
            width: { xs: "100%", sm: 380 },
            zIndex: "inherit",
            backgroundColor: theme.palette.background.paper,
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
          }),
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        sx={{ px: 2.5, py: 2, alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <FilterListIcon fontSize="small" />
          <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
            {(t("filter"))}
          </Typography>
        </Stack>

        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Filtreyi kapat"
          sx={{
            color: "text.secondary",
            borderRadius: "8px",
            "&:hover": { color: "text.primary", backgroundColor: "action.hover" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider />

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2.5,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "divider",
            borderRadius: "4px",
          },
        }}
      >
        {children ?? (
          <Typography variant="body2" color="text.secondary">
            Not found
          </Typography>
        )}
      </Box>

      {/* Footer */}
      {showFooter && (
        <>
          <Divider />
          <Box
            sx={{
              px: 2.5,
              py: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.02)"
                  : "#f9fafb",
            }}
          >
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }} spacing={1.5}>
              <Button
                variant="outlined"
                color="inherit"
                size="medium"
                startIcon={<RestartAltIcon fontSize="small" />}
                onClick={onReset}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 1.5,
                  color: "text.secondary",
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "text.secondary",
                    backgroundColor: "action.hover",
                  },
                }}
              >
                {t("reset")}
              </Button>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="info"
                  size="medium"
                  onClick={handleCancel}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 1.5,
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<CheckIcon fontSize="small" />}
                  onClick={onApply}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2,
                    backgroundColor: "#6366f1",
                    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.28)",
                    "&:hover": {
                      backgroundColor: "#4f46e5",
                      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.38)",
                    },
                  }}
                >
                  {t("apply")}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default FilterDrawer;

