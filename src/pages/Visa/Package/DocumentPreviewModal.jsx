import { useMemo, useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { getOneVisaDocApi } from "../../../api/queries/getters";
import { deserializeBackendToDocument } from "./constants";
import { useLocale } from "../../../hooks/useLocale";
import { printElement } from "../../../functions/printHelper";

const DocumentPreviewModal = ({ open, onClose, document: doc }) => {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const docSheetRef = useRef(null);

  const docGuid = doc?.guid || doc?.id;
  const hasTables = doc?.tables?.length > 0;
  const shouldFetch = open && !!docGuid && !hasTables;

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
    staleTime: 30_000,
  });

  const currentDoc = useMemo(() => {
    if (hasTables) return doc;
    if (fetchedDoc) return fetchedDoc;
    return doc;
  }, [fetchedDoc, doc, hasTables]);

  if (!open || !doc) return null;

  const loading = shouldFetch && isLoading;

  const handlePrint = () => {
    if (docSheetRef.current) {
      printElement(docSheetRef.current, "");
    }
  };

  const handleCopyText = () => {
    if (!currentDoc) return;
    try {
      let textContent = `${currentDoc.title || t("visaDocument.title")}\n`;
      if (currentDoc.country) textContent += `${t("visaDocument.country")}: ${currentDoc.country}\n\n`;

      (currentDoc.tables || []).forEach((tbl, idx) => {
        textContent += `--- ${tbl.title || `TABLISA ${idx + 1}`} ---\n`;
        (tbl.rows || []).forEach((row, rIdx) => {
          const rowText = row
            .filter((c) => !c.isMerged)
            .map((c, cIdx) => {
              if (cIdx === 0) {
                return rIdx === 0 ? "№" : String(rIdx);
              }
              return c.text || "-";
            })
            .join(" | ");
          textContent += `${rowText}\n`;
        });
        if (tbl.note) textContent += `${t("visaDocument.tableNote")}: ${tbl.note}\n`;
        textContent += `\n`;
      });

      if (currentDoc.generalNote) {
        textContent += `${t("visaDocument.generalNote")}: ${currentDoc.generalNote}\n`;
      }

      navigator.clipboard.writeText(textContent);
      setCopied(true);
      toast.success(t("visaDocument.copiedSuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("visaDocument.copyError"));
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
            borderRadius: "16px",
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
              borderRadius: "8px",
              bgcolor: "rgba(24, 90, 189, 0.12)",
              color: "#185abd",
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {doc.title || t("visaDocument.previewTitle")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              {t("visaDocument.previewSubtitle")}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons on Toolbar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Tooltip title={t("visaDocument.copy")} placement="top">
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
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "0.85rem",
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
              {copied ? t("visaDocument.copied") : t("visaDocument.copy")}
            </Button>
          </Tooltip>

          <Button
            size="small"
            variant="contained"
            onClick={handlePrint}
            startIcon={<PrintRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              px: 2.5,
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
            {t("visaDocument.print")}
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
              {t("visaDocument.loadingDetails")}
            </Typography>
          </Box>
        ) : (
          /* Printable Sheet */
          <Box
            ref={docSheetRef}
            id="printable-word-document"
            sx={{
              width: "100%",
              maxWidth: "780px",
              minHeight: "980px",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              p: { xs: 3, sm: 5.5 },
              borderRadius: "2px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
              fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
              position: "relative",
            }}
          >
            {/* Main Document Title */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  fontSize: { xs: "1.35rem", sm: "1.65rem" },
                  letterSpacing: "-0.3px",
                  lineHeight: 1.3,
                  mb: 0.75,
                }}
              >
                {currentDoc?.title || t("visaDocument.title")}
              </Typography>
            </Box>

            {/* Tables */}
            {(currentDoc?.tables || []).map((table, tIdx) => (
              <Box key={table.id || tIdx} sx={{ mb: 4.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ width: 3.5, height: 16, bgcolor: "#1e293b", borderRadius: "2px" }} />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      letterSpacing: "0.5px",
                      color: "#0f172a",
                      textTransform: "uppercase",
                    }}
                  >
                    {table.title || (tIdx === 0 ? "Gerekli resminamalar" : "Wizaň bahalary we möhletleri")}
                  </Typography>
                </Box>

                {/* Table Grid */}
                <Box
                  sx={{
                    width: "100%",
                    overflowX: "auto",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: "4px",
                    mb: 1.5,
                  }}
                >
                  <Box
                    component="table"
                    sx={{
                      width: "100%",
                      borderCollapse: "collapse",
                      "& td, & th": {
                        border: "1px solid #cbd5e1",
                        p: "11px 14px",
                        fontSize: "0.88rem",
                        color: "#0f172a",
                        lineHeight: 1.45,
                      },
                    }}
                  >
                    <tbody>
                      {(() => {
                        let headerRowCount = 1;
                        (table.rows?.[0] || []).forEach((c) => {
                          if (c && c.rowSpan && c.rowSpan > headerRowCount) {
                            headerRowCount = c.rowSpan;
                          }
                        });

                        return (table.rows || []).map((row, rIdx) => {
                          const isHeaderRow = rIdx < headerRowCount;
                          const dataRowNumber = rIdx >= headerRowCount ? rIdx - headerRowCount + 1 : 0;

                          return (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => {
                                const isOrderCol = cIdx === 0;

                                if (isOrderCol) {
                                  if (rIdx > 0 && rIdx < headerRowCount) return null;
                                } else if (cell.isMerged) {
                                  return null;
                                }

                                const displayValue = isOrderCol
                                  ? isHeaderRow
                                    ? "№"
                                    : dataRowNumber
                                  : cell.text || "—";

                                const cellRowSpan = isOrderCol && isHeaderRow ? headerRowCount : cell.rowSpan || 1;
                                const cellColSpan = isOrderCol ? 1 : cell.colSpan || 1;

                                return (
                                  <td
                                    key={cell.id || `${rIdx}-${cIdx}`}
                                    colSpan={cellColSpan}
                                    rowSpan={cellRowSpan}
                                    style={{
                                      fontWeight: isHeaderRow ? 700 : isOrderCol ? 600 : 400,
                                      backgroundColor: isHeaderRow
                                        ? "#f1f5f9"
                                        : isOrderCol
                                          ? "#fafbfc"
                                          : "#ffffff",
                                      color: isHeaderRow ? "#0f172a" : "#334155",
                                      textAlign: isOrderCol ? "center" : "left",
                                      width: isOrderCol ? "48px" : undefined,
                                    }}
                                  >
                                    {displayValue}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </Box>
                </Box>

                {/* Table Note */}
                {table.note && (
                  <Box sx={{ mt: 1.5, px: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#0f172a",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 700,
                          color: "#0f172a",
                          mr: 0.75,
                        }}
                      >
                        Bellik:
                      </Box>
                      {table.note}
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
                  borderTop: "1px solid #cbd5e1",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "#0f172a",
                    mb: 1,
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                  }}
                >
                  {t("visaDocument.generalNote")}:
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "#0f172a",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.65,
                  }}
                >
                  {currentDoc.generalNote}
                </Typography>
              </Box>
            )}

          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;
