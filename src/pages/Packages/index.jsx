import { useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { getDefaultMRTOptions } from "../../hooks/getDefaultMRTOptions";
import PageHeader from "../../components/PageHeader";
import GlobalSearchInput from "../../components/GlobalSearchInput";
import Pagination from "../../components/Pagination";
import TableEmptyState from "../../components/TableEmptyState";
import DocumentPreviewModal from "../Visa/Package/DocumentPreviewModal";
import { useLocale } from "../../hooks/useLocale";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { getAllVisaDocsApi } from "../../api/queries/getters";
import { useDateFormat } from "../../functions/generalHelpers";

const PackagesPage = () => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [previewDocument, setPreviewDocument] = useState(null);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: searchQuery.trim() || undefined,
    }),
    [page, limit, searchQuery]
  );

  const {
    data: serverDocs = [],
    totalItems = 0,
    pageCount = 1,
    isLoading,
    isFetching,
    refetch,
  } = usePagginationGet({
    apiFn: getAllVisaDocsApi,
    key: "publicPackagesView",
    params: queryParams,
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "#",
        size: 60,
        enableSorting: false,
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              textAlign: "center",
            }}
          >
            {(page - 1) * limit + row.index + 1}
          </Typography>
        ),
      },
      {
        accessorKey: "title",
        header: t("visaDocument.docTitle"),
        size: 280,
        Cell: ({ row }) => {
          const title = row.original.title || t("visaDocument.title");
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: "10px",
                  backgroundColor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <ArticleRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: "country",
        header: t("visaDocument.country"),
        size: 160,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          if (!val) {
            return (
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                —
              </Typography>
            );
          }
          return (
            <Chip
              icon={<PublicOutlinedIcon sx={{ fontSize: "14px !important" }} />}
              label={val}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                borderRadius: "6px",
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                color: "text.primary",
              }}
            />
          );
        },
      },
      {
        id: "tableCount",
        header: t("visaDocument.tables"),
        size: 140,
        Cell: ({ row }) => {
          const doc = row.original;
          const count =
            doc.tableCount !== undefined
              ? doc.tableCount
              : doc.tables?.length || doc.docDetails?.length || 0;
          return (
            <Chip
              icon={<TableChartOutlinedIcon sx={{ fontSize: "14px !important" }} />}
              label={`${count} ${t("visaDocument.tables")}`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.75rem",
                height: 26,
                borderRadius: "6px",
                borderColor: "divider",
                color: "text.secondary",
                fontWeight: 500,
              }}
            />
          );
        },
      },
      {
        accessorKey: "generalNote",
        header: t("visaDocument.generalNote"),
        size: 260,
        Cell: ({ row }) => {
          const doc = row.original;
          const note =
            doc.generalNote?.trim() ||
            doc.tables?.find((tb) => tb.note?.trim())?.note ||
            doc.docDetails?.find((d) => d.note?.trim())?.note ||
            "";
          if (!note) {
            return (
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                —
              </Typography>
            );
          }
          return (
            <Tooltip title={note} arrow placement="top-start">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, maxWidth: 260 }}>
                <StickyNote2OutlinedIcon
                  sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.825rem",
                  }}
                >
                  {note}
                </Typography>
              </Box>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: t("columns.updatedAt"),
        size: 150,
        Cell: ({ row }) => {
          const dateVal = row.original.updatedAt || row.original.createdAt;
          if (!dateVal) {
            return (
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                —
              </Typography>
            );
          }
          return (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontVariantNumeric: "tabular-nums",
                fontSize: "0.825rem",
              }}
            >
              {formatChange(dateVal, { dateOnly: true })}
            </Typography>
          );
        },
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 110,
        enableSorting: false,
        Cell: ({ row }) => (
          <Tooltip title={t("visaDocument.preview")} arrow>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={(e) => {
                e.stopPropagation();
                setPreviewDocument(row.original);
              }}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "0.78rem",
                fontWeight: 600,
                py: 0.35,
                px: 1.2,
                borderColor: "divider",
                color: "text.primary",
                backgroundColor: "background.paper",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                  color: "primary.main",
                },
              }}
            >
              {t("visaDocument.preview")}
            </Button>
          </Tooltip>
        ),
      },
    ],
    [t, formatChange, page, limit]
  );

  const paginationState = useMemo(
    () => ({ pageIndex: page - 1, pageSize: limit }),
    [page, limit]
  );

  const mrtState = useMemo(
    () => ({
      isLoading: false,
      showLoadingOverlay: isLoading || isFetching,
      showSkeletons: false,
      showProgressBars: false,
      pagination: paginationState,
    }),
    [isLoading, isFetching, paginationState]
  );

  const muiTableBodyProps = useMemo(
    () => ({
      sx: (theme) => ({
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        opacity: isLoading || isFetching ? 0 : 1,
        pointerEvents: isLoading || isFetching ? "none" : "auto",
        transition: "opacity 0.15s ease",
      }),
    }),
    [isLoading, isFetching]
  );

  const renderEmptyRowsFallback = useCallback(() => {
    if (isLoading || isFetching) return null;
    return <TableEmptyState />;
  }, [isLoading, isFetching]);

  const renderTopToolbarCustomActions = useCallback(
    () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          width: "100%",
          py: 0.5,
        }}
      >
        <GlobalSearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setPage(1);
          }}
          placeholder={t("search")}
          disabled={isLoading}
          onRefetch={refetch}
          isFetching={isFetching}
          sx={{ minWidth: { xs: "100%", sm: 300, md: 360 } }}
        />

        {totalItems > 0 && (
          <Chip
            size="small"
            label={`${totalItems} ${t("sidebar.packages")}`}
            sx={{
              fontWeight: 600,
              fontSize: "0.78rem",
              height: 30,
              borderRadius: "8px",
              backgroundColor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              color: "primary.main",
            }}
          />
        )}
      </Box>
    ),
    [searchQuery, isLoading, isFetching, refetch, totalItems, t]
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: serverDocs,
    state: mrtState,
    muiTableBodyProps,
    renderEmptyRowsFallback,
    renderTopToolbarCustomActions,
    renderBottomToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          width: "100%",
          px: 2,
          py: 1,
        }}
      >
        <Pagination
          pageIndex={page - 1}
          pageCount={pageCount}
          pageSize={limit}
          totalRows={totalItems}
          onPageChange={(newIndex) => setPage(newIndex + 1)}
        />
      </Box>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => setPreviewDocument(row.original),
      sx: (theme) => ({
        cursor: "pointer",
        backgroundColor: theme.palette.background.paper,
        transition: "background-color 0.15s ease",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      }),
    }),
  });

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

      <MaterialReactTable table={table} />

      <DocumentPreviewModal
        open={Boolean(previewDocument)}
        onClose={() => setPreviewDocument(null)}
        document={previewDocument}
      />
    </Box>
  );
};

export default PackagesPage;
