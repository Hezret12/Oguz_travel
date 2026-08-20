import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { getOneVisaDocApi } from "../../../api/queries/getters";
import { useDateFormat } from "../../../functions/generalHelpers";
import { deserializeBackendToDocument } from "./constants";

const DocumentPreviewModal = ({ open, onClose, document: doc }) => {
  const [copied, setCopied] = useState(false);
  const { formatChange } = useDateFormat();

  // Determine if we need to fetch full details from backend
  const docGuid = doc?.guid || doc?.id;
  const hasTables = doc?.tables?.length > 0;
  const shouldFetch = open && !!docGuid && !hasTables;

  // TanStack Query — fetch full doc details only when needed
  const { data: fetchedDoc, isLoading } = useQuery({
    queryKey: ["visaDocPreview", docGuid],
    queryFn: async () => {
      const res = await getOneVisaDocApi(docGuid);
      const dataObj = res?.data?.data || res?.data;
      if (dataObj) {
        return deserializeBackendToDocument(dataObj);
      }
      return null;
    },
    enabled: shouldFetch,
    staleTime: 30_000, // Cache for 30s to avoid refetching on reopen
  });

  // Derive the current document — no setState needed
  const currentDoc = useMemo(() => {
    if (fetchedDoc) return fetchedDoc;
    if (doc) return doc;
    return null;
  }, [fetchedDoc, doc]);

  if (!open || !doc) return null;

  const loading = shouldFetch && isLoading;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!currentDoc) return;
    try {
      let textContent = `${currentDoc.title || "Wiza Dokumenti"}\n`;
      if (currentDoc.country) textContent += `Ýurt: ${currentDoc.country}\n\n`;

      (currentDoc.tables || []).forEach((tbl, idx) => {
        textContent += `--- ${tbl.title || `TABLISA ${idx + 1}`} ---\n`;
        (tbl.rows || []).forEach((row) => {
          const rowText = row
            .filter((c) => !c.isMerged)
            .map((c) => c.text || "-")
            .join(" | ");
          textContent += `${rowText}\n`;
        });
        if (tbl.note) textContent += `Bellik: ${tbl.note}\n`;
        textContent += `\n`;
      });

      if (currentDoc.generalNote) {
        textContent += `Umumy Bellik: ${currentDoc.generalNote}\n`;
      }

      navigator.clipboard.writeText(textContent);
      setCopied(true);
      toast.success("Dokument teksti göçürildi!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Göçürip bolmady.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            maxHeight: "94vh",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#0f172a" : "#f8fafc",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Top Toolbar (Non-printable) */}
      <DialogTitle
        className="no-print"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#1e293b" : "#ffffff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "rgba(24, 90, 189, 0.12)",
              color: "#185abd",
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {doc.title || "Dokument Önizleme"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Word / A4 Çap Formaty
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons on Toolbar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Tooltip title="Teksti göçürip al" placement="top">
            <Button
              size="small"
              variant="outlined"
              onClick={handleCopyText}
              startIcon={
                copied ? (
                  <CheckRoundedIcon sx={{ fontSize: 16, color: "success.main" }} />
                ) : (
                  <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "0.82rem",
                fontWeight: 600,
                borderColor: "divider",
                color: "text.secondary",
                px: 1.75,
                py: 0.6,
                "&:hover": {
                  borderColor: "text.primary",
                  color: "text.primary",
                  backgroundColor: "action.hover",
                },
              }}
            >
              {copied ? "Göçürildi" : "Göçür"}
            </Button>
          </Tooltip>

          <Button
            size="small"
            variant="contained"
            onClick={handlePrint}
            startIcon={<PrintRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              px: 2.25,
              py: 0.65,
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)"
                  : "#0E8584",
              border: "0.5px solid #2CA7A6",
              color: "#ffffff",
              boxShadow: "0 2px 8px rgba(14, 133, 132, 0.28)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #0B7F74 0%, #0891B2 100%)"
                    : "#0C7776",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 14px rgba(14, 133, 132, 0.36)",
              },
            }}
          >
            Çap et (Print)
          </Button>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "text.secondary",
              p: 0.75,
              borderRadius: "8px",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Main A4 Document Sheet Canvas */}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 4 },
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#0b0f19" : "#e2e8f0",
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: loading ? "center" : "flex-start",
          minHeight: "400px",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8 }}>
            <CircularProgress sx={{ color: "#0c8a7b" }} />
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Dokument maglumatlary ýüklenýär...
            </Typography>
          </Box>
        ) : (
          /* Printable Sheet */
          <Box
            id="printable-word-document"
            sx={{
              width: "100%",
              maxWidth: "760px",
              minHeight: "960px",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              p: { xs: 3, sm: 5 },
              borderRadius: "4px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06)",
              fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
              position: "relative",
            }}
          >
            {/* Document Header Letterhead */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 2.5,
                mb: 3.5,
                borderBottom: "2px solid #0f766e",
              }}
            >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  bgcolor: "#0f766e",
                  color: "#ffffff",
                }}
              >
                <FlightTakeoffRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    letterSpacing: "0.5px",
                    color: "#0f766e",
                    lineHeight: 1.1,
                  }}
                >
                  OGUZ TRAVEL
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                  WIZA WE SYÝAHAT GULLUGY
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Chip
                label={currentDoc?.country || "Wiza Resminamasy"}
                size="small"
                sx={{
                  bgcolor: "#f0fdfa",
                  color: "#0f766e",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  border: "1px solid #ccfbf1",
                  borderRadius: "6px",
                  mb: 0.5,
                }}
              />
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 500 }}>
                Senesi: {formatChange(currentDoc?.updatedAt, { dateOnly: true }) || "—"}
              </Typography>
            </Box>
          </Box>

          {/* Main Document Title */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                fontSize: { xs: "1.3rem", sm: "1.55rem" },
                letterSpacing: "-0.3px",
                lineHeight: 1.25,
                mb: 0.5,
              }}
            >
              {currentDoc?.title || "Täze wiza dokumenti"}
            </Typography>
            {currentDoc?.country && (
              <Typography sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.95rem" }}>
                Ýurt: {currentDoc.country}
              </Typography>
            )}
          </Box>

          {/* Tables */}
          {(currentDoc?.tables || []).map((table, tIdx) => (
            <Box key={table.id || tIdx} sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.25,
                }}
              >
                <Box sx={{ width: 4, height: 16, bgcolor: "#0f766e", borderRadius: "2px" }} />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.86rem",
                    letterSpacing: "0.5px",
                    color: "#0f172a",
                    textTransform: "uppercase",
                  }}
                >
                  {table.title || `TABLISA ${tIdx + 1}`}
                </Typography>
              </Box>

              {/* Table Grid */}
              <Box
                sx={{
                  width: "100%",
                  overflowX: "auto",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  mb: 1.25,
                }}
              >
                <Box
                  component="table"
                  sx={{
                    width: "100%",
                    borderCollapse: "collapse",
                    "& td, & th": {
                      border: "1px solid #cbd5e1",
                      p: "10px 14px",
                      fontSize: "0.88rem",
                      color: "#1e293b",
                      lineHeight: 1.4,
                    },
                  }}
                >
                  <tbody>
                    {(table.rows || []).map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => {
                          if (cell.isMerged) return null;
                          const isHeaderRow = rIdx === 0;
                          return (
                            <td
                              key={cell.id || `${rIdx}-${cIdx}`}
                              colSpan={cell.colSpan || 1}
                              rowSpan={cell.rowSpan || 1}
                              style={{
                                fontWeight: isHeaderRow ? 700 : 400,
                                backgroundColor: isHeaderRow ? "#f1f5f9" : "#ffffff",
                                color: isHeaderRow ? "#0f172a" : "#334155",
                              }}
                            >
                              {cell.text || "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Box>
              </Box>

              {/* Table Note */}
              {table.note && (
                <Box
                  sx={{
                    bgcolor: "#f8fafc",
                    p: 1.5,
                    borderRadius: "6px",
                    borderLeft: "3px solid #0f766e",
                  }}
                >
                  <Typography sx={{ fontSize: "0.82rem", color: "#475569" }}>
                    <strong style={{ color: "#0f172a" }}>Bellik:</strong> {table.note}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}

          {/* Global General Note */}
          {currentDoc?.generalNote && (
            <Box
              sx={{
                mt: 4,
                pt: 2.5,
                borderTop: "1px dashed #cbd5e1",
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: "0.84rem", color: "#0f172a", mb: 0.75 }}>
                UMUMY BELLIK
              </Typography>
              <Typography sx={{ fontSize: "0.88rem", color: "#334155", whiteSpace: "pre-wrap" }}>
                {currentDoc.generalNote}
              </Typography>
            </Box>
          )}

          {/* Document Footer Stamp / Official Sign Note */}
          <Box
            sx={{
              mt: 6,
              pt: 3,
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              Oguz Travel Wiza Bölümi • Maglumat beriş resminamasy
            </Typography>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                Oguz Travel Maslahatçysy
              </Typography>
              <Box sx={{ width: "120px", borderBottom: "1px solid #cbd5e1", mt: 2.5 }} />
            </Box>
          </Box>
        </Box>
        )}
      </DialogContent>

      {/* Global CSS for Clean Printing */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-word-document, #printable-word-document * {
              visibility: visible !important;
            }
            #printable-word-document {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 20px !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </Dialog>
  );
};

export default DocumentPreviewModal;
