import { Box, Button, Stack, Typography } from "@mui/material";
import { Funnel } from "lucide-react";
import AddButton from "./AddButton";
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
                {filterButtonText}
              </Button>
            )}

            {showAddButton && (
              <AddButton onClick={onAddClick}>{addButtonText}</AddButton>
            )}
          </Box>
        )}
      </Stack>
    </>
  );
};

export default PageHeader;
