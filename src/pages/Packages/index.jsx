import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import PageHeader from "../../components/PageHeader";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import Pagination from "../../components/Pagination";
import DocumentPreviewModal from "../Visa/Package/DocumentPreviewModal";
import { useLocale } from "../../hooks/useLocale";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { getAllVisaDocsApi } from "../../api/queries/getters";
import { useDateFormat } from "../../functions/generalHelpers";

const PackagesPage = () => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [previewDocument, setPreviewDocument] = useState(null);

  const {
    data: serverDocs = [],
    totalItems = 0,
    isLoading,
    isFetching,
    refetch,
  } = usePagginationGet({
    apiFn: getAllVisaDocsApi,
    key: "publicPackagesView",
    params: { page, limit, search: searchQuery },
  });

  const documents = useMemo(() => {
    if (!serverDocs || !Array.isArray(serverDocs)) return [];
    return serverDocs;
  }, [serverDocs]);

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
        title={t("sidebar.packages")}
        pageTitle={`${t("sidebar.packages")} | Oguz Travel`}
      />

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          mb: 2,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ flex: 1, maxWidth: { sm: 460, md: 520 } }}>
          <GlobalSearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
            onRefetch={refetch}
            isFetching={isFetching}
            placeholder={t("search", "Gözle...")}
            sx={{ width: "100%", "& .MuiTextField-root": { width: "100%" } }}
          />
        </Box>

        {totalItems > 0 && (
          <Chip
            size="small"
            label={`${totalItems} ${t("sidebar.packages", "Bukja")}`}
            sx={{
              alignSelf: { xs: "flex-start", sm: "center" },
              fontWeight: 600,
              fontSize: "0.78rem",
              height: 28,
              borderRadius: "8px",
              bgcolor: (th) =>
                th.palette.mode === "dark"
                  ? "rgba(20, 184, 166, 0.16)"
                  : "rgba(14, 133, 132, 0.08)",
              color: "primary.main",
            }}
          />
        )}
      </Paper>

      <Box sx={{ flexGrow: 1, overflowY: "auto", pb: 4, px: 0.5, pt: 1 }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "280px",
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "primary.main" }} />
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
              {t("common.loading", "Ýüklenýär...")}
            </Typography>
          </Box>
        ) : documents.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "280px",
              textAlign: "center",
              borderRadius: "16px",
              border: "1px dashed",
              borderColor: "divider",
              backgroundColor: "background.paper",
              p: 4,
              gap: 2,
            }}
          >
            <DescriptionOutlinedIcon
              sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }}
            />
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
              {searchQuery
                ? t("common.noSearchResults", "Gözlegiňize gabat gelýän bukja tapylmady.")
                : t("common.noData", "Heniz hiç hili bukja ýok.")}
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {documents.map((doc) => {
              const docKey = doc.guid || doc.id;
              const tableCount =
                doc.tableCount !== undefined
                  ? doc.tableCount
                  : (doc.tables?.length || doc.docDetails?.length || 0);
              const hasNote =
                doc.hasNote !== undefined
                  ? doc.hasNote
                  : Boolean(
                    doc.generalNote?.trim() ||
                    doc.tables?.some((t) => t.note?.trim()) ||
                    doc.docDetails?.some((d) => d.note?.trim()),
                  );

              return (
                <Paper
                  key={docKey}
                  elevation={0}
                  onClick={() => setPreviewDocument(doc)}
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
                    minHeight: "180px",
                    position: "relative",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-3px)",
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? "0 10px 30px rgba(0, 0, 0, 0.5)"
                          : "0 10px 25px rgba(0, 0, 0, 0.07)",
                      "& .doc-icon-badge": {
                        transform: "scale(1.06)",
                      },
                      "& .view-action-btn": {
                        backgroundColor: "primary.main",
                        color: "#ffffff",
                      },
                    },
                  }}
                >
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
                        width: 42,
                        height: 42,
                        borderRadius: "10px",
                        background: (theme) =>
                          theme.palette.mode === "dark"
                            ? "linear-gradient(135deg, rgba(24, 90, 189, 0.26) 0%, rgba(13, 71, 161, 0.16) 100%)"
                            : "linear-gradient(135deg, rgba(24, 90, 189, 0.12) 0%, rgba(27, 102, 201, 0.06) 100%)",
                        border: "1px solid",
                        borderColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(59, 130, 246, 0.28)"
                            : "rgba(24, 90, 189, 0.18)",
                        color: (theme) =>
                          theme.palette.mode === "dark" ? "#60a5fa" : "#185abd",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <ArticleRoundedIcon sx={{ fontSize: 23 }} />
                    </Box>

                    {doc.country && (
                      <Chip
                        icon={<PublicOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                        label={doc.country}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          borderRadius: "6px",
                          backgroundColor: (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.08)"
                              : "rgba(0, 0, 0, 0.05)",
                          color: "text.primary",
                        }}
                      />
                    )}
                  </Box>

                  {/* Document Title & Meta Description */}
                  <Box sx={{ mb: 2.5, flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.02rem",
                        lineHeight: 1.35,
                        color: "text.primary",
                        mb: 0.75,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {doc.title || t("visaDocument.title", "Wiza bukjasy")}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                      <Chip
                        icon={<TableChartOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                        label={`${tableCount} ${t("visaDocument.tables", "tablisa")}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.72rem",
                          height: 24,
                          borderRadius: "6px",
                          borderColor: "divider",
                          color: "text.secondary",
                        }}
                      />

                      {hasNote && (
                        <Tooltip title={doc.generalNote || t("visaDocument.generalNote")}>
                          <Chip
                            icon={<StickyNote2OutlinedIcon sx={{ fontSize: "14px !important" }} />}
                            label={t("visaDocument.note", "Bellik")}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: "0.72rem",
                              height: 24,
                              borderRadius: "6px",
                              borderColor: "divider",
                              color: "text.secondary",
                            }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      pt: 1.5,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                      }}
                    >
                      {doc.updatedAt || doc.createdAt
                        ? formatChange(doc.updatedAt || doc.createdAt, { dateOnly: true })
                        : ""}
                    </Typography>

                    <Button
                      className="view-action-btn"
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewDocument(doc);
                      }}
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        py: 0.4,
                        px: 1.25,
                        borderColor: "divider",
                        color: "text.primary",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {t("visaDocument.preview", "Görmek")}
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      <Pagination
        totalItems={totalItems || serverDocs.length}
        page={page}
        limit={limit}
        setPage={setPage}
        setPageSize={setLimit}
      />

      <DocumentPreviewModal
        open={Boolean(previewDocument)}
        onClose={() => setPreviewDocument(null)}
        document={previewDocument}
      />
    </Box>
  );
};

export default PackagesPage;
