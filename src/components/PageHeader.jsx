import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Funnel } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const PageHeader = ({ title, pageTitle, addButtonText, onAddClick, filterButtonText, onFilterClick, children }) => {
  useDocumentTitle(pageTitle);

  const showAddButton = Boolean(onAddClick);
  const showFilterButton = Boolean(onFilterClick);

  return (
    <>
    <Stack
      direction="row"
      sx={{ py: 2, width: "100%", alignItems: "center", justifyContent: "space-between" }}
    >
      <Typography
        variant="h5"
        sx={{
          flex: 1,
          fontWeight: 600,
          fontSize: { xs: "20px", sm: "24px" },
          letterSpacing: "-0.3px",
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>

      {(showFilterButton || showAddButton || children) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {children}

          {/* Filter butonu */}
          {showFilterButton && (
            <Button
              variant="outlined"
              startIcon={
                <Funnel
                  size={16}
                  style={{
                    opacity: 0.8,
                    transition: "transform 0.2s ease",
                  }}
                />
              }
              onClick={(e) => {
                e.currentTarget.blur();
                onFilterClick(e);
              }}
              disableElevation
              sx={{
                height: "40px",
                px: 2.5,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                letterSpacing: "0.1px",
                whiteSpace: "nowrap",
                borderColor: "divider",
                color: "text.primary",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(0, 0, 0, 0.02)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 2px 8px rgba(0, 0, 0, 0.32)"
                    : "0 1px 4px rgba(0, 0, 0, 0.04)",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.05)",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.20)"
                      : "rgba(0, 0, 0, 0.18)",
                  color: "text.primary",
                  transform: "translateY(-1px)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 4px 14px rgba(0, 0, 0, 0.45)"
                      : "0 4px 12px rgba(0, 0, 0, 0.08)",
                  "& svg": {
                    transform: "scale(1.08)",
                  },
                },
                "&:active": {
                  transform: "scale(0.98)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 1px 4px rgba(0, 0, 0, 0.24)"
                      : "0 1px 2px rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              {filterButtonText ?? "Filtrele"}
            </Button>
          )}


          {showAddButton && (
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: "18px !important" }} />}
              onClick={(e) => {
                e.currentTarget.blur();
                onAddClick(e);
              }}
              disableElevation
              sx={{
                height: "40px",
                px: 2.5,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                letterSpacing: "0.1px",
                whiteSpace: "nowrap",
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)"
                    : "#0E8584",
                border: "0.5px solid #2CA7A6",
                color: "#ffffff",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 2px 8px rgba(0, 0, 0, 0.32)"
                    : "0 2px 8px rgba(14, 133, 132, 0.30)",

                transition:
                  "background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",

                "&:hover": {
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, #0B7F74 0%, #0891B2 100%)"
                      : "#0C7776",
                  transform: "translateY(-1px)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 4px 14px rgba(0, 0, 0, 0.38)"
                      : "0 4px 14px rgba(14, 133, 132, 0.36)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 1px 4px rgba(0, 0, 0, 0.28)"
                      : "0 1px 4px rgba(14, 133, 132, 0.24)",
                },
              }}
            >
              {addButtonText ?? "Ekle"}
            </Button>
          )}
        </Box>
      )}
    </Stack>
    </>
  );
};

export default PageHeader;
