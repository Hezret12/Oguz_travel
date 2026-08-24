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
  CircularProgress,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PageHeader from "../../../components/PageHeader";
import GlobalSearchInput from "../../../components/GlobalSearchInput";
import Pagination from "../../../components/Pagination";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { useLocale } from "../../../hooks/useLocale";

const DocumentList = ({
  documents = [],
  isLoading = false,
  isFetching = false,
  onRefetch,
  searchQuery = "",
  setSearchQuery,
  page = 1,
  limit = 40,
  setPage,
  setPageSize,
  totalItems = 0,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
}) => {
  const { t } = useLocale();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);

  const filteredDocuments = useMemo(() => {
    if (!documents || !Array.isArray(documents)) return [];
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
      onDeleteDocument(deleteTarget.guid || deleteTarget.id, deleteTarget.guid);
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
      <PageHeader
        title={t("sidebar.visa.package")}
        pageTitle={`${t("sidebar.visa.package")} | Oguz Travel`}
        addButtonText="Täze dokument"
        onAddClick={onCreateDocument}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onRefetch={onRefetch}
          isFetching={isFetching}
          placeholder={t("search")}
          sx={{ minWidth: { xs: 160, sm: 260 } }}
        />
      </PageHeader>

      <Box sx={{ flexGrow: 1, overflowY: "auto", pb: 4, px: 0.5, pt: 1 }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "260px",
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "#0c8a7b" }} />
          </Box>
        ) : filteredDocuments.length === 0 ? (
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
              const docKey = doc.guid || doc.id;
              const tableCount = doc.tableCount !== undefined ? doc.tableCount : (doc.tables?.length || 0);
              const hasNote =
                doc.hasNote !== undefined
                  ? doc.hasNote
                  : Boolean(doc.generalNote?.trim() || doc.tables?.some((t) => t.note?.trim()));

              return (
                <Paper
                  key={docKey}
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
                            ? "rgba(24, 90, 189, 0.18)"
                            : "rgba(24, 90, 189, 0.10)",
                        color: "#185abd",
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

      {/* Pagination if multiple pages */}
      {totalItems > limit && setPage && (
        <Box sx={{ mt: 2 }}>
          <Pagination
            totalItems={totalItems}
            page={page}
            limit={limit}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </Box>
      )}

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
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: "error.lighter",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "error.main",
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Dokumenti pozmak
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Bu amaly yzyna gaýtaryp bolmaýar
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Hakykatdan hem <strong>"{deleteTarget?.title}"</strong> atly wiza dokumentini pozmak isleýärsiňizmi?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              borderColor: "divider",
            }}
          >
            Ýatyr
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Poz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentList;
