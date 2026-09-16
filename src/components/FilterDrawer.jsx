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
import { Funnel } from "lucide-react";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckIcon from "@mui/icons-material/Check";
import { useLocale } from "../hooks/useLocale";

const FilterDrawer = ({
  open,
  onClose,
  onApply,
  // eslint-disable-next-line no-unused-vars
  onCancel,
  onReset,
  showFooter = true,
  children,
}) => {
  const { t } = useLocale();

  // const handleCancel = () => {
  //   if (onCancel) {
  //     onCancel();
  //   } else if (onClose) {
  //     onClose();
  //   }
  // };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      disableScrollLock
      transitionDuration={{ enter: 260, exit: 200 }}
      sx={(theme) => ({
        zIndex: theme.zIndex.drawer + 2,
      })}
      slotProps={{
        paper: {
          sx: (theme) => ({
            width: { xs: "100%", sm: 380 },
            zIndex: "inherit",
            backgroundColor: theme.palette.background.paper,
            borderLeft: "1px solid",
            borderColor: "divider",
            boxShadow: (t) =>
              t.palette.mode === "dark"
                ? "-4px 0 20px rgba(0,0,0,0.4)"
                : "-4px 0 20px rgba(0,0,0,0.07)",
            display: "flex",
            flexDirection: "column",
            willChange: "transform",
            transform: "translateZ(0)",
          }),
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          px: 2.5,
          py: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <Funnel size={18} />
          <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
            {t("filter")}
          </Typography>
        </Stack>

        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Filtreyi kapat"
          sx={{
            color: "text.secondary",
            borderRadius: "8px",
            "&:hover": {
              color: "text.primary",
              backgroundColor: "action.hover",
            },
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
            <Stack direction="row" spacing={1.5}>
              {/* <Button
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
                </Button> */}
              <Button
                variant="outlined"
                color="inherit"
                size="medium"
                fullWidth
                startIcon={<RestartAltIcon fontSize="small" />}
                onClick={onReset}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  width: 'full',
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
              <Button
                variant="contained"
                size="medium"
                fullWidth
                disableElevation
                startIcon={<CheckIcon fontSize="small" />}
                onClick={onApply}
                sx={{
                  borderRadius: "10px",
                  width: "full",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)"
                      : "#0E8584",
                  border: "0.5px solid #2CA7A6",
                  color: "#ffffff",
                  transition:
                    "background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
                  "&:hover": {
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, #0B7F74 0%, #0891B2 100%)"
                        : "#0C7776",
                    transform: "translateY(-1px)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                {t("apply")}
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default FilterDrawer;
