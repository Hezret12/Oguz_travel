import { useMemo, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import { useQuery } from "@tanstack/react-query";
import { getOneVisaDocApi } from "../../../api/queries/getters";
import { deserializeBackendToDocument } from "./constants";
import { useLocale } from "../../../hooks/useLocale";
import { printElement } from "../../../functions/printHelper";
import { useDateFormat } from "../../../functions/generalHelpers";
import OguzLogo from "../../../assets/icons/OguzLogo";

const BRAND_COLOR = "#0B6E6D";
const BRAND_COLOR_DARK = "#095B5B";

const DocumentPreviewModal = ({ open, onClose, document: doc }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
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

  const docRef = useMemo(() => {
    const raw = currentDoc?.guid || currentDoc?.id || docGuid || "";
    return raw.toString().slice(0, 8).toUpperCase();
  }, [currentDoc, docGuid]);

  const generatedOn = useMemo(() => formatChange(new Date(), { dateOnly: true }), [formatChange]);

  if (!open || !doc) return null;

  const loading = shouldFetch && isLoading;

  const handlePrint = () => {
    if (docSheetRef.current) {
      printElement(docSheetRef.current, "");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "18px",
            maxHeight: "94vh",
            maxWidth: "960px",
            backgroundColor: "background.default",
            border: "1px solid",
            borderColor: "divider",
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
          justifyContent: "flex-end",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        {/* Action Buttons on Toolbar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
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
              backgroundColor: BRAND_COLOR,
              color: "#ffffff",
              boxShadow: "0 1px 4px rgba(11, 110, 109, 0.25)",
              transition: "background-color 0.15s ease",
              "&:hover": {
                backgroundColor: BRAND_COLOR_DARK,
                boxShadow: "0 1px 4px rgba(11, 110, 109, 0.25)",
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
          p: { xs: 1.5, sm: 2.5 },
          backgroundColor: "background.secondary",
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
              maxWidth: "880px",
              minHeight: "980px",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              border: "1px solid #d8dfe5",
              p: { xs: 2, sm: 3 },
              borderRadius: "4px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Letterhead — Official Header Bar */}
            <Box
              className="letterhead-bleed"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mx: { xs: -2, sm: -3 },
                mt: { xs: -2, sm: -3 },
                px: { xs: 2, sm: 3 },
                backgroundColor: BRAND_COLOR,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <OguzLogo
                  sx={{
                    width: 150,
                    height: "auto",
                    mx: 0,
                    flexShrink: 0,
                    "& path": { fill: "#FFFFFF !important" },
                  }}
                />
              </Box>

              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                {docRef && (
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#ffffff" }}>
                    № {docRef}
                  </Typography>
                )}
                <Typography sx={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.78)", mt: 0.25 }}>
                  {t("visaDocument.dateLabel")}: {generatedOn}
                </Typography>
              </Box>
            </Box>
            {/* Letterhead double rule */}
            <Box className="letterhead-bleed" sx={{ mx: { xs: -2, sm: -3 }, height: "3px", backgroundColor: "#0E8584" }} />
            <Box className="letterhead-bleed" sx={{ mx: { xs: -2, sm: -3 }, height: "1px", backgroundColor: "#0E8584", opacity: 0.35, mb: 3.5 }} />

            {/* Body content (title + tables) — gets its own reduced padding in print */}
            <Box className="print-body-padding">
              {/* Main Document Title */}
              <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#0f172a",
                    fontSize: { xs: "1.3rem", sm: "1.6rem" },
                    letterSpacing: "0.2px",
                    lineHeight: 1.3,
                  }}
                >
                  {currentDoc?.title || t("visaDocument.title")}
                </Typography>
              </Box>

              {/* Tables */}
              {(currentDoc?.tables || []).map((table, tIdx) => (
                <Box key={table.id || tIdx} sx={{ mb: 4.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ flex: 1, height: "1px", backgroundColor: "divider" }} />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      letterSpacing: "0.5px",
                      color: "#0f172a",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {table.title || (tIdx === 0 ? "Gerekli resminamalar" : "Wizaň bahalary we möhletleri")}
                  </Typography>
                  <Box sx={{ flex: 1, height: "1px", backgroundColor: "divider" }} />
                </Box>

                {/* Table Grid */}
                <Box
                  sx={{
                    width: "100%",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    overflow: "hidden",
                    mb: 1.5,
                  }}
                >
                  <Box
                    component="table"
                    sx={{
                      width: "100%",
                      tableLayout: "fixed",
                      borderCollapse: "collapse",
                      "& td, & th": {
                        border: "1px solid #cbd5e1",
                        p: "10px 12px",
                        fontSize: "0.85rem",
                        color: "#0f172a",
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
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
                                  : cell.text || "";

                                const cellRowSpan = isOrderCol && isHeaderRow ? headerRowCount : cell.rowSpan || 1;
                                const cellColSpan = isOrderCol ? 1 : cell.colSpan || 1;

                                return (
                                  <td
                                    key={cell.id || `${rIdx}-${cIdx}`}
                                    colSpan={cellColSpan}
                                    rowSpan={cellRowSpan}
                                    style={{
                                      fontWeight: isHeaderRow ? 700 : isOrderCol ? 700 : 400,
                                      backgroundColor: isHeaderRow
                                        ? isOrderCol
                                          ? "#f8fafc"
                                          : "#f1f5f9"
                                        : isOrderCol
                                          ? "#fafafa"
                                          : "#ffffff",
                                      color: "#0f172a",
                                      textAlign: isOrderCol ? "center" : "left",
                                      width: isOrderCol ? "48px" : undefined,
                                      whiteSpace: "pre-wrap",
                                      verticalAlign: isHeaderRow ? "middle" : "top",
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
                  <Box
                    sx={{
                      pt: 1,
                      mt: 0.5,
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        letterSpacing: "0.2px",
                      }}
                    >
                      Bellik:
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.82rem",
                        color: "#475569",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {table.note}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;
