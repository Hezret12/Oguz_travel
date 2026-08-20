import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Chip,
  CircularProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import DynamicTable from "./DynamicTable";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { createDocumentsTable, createPricesTable } from "./constants";
import { useDateFormat } from "../../../functions/generalHelpers";

const DocumentEditor = ({ initialDocument, onBack, onSave, isSaving = false }) => {
  const { formatChange } = useDateFormat();

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

  // Quick stats calculation
  const totalTables = docData.tables?.length || 0;
  const totalRows = (docData.tables || []).reduce(
    (acc, t) => acc + Math.max(0, (t.rows?.length || 1) - 1),
    0
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        pb: 8,
      }}
    >
      {/* Top Bar Header Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
          px: { xs: 2, sm: 3 },
          mb: 3.5,
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(15, 23, 42, 0.82)"
              : "rgba(255, 255, 255, 0.85)",
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 20px rgba(0, 0, 0, 0.25)"
              : "0 2px 12px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Left: Back button & Breadcrumb */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 19 }} />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              fontWeight: 600,
              fontSize: "0.88rem",
              borderRadius: "10px",
              px: 1.5,
              py: 0.65,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&:hover": {
                borderColor: "text.primary",
                color: "text.primary",
                backgroundColor: "action.hover",
              },
            }}
          >
            Sanawa gaýt
          </Button>

          <Divider orientation="vertical" flexItem sx={{ height: 20, my: "auto" }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                bgcolor: "rgba(24, 90, 189, 0.12)",
                color: "#185abd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {docData.title?.trim() || "Täze wiza dokumenti"}
            </Typography>
            <Chip
              label={docData.id && !String(docData.id).startsWith("doc-") ? "Düzeldilýär" : "Täze"}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 700,
                borderRadius: "6px",
                bgcolor: docData.id && !String(docData.id).startsWith("doc-")
                  ? "rgba(14, 133, 132, 0.12)"
                  : "rgba(59, 130, 246, 0.12)",
                color: docData.id && !String(docData.id).startsWith("doc-")
                  ? "primary.main"
                  : "#2563eb",
              }}
            />
          </Box>
        </Box>

        {/* Right: Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Tooltip title="Word/A4 formatynda önizleme we çap etmek" placement="bottom">
            <Button
              variant="outlined"
              onClick={() => setPreviewOpen(true)}
              startIcon={<VisibilityRoundedIcon sx={{ fontSize: 18, color: "#185abd" }} />}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                borderColor: "divider",
                color: "text.primary",
                fontWeight: 600,
                fontSize: "0.85rem",
                px: 2,
                py: 0.65,
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  borderColor: "#185abd",
                  color: "#185abd",
                  backgroundColor: "rgba(24, 90, 189, 0.04)",
                },
              }}
            >
              Word Önizleme
            </Button>
          </Tooltip>

          <Button
            variant="contained"
            onClick={handleSaveClick}
            disabled={isSaving}
            startIcon={
              isSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.88rem",
              px: 2.75,
              py: 0.7,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)"
                  : "#0E8584",
              border: "0.5px solid #2CA7A6",
              color: "#ffffff",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 2px 10px rgba(0, 0, 0, 0.35)"
                  : "0 2px 10px rgba(14, 133, 132, 0.28)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #0B7F74 0%, #0891B2 100%)"
                    : "#0C7776",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 16px rgba(14, 133, 132, 0.38)",
              },
            }}
          >
            {isSaving ? "Ýatlanýar..." : "Ýatda sakla"}
          </Button>
        </Box>
      </Box>

      {/* Editor Content Stream */}
      <Box
        sx={{
          maxWidth: "960px",
          width: "100%",
          mx: "auto",
          px: { xs: 1.5, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Document Metadata Hero Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            p: { xs: 2.5, sm: 3.5 },
            position: "relative",
            overflow: "hidden",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 32px rgba(0, 0, 0, 0.2)"
                : "0 4px 24px rgba(0, 0, 0, 0.03)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #185ABD 0%, #0E8584 100%)",
            },
          }}
        >
          {/* Header Row with Badge & Stats */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditNoteRoundedIcon sx={{ fontSize: 20, color: "primary.main" }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "0.8px",
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                }}
              >
                Esasy maglumatlar
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                icon={<TableChartRoundedIcon sx={{ fontSize: 14 }} />}
                label={`${totalTables} Tablisa`}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  borderColor: "divider",
                  color: "text.secondary",
                }}
              />
              <Chip
                label={`${totalRows} maglumat setiri`}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  borderColor: "divider",
                  color: "text.secondary",
                }}
              />
              {docData.updatedAt && (
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                  • {formatChange(docData.updatedAt, { dateOnly: true })}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Document Title Input */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="standard"
              value={docData.title || ""}
              onChange={handleTitleChange}
              placeholder="Dokumentiň ady (meselem: Hytaý Wiza Paketi)"
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: {
                    fontSize: { xs: "1.35rem", sm: "1.65rem" },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.25,
                    "& input": {
                      p: 0,
                      "&::placeholder": {
                        color: "text.secondary",
                        opacity: 0.5,
                      },
                    },
                  },
                },
              }}
            />
          </Box>

          {/* Country Input Bar with Public Icon */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              pt: 1.5,
              borderTop: "1px dashed",
              borderColor: "divider",
            }}
          >
            <PublicRoundedIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.8 }} />
            <TextField
              fullWidth
              variant="standard"
              value={docData.country || ""}
              onChange={handleCountryChange}
              placeholder="Degişli ýurt ýa-da ugry (meselem: Hytaý Halk Respublikasy, BAE, Saud Arabystany)"
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: {
                    fontSize: "0.92rem",
                    fontWeight: 500,
                    color: "text.primary",
                    "& input": {
                      p: 0,
                      "&::placeholder": {
                        color: "text.secondary",
                        opacity: 0.6,
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        </Paper>

        {/* Dynamic Tables Stream */}
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
            borderRadius: "18px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            p: { xs: 2.5, sm: 3 },
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.15)"
                : "0 2px 16px rgba(0, 0, 0, 0.02)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                bgcolor: "rgba(234, 179, 8, 0.12)",
                color: "warning.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NoteAltOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: "0.8px",
                color: "text.secondary",
                fontSize: "0.75rem",
                textTransform: "uppercase",
              }}
            >
              Umumy Bellik
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            value={docData.generalNote || ""}
            onChange={handleGeneralNoteChange}
            placeholder="Dokument boýunça goşmaça umumy bellikler we şertler..."
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  fontSize: "0.92rem",
                  color: "text.primary",
                  p: 0,
                  lineHeight: 1.6,
                  "& textarea::placeholder": {
                    color: "text.secondary",
                    opacity: 0.55,
                  },
                },
              },
            }}
          />
        </Paper>

        {/* Pro Tips Banner */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderRadius: "14px",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(14, 133, 132, 0.04)",
            border: "1px solid",
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.06)"
                : "rgba(14, 133, 132, 0.12)",
          }}
        >
          <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 20, color: "primary.main", flexShrink: 0 }} />
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.8rem",
              lineHeight: 1.5,
            }}
          >
            <strong>Professional Maslahat:</strong> Her öýjügiň sag tarapyndaky <strong>⋮</strong> menýusy arkaly öýjükleri saga/aşak birikdirip (merge), bölüp (split), ýa-da sütünleriň/setirleriň ýerini çalşyp bilersiňiz.
          </Typography>
        </Box>
      </Box>

      {/* Document Full Word/A4 Preview Modal */}
      <DocumentPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={docData}
      />
    </Box>
  );
};

export default DocumentEditor;
