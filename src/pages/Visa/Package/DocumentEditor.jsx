import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Grid,
  Tooltip,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import DynamicTable from "./DynamicTable";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { createDocumentsTable, createPricesTable } from "./constants";
import { useLocale } from "../../../hooks/useLocale";

const DocumentEditor = ({ initialDocument, onBack, onSave, isSaving = false }) => {
  const { t } = useLocale();

  const [docData, setDocData] = useState(() => {
    let tables = initialDocument.tables || [];
    if (tables.length === 0) {
      tables = [createDocumentsTable(), createPricesTable()];
    } else if (tables.length === 1) {
      tables = [tables[0], createPricesTable()];
    } else if (tables.length > 2) {
      tables = tables.slice(0, 2);
    }
    return { ...initialDocument, tables };
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  const handleTitleChange = (e) => {
    setDocData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleCountryChange = (e) => {
    setDocData((prev) => ({ ...prev, country: e.target.value }));
  };

  const handleUpdateTable = (updatedTable) => {
    setDocData((prev) => ({
      ...prev,
      tables: (prev.tables || []).map((tbl) =>
        tbl.id === updatedTable.id ? updatedTable : tbl
      ),
    }));
  };

  const handleSaveClick = () => {
    const updated = {
      ...docData,
      title: docData.title?.trim() || t("visaDocument.newDocument"),
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
  };

  const isEditMode = docData.id && !String(docData.id).startsWith("doc-");

  return (
    <Box sx={{ minHeight: "100%", pb: 8 }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: { xs: 2, sm: 3 },
          mb: 3.5,
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Back and Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackRoundedIcon />}
            variant="outlined"
            sx={{
              textTransform: "none",
              color: "text.primary",
              borderColor: "divider",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              px: 2,
              py: 0.75,
              "&:hover": {
                borderColor: "text.primary",
                backgroundColor: "action.hover",
              },
            }}
          >
            {t("visaDocument.back")}
          </Button>

          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
            {isEditMode ? t("visaDocument.editDocument") : t("visaDocument.newDocument")}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setPreviewOpen(true)}
            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "divider",
              color: "text.primary",
              fontWeight: 600,
              fontSize: "0.9rem",
              px: 2.25,
              py: 0.75,
              "&:hover": {
                borderColor: "text.primary",
                backgroundColor: "action.hover",
              },
            }}
          >
            {t("visaDocument.preview")}
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveClick}
            disabled={isSaving}
            startIcon={
              isSaving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveRoundedIcon sx={{ fontSize: 20 }} />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              px: 3,
              py: 0.8,
            }}
          >
            {isSaving ? t("visaDocument.saving") : t("visaDocument.save")}
          </Button>
        </Box>
      </Box>

      {/* Main Content Form */}
      <Box
        sx={{
          maxWidth: "90%",
          width: "100%",
          mx: "auto",
          px: { xs: 2, sm: 3 },
          pb: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3.5,
        }}
      >
        {/* Document Basic Info Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "text.primary",
              mb: 2.5,
            }}
          >
            {t("visaDocument.basicInfo")}
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.88rem" }}>
                  {t("visaDocument.docTitle")} *
                </Typography>
                <Tooltip title={t("visaDocument.docTitleHelper")} placement="top" arrow>
                  <HelpOutlineRoundedIcon
                    sx={{
                      fontSize: 15,
                      color: "text.secondary",
                      cursor: "pointer",
                      opacity: 0.65,
                      "&:hover": { opacity: 1, color: "primary.main" },
                    }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                value={docData.title || ""}
                onChange={handleTitleChange}
                placeholder={t("visaDocument.docTitlePlaceholder")}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      minHeight: "44px",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
                    },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.88rem" }}>
                  {t("visaDocument.country")} *
                </Typography>
                <Tooltip title={t("visaDocument.countryHelper")} placement="top" arrow>
                  <HelpOutlineRoundedIcon
                    sx={{
                      fontSize: 15,
                      color: "text.secondary",
                      cursor: "pointer",
                      opacity: 0.65,
                      "&:hover": { opacity: 1, color: "primary.main" },
                    }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                value={docData.country || ""}
                onChange={handleCountryChange}
                placeholder={t("visaDocument.countryPlaceholder")}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      minHeight: "44px",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Dynamic Tables */}
        {(docData.tables || []).map((table, index) => (
          <DynamicTable
            key={table.id || index}
            table={table}
            tableIndex={index}
            onUpdate={handleUpdateTable}
          />
        ))}
      </Box>

      {/* Preview Modal */}
      <DocumentPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={docData}
      />
    </Box>
  );
};

export default DocumentEditor;
