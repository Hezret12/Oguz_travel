import { useMemo, useState } from "react";
import { Alert, Box, Button, Typography, Tooltip, Chip } from "@mui/material";
import { RotateCw, TriangleAlert } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import { useDateFormat } from "../../../../functions/generalHelpers";
import { useDeleteDialog } from "../../../../hooks/useDeleteDialog";
import { useDelete } from "../../../../hooks/CRUD/useDelete";
import { useGet } from "../../../../hooks/CRUD/useGet";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { getDefaultMRTOptions } from "../../../../hooks/getDefaultMRTOptions";
import TableEmptyState from "../../../../components/TableEmptyState";
import AddButton from "../../../../components/AddButton";
import StatusChip from "../../../../components/StatusChip";
import DeleteDialog from "../../../../components/DeleteDialog";
import ColumnActionButtons from "../../../../components/ColumnActionButtons";
import { REFERRAL_REPORT_STATUS_CONFIG } from "../../../../functions/statusChipConfigs";
import { getLettersByDocumentRangeApi } from "../../../../api/queries/getters";
import { deleteOtherLetterApi } from "../../../../api/queries/delete";
import AddReferralReportModal from "./AddReferralReportModal";
import EditReferralReportModal from "./EditReferralReportModal";
import {
  STOCK_LETTERS_KEY,
  findFirstFreeRange,
  formatYhNumber,
  formatYhRange,
  getCountInStock,
  getLetterCount,
  getLetterRange,
  getStockLettersParams,
  getStockRange,
  isOutsideStock,
  resolveLetterStatus,
} from "../functions/stockLetters";

/** The letters of one stock batch: referral letters (read-only here) and other letters. */
const StockSharesPanel = ({ stock }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState(null);

  const stockRange = useMemo(() => getStockRange(stock), [stock]);
  const hasRange = Boolean(stockRange);
  const totalCount = Number(stock?.total_letter || 0);
  const params = useMemo(() => getStockLettersParams(stock) ?? {}, [stock]);

  const {
    data: letters = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGet({
    apiFn: getLettersByDocumentRangeApi,
    key: STOCK_LETTERS_KEY,
    params,
    // Re-expanding a batch reuses the cached list; mutations invalidate it anyway.
    options: { enabled: hasRange, staleTime: 30_000 },
  });
  // Counts and the suggested free range are derived from `letters`; until they are loaded
  // an empty list would make the whole batch look free.
  const isLettersReady = hasRange && !isLoading && !isError;

  const rows = useMemo(
    () =>
      (Array.isArray(letters) ? letters : [])
        .map((letter) => ({ letter, guid: letter.guid, ...getLetterRange(letter) }))
        .filter((row) => Number.isFinite(row.start) && Number.isFinite(row.end))
        .sort((a, b) => a.start - b.start || a.end - b.end),
    [letters],
  );

  // Only numbers inside the batch count: a letter overhanging it (e.g. 202-300 in a 201-210
  // batch, after the batch was shrunk) must not push "used" past the batch size.
  const usedCount = useMemo(
    () => rows.reduce((sum, row) => sum + getCountInStock(row, stockRange), 0),
    [rows, stockRange],
  );
  const remainingCount = Math.max(0, totalCount - usedCount);

  const suggestedRange = useMemo(() => findFirstFreeRange(stock, rows), [rows, stock]);

  const { mutate: deleteLetter, isPending: isDeleting } = useDelete({
    deleteFn: deleteOtherLetterApi,
    queryKey: STOCK_LETTERS_KEY,
    idKey: "guid",
    isPaginated: true,
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (letter) => deleteLetter(letter.guid),
  });
  // Only `open` is used below; depending on the whole dialog object would rebuild the
  // columns every time it opens or closes.
  const openDeleteDialog = deleteDialog.open;

  const columns = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        size: 50,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => row.index + 1,
      },
      {
        id: "range",
        header: t("referralLetter.letterNo"),
        size: 140,
        Cell: ({ row }) => (
          <Box component="span" sx={{ fontWeight: 650, fontVariantNumeric: "tabular-nums" }}>
            {formatYhRange(row.original)}
          </Box>
        ),
      },
      {
        id: "count",
        header: t("referralLetter.quantity"),
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const count = getLetterCount(row.original.letter);
          if (!isOutsideStock(row.original, stockRange)) return count;
          return (
            <Tooltip
              arrow
              title={t("referralLetter.outsideStock", {
                count: getCountInStock(row.original, stockRange),
                start: formatYhNumber(stockRange.start),
                end: formatYhNumber(stockRange.end),
              })}
            >
              <Box
                component="span"
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "warning.main" }}
              >
                {count}
                <TriangleAlert size={14} />
              </Box>
            </Tooltip>
          );
        },
      },
      {
        id: "status",
        header: t("columns.status"),
        size: 150,
        Cell: ({ row }) =>
          row.original.letter.isRefferal ? (
            <Chip
              label={t("sidebar.referalLetters")}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.72rem", borderRadius: "6px" }}
            />
          ) : (
            <StatusChip
              status={resolveLetterStatus(row.original.letter.status)}
              config={REFERRAL_REPORT_STATUS_CONFIG}
            />
          ),
      },
      {
        id: "date",
        header: t("columns.date"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const { letter } = row.original;
          return formatChange(letter.isRefferal ? letter.createdAt : letter.date_time, {
            dateOnly: true,
          });
        },
      },
      {
        id: "submittedBy",
        header: t("referralLetter.submittedBy"),
        size: 170,
        Cell: ({ row }) => row.original.letter.refferaloperator?.fullName || "—",
      },
      {
        id: "receivedBy",
        header: t("referralLetter.receivedBy"),
        size: 150,
        Cell: ({ row }) => row.original.letter.accepted_by || "—",
      },
      {
        id: "note",
        header: t("columns.note"),
        size: 220,
        // Referral letters have no note of their own here; their destination and departure
        // day identify them instead.
        Cell: ({ row }) => {
          const { letter } = row.original;
          const text = letter.isRefferal
            ? [letter.destination_country, formatChange(letter.departure_date, { dateOnly: true })]
                .filter(Boolean)
                .join(" • ")
            : letter.note;
          return text || "";
        },
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 90,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        // Referral letters are edited on the referral letter page, not here.
        Cell: ({ row }) => {
          if (row.original.letter.isRefferal) return null;
          return (
            <ColumnActionButtons
              row={row}
              onEdit={({ letter }) => setEditingLetter(letter)}
              onDelete={({ letter }) => openDeleteDialog(letter)}
            />
          );
        },
      },
    ],
    [t, formatChange, stockRange, openDeleteDialog],
  );

  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: rows,
    getRowId: (row) => row.guid,
    enablePagination: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableSorting: false,
    enableCreatingRow: false,
    enableClickToRowSelect: false,
    // No `isLoading`: MRT would draw a page-size worth of skeleton rows, so the panel would open
    // tall and then shrink to the real row count. A progress bar plus a short placeholder
    // keeps the height stable.
    state: {
      showProgressBars: isFetching,
    },
    // Nested inside the stock row: sized by its rows (scrolling past ~8) instead of the
    // page tables' fixed viewport height.
    muiTablePaperProps: {
      sx: (theme) => ({
        ...defaultMrtOptions.muiTablePaperProps.sx(theme),
        height: "auto",
      }),
    },
    muiTableContainerProps: {
      sx: (theme) => ({
        ...defaultMrtOptions.muiTableContainerProps.sx(theme),
        maxHeight: 360,
      }),
    },
    // One quiet line, not the page-sized placeholder: this table sits inside a stock row.
    renderEmptyRowsFallback: () =>
      isLoading ? (
        <Box sx={{ height: 48 }} />
      ) : (
        <TableEmptyState dense title={t("referralLetter.noReports")} />
      ),
  });

  return (
    // Set apart from the parent rows: tinted background and an accent bar on the left.
    <Box
      sx={{
        px: 2,
        py: 1.5,
        backgroundColor: "action.hover",
        borderLeft: "3px solid",
        borderLeftColor: "primary.main",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {t("referralLetter.usedCount")}: {isLettersReady ? usedCount : "—"} / {totalCount}
          {"  "}
          {isLettersReady && (
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: remainingCount > 0 ? "success.main" : "text.secondary",
                fontWeight: 700,
              }}
            >
              ({t("referralLetter.remainingCount")}: {remainingCount})
            </Typography>
          )}
        </Typography>
        <AddButton
          size="small"
          onClick={() => setIsAddOpen(true)}
          disabled={!isLettersReady || remainingCount === 0 || !suggestedRange}
        >
          {t("referralLetter.addReport")}
        </AddButton>
      </Box>

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => refetch()}
              disabled={isFetching}
              startIcon={<RotateCw size={14} />}
            >
              {t("errorBoundary.retry")}
            </Button>
          }
        >
          {t("errorOccurred")}
        </Alert>
      ) : (
        <MaterialReactTable table={table} />
      )}

      {isAddOpen && (
        <AddReferralReportModal
          open={isAddOpen}
          close={() => setIsAddOpen(false)}
          stock={stock}
          occupied={rows}
          defaultRange={suggestedRange}
        />
      )}

      {editingLetter && (
        <EditReferralReportModal
          open={Boolean(editingLetter)}
          close={() => setEditingLetter(null)}
          stock={stock}
          occupied={rows}
          row={{ original: editingLetter }}
        />
      )}

      <DeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={deleteDialog.confirm}
        isLoading={isDeleting}
        description={t("referralLetter.deleteReportConfirm")}
      />
    </Box>
  );
};

export default StockSharesPanel;
