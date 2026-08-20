import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Grid,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DynamicTable from "./DynamicTable";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { createDocumentsTable, createPricesTable } from "./constants";

const DocumentEditor = ({ initialDocument, onBack, onSave, isSaving = false }) => {
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

  const handleGeneralNoteChange = (e) => {
    setDocData((prev) => ({ ...prev, generalNote: e.target.value }));
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
      title: docData.title?.trim() || "Täze wiza dokumenti",
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
            Yza
          </Button>

          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
            {isEditMode ? "Dokumenti düzetmek" : "Täze wiza dokumenti"}
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
            Word Önizleme
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
            {isSaving ? "Ýatlanýar..." : "Ýatda sakla"}
          </Button>
        </Box>
      </Box>

      {/* Main Content Form */}
      <Box
        sx={{
          maxWidth: "960px",
          width: "100%",
          mx: "auto",
          px: { xs: 2, sm: 3 },
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
            Esasy maglumatlar
          </Typography>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.88rem" }}>
                  Dokumentiň ady *
                </Typography>
              </Box>
              <TextField
                fullWidth
                value={docData.title || ""}
                onChange={handleTitleChange}
                placeholder="Meselem: Hytaý Wiza Paketi"
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
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.88rem" }}>
                  Ýurt / Ugur *
                </Typography>
              </Box>
              <TextField
                fullWidth
                value={docData.country || ""}
                onChange={handleCountryChange}
                placeholder="Meselem: Hytaý, BAE, Saud Arabystany"
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

        {/* General Note Card */}
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
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
              Umumy bellik
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.84rem" }}>
              Dokumentiň ahyrynda görkeziljek goşmaça düşündirişler (islege görä)
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            value={docData.generalNote || ""}
            onChange={handleGeneralNoteChange}
            placeholder="Goşmaça umumy bellikler we şertler..."
            slotProps={{
              input: {
                sx: {
                  borderRadius: "8px",
                  fontSize: "0.92rem",
                  p: 1.5,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
                },
              },
            }}
          />
        </Paper>
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
