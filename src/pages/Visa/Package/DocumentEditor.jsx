import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import toast from "react-hot-toast";
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        pb: 6,
      }}
    >
      {/* Top Bar Header Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
          px: { xs: 1, sm: 2 },
          mb: 3,
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(8px)",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(18, 24, 38, 0.85)"
              : "rgba(248, 250, 252, 0.85)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Back button */}
        <Button
          onClick={onBack}
          startIcon={<ArrowBackRoundedIcon />}
          sx={{
            textTransform: "none",
            color: "text.primary",
            fontWeight: 700,
            fontSize: "0.95rem",
            borderRadius: "10px",
            px: 1.5,
            py: 0.75,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          Dokument
        </Button>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setPreviewOpen(true)}
            startIcon={<VisibilityRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              borderColor: "divider",
              color: "text.primary",
              fontWeight: 600,
              fontSize: "0.88rem",
              px: 2.25,
              py: 0.75,
              bgcolor: "background.paper",
              "&:hover": {
                borderColor: "text.primary",
                backgroundColor: "action.hover",
              },
            }}
          >
            Tamam
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveClick}
            disabled={isSaving}
            startIcon={
              isSaving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.88rem",
              px: 2.5,
              py: 0.75,
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
              transition: "all 0.2s ease",
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
            }}
          >
            Ýatda sakla
          </Button>
        </Box>
      </Box>

      {/* Editor Content Area (Centered Card Stream) */}
      <Box
        sx={{
          maxWidth: "880px",
          width: "100%",
          mx: "auto",
          px: { xs: 1.5, sm: 3 },
        }}
      >
        {/* Document Info Card: Title + Country */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            p: { xs: 2.5, sm: 3.5 },
            mb: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: "1px",
              color: "text.secondary",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              display: "block",
              mb: 1,
            }}
          >
            DOKUMENTIŇ ADY
          </Typography>

          <TextField
            fullWidth
            variant="standard"
            value={docData.title || ""}
            onChange={handleTitleChange}
            placeholder="Täze wiza dokumenti"
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  fontSize: { xs: "1.4rem", sm: "1.75rem" },
                  fontWeight: 800,
                  color: "text.primary",
                  mb: 1.5,
                  lineHeight: 1.2,
                  "& input": {
                    p: 0,
                  },
                },
              },
            }}
          />

          <TextField
            fullWidth
            variant="standard"
            value={docData.country || ""}
            onChange={handleCountryChange}
            placeholder="Ýurt (meselem: Hytaý, Rossiýa, Dubaý)"
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "text.secondary",
                  "& input": {
                    p: 0,
                  },
                },
              },
            }}
          />
        </Paper>

        {/* 2 Static Dynamic Tables (1: Documents, 2: Prices) */}
        {(docData.tables || []).map((table, index) => (
          <DynamicTable
            key={table.id || index}
            table={table}
            tableIndex={index}
            onUpdate={handleUpdateTable}
          />
        ))}

        {/* Global General Note Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            p: { xs: 2.5, sm: 3 },
            mb: 4,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
            <NoteAltOutlinedIcon sx={{ fontSize: 18, color: "warning.main" }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: "1px",
                color: "text.secondary",
                fontSize: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              BELLIK
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            value={docData.generalNote || ""}
            onChange={handleGeneralNoteChange}
            placeholder="Bu ýere bellik ýazyň..."
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  fontSize: "0.92rem",
                  color: "text.primary",
                  p: 0,
                },
              },
            }}
          />
        </Paper>

        {/* Footer Helper Caption */}
        <Typography
          variant="caption"
          align="center"
          sx={{
            display: "block",
            color: "text.secondary",
            fontSize: "0.78rem",
            px: 2,
            lineHeight: 1.5,
          }}
        >
          Her bir tablisa üçin setir/sütün goşup, cell-i : menýusy bilen birikdirip bilersiňiz. Hemmesi awtomatiki ýatda saklanýar.
        </Typography>
      </Box>

      {/* Document Full Preview Modal */}
      <DocumentPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={docData}
      />
    </Box>
  );
};

export default DocumentEditor;
