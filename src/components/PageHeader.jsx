import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Helmet } from "react-helmet-async";

const PageHeader = ({ title, pageTitle, addButtonText, onAddClick, filterButtonText, onFilterClick, children }) => {
  const showAddButton = Boolean(onAddClick);
  const showFilterButton = Boolean(onFilterClick);

  return (
    <>
    {pageTitle && (
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
    )}
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
              variant="contained"
              startIcon={<FilterListIcon sx={{ fontSize: "17px !important" }} />}
              onClick={onFilterClick}
              disableElevation
              sx={{
                height: "40px",
                px: 2.5,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                whiteSpace: "nowrap",

                // Slate-indigo palet
                backgroundColor: "#868688",
                color: "#ffffff",
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.28)",

                transition:
                  "background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",

                "&:hover": {
                  backgroundColor: "#4f46e5",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.38)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                  boxShadow: "0 1px 4px rgba(99, 102, 241, 0.22)",
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
              onClick={onAddClick}
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
