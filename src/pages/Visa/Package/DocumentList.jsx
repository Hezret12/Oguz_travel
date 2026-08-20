import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PageHeader from "../../../components/PageHeader";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { useLocale } from "../../../hooks/useLocale";

const DocumentList = ({ documents, onSelectDocument, onCreateDocument, onDeleteDocument }) => {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.title?.toLowerCase().includes(query) ||
        doc.country?.toLowerCase().includes(query) ||
        doc.generalNote?.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const confirmDelete = () => {
    if (deleteTarget) {
      onDeleteDocument(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Top Header with Search and Add Button on the same single line */}
      <PageHeader
        title={t("sidebar.visa.package") || "Wiza Bukjalary"}
        pageTitle={`${t("sidebar.visa.package") || "Wiza Bukjalary"} | Oguz Travel`}
        addButtonText="Täze dokument"
        onAddClick={onCreateDocument}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("search") || "Gözleg..."}
          sx={{ minWidth: { xs: 160, sm: 260 } }}
        />
      </PageHeader>

      {/* Cards Grid */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", pb: 4, px: 0.5 }}>
        {filteredDocuments.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "260px",
              textAlign: "center",
              borderRadius: "16px",
              border: "1px dashed",
              borderColor: "divider",
              backgroundColor: "background.paper",
              p: 4,
              gap: 2,
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 44, color: "text.secondary", opacity: 0.6 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
              {searchQuery ? "Gözlegiňize gabat gelýän dokument tapylmady." : "Heniz hiç hili dokument ýok."}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={onCreateDocument}
              startIcon={<AddRoundedIcon />}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
            >
              Täze döret
            </Button>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {filteredDocuments.map((doc) => {
              const tableCount = doc.tables?.length || 0;
              const hasNote = Boolean(
                doc.generalNote?.trim() || doc.tables?.some((t) => t.note?.trim())
              );

              return (
                <Paper
                  key={doc.id}
                  elevation={0}
                  onClick={() => onSelectDocument(doc)}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    p: 2.5,
                    cursor: "pointer",
                    transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "150px",
                    position: "relative",
                    "&:hover": {
                      borderColor: "#0c8a7b",
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
                      "& .doc-icon-badge": {
                        transform: "scale(1.05)",
                      },
                    },
                  }}
                >
                  {/* Top Bar: Icon + Action Buttons (Eye + Trash) */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      className="doc-icon-badge"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 38,
                        height: 38,
                        borderRadius: "10px",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(12, 138, 123, 0.15)"
                            : "rgba(14, 133, 132, 0.10)",
                        color: "#0c8a7b",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
                    </Box>

                    {/* Quick Card Action Buttons */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Tooltip title="Word görnüşinde görmek (Önizleme)" placement="top">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTarget(doc);
                          }}
                          sx={{
                            color: "text.secondary",
                            opacity: 0.7,
                            p: 0.6,
                            borderRadius: "8px",
                            "&:hover": {
                              color: "primary.main",
                              opacity: 1,
                              backgroundColor: "rgba(12, 138, 123, 0.08)",
                            },
                          }}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 19 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Pozmak" placement="top">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(doc);
                          }}
                          sx={{
                            color: "text.secondary",
                            opacity: 0.7,
                            p: 0.6,
                            borderRadius: "8px",
                            "&:hover": {
                              color: "error.main",
                              opacity: 1,
                              backgroundColor: "rgba(239, 68, 68, 0.08)",
                            },
                          }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 19 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Title & Details */}
                  <Box sx={{ flexGrow: 1, mb: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "text.primary",
                        lineHeight: 1.35,
                        mb: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {doc.title || "Täze wiza dokumenti"}
                    </Typography>

                    {doc.country && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          fontSize: "0.8rem",
                          display: "block",
                        }}
                      >
                        {doc.country}
                      </Typography>
                    )}
                  </Box>

                  {/* Footer Meta: Table Count and Notes indicator */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      pt: 1,
                      borderTop: "1px solid",
                      borderColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.04)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.78rem",
                        fontWeight: 500,
                      }}
                    >
                      {tableCount === 0
                        ? "0 tablisa"
                        : `${tableCount} tablisa${hasNote ? " • bellik bar" : ""}`}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Word / A4 Document Full Preview Modal */}
      <DocumentPreviewModal
        open={Boolean(previewTarget)}
        onClose={() => setPreviewTarget(null)}
        document={previewTarget}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              p: 1.5,
              maxWidth: "420px",
            },
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <WarningAmberRoundedIcon sx={{ color: "error.main", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Dokumenti pozmak
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>"{deleteTarget?.title}"</strong> atly dokumenti pozmak isleýärsiňizmi? Bu amaly yza gaýtaryp bolmaýar.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            sx={{ borderRadius: "8px", textTransform: "none", color: "text.secondary" }}
          >
            Ýatyrmak
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
          >
            Pozmak
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentList;
