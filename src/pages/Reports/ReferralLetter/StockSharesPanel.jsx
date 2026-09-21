import { useMemo, useState } from "react";
import { Box, Typography, IconButton, Tooltip, Chip } from "@mui/material";
import { PenLine, Trash2 } from "lucide-react";
import { useLocale } from "../../../hooks/useLocale";
import { useDateFormat } from "../../../functions/generalHelpers";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useGet } from "../../../hooks/CRUD/useGet";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import TableEmptyState from "../../../components/TableEmptyState";
import AddButton from "../../../components/AddButton";
import StatusChip from "../../../components/StatusChip";
import DeleteDialog from "../../../components/DeleteDialog";
import { REFERRAL_REPORT_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import { getAllEmployeeApi, getLettersByDocumentRangeApi } from "../../../api/queries/getters";
import { deleteOtherLetterApi } from "../../../api/queries/delete";
import AddReferralReportModal from "./AddReferralReportModal";
import EditReferralReportModal from "./EditReferralReportModal";
import {
  STOCK_LETTERS_KEY,
  findFirstFreeRange,
  getLetterCount,
  getLetterRange,
  resolveLetterStatus,
} from "./functions/stockLetters";

const formatRange = ({ start, end }) => (start === end ? `${start}` : `${start} - ${end}`);

/** The letters of one stock batch: referral letters (read-only here) and other letters. */
const StockSharesPanel = ({ stock }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState(null);

  const stockStart = Number(stock?.start_yh_number);
  const stockEnd = Number(stock?.end_yh_number);
  const hasRange = Number.isFinite(stockStart) && Number.isFinite(stockEnd);
  const totalCount = Number(stock?.total_letter || 0);

  // Every row covers at least one number, so the batch size bounds the row count.
  const params = useMemo(
    () => ({
      start_number: stockStart,
      end_number: stockEnd,
      page: 1,
      limit: Math.max(10, totalCount || stockEnd - stockStart + 1),
    }),
    [stockStart, stockEnd, totalCount],
  );

  const { data: letters = [], isLoading, isError } = useGet({
    apiFn: getLettersByDocumentRangeApi,
    key: STOCK_LETTERS_KEY,
    params,
    options: { enabled: hasRange },
  });

  const { data: employees = [] } = useGet({ apiFn: getAllEmployeeApi, key: "employees" });
  const employeeNames = useMemo(
    () => new Map((Array.isArray(employees) ? employees : []).map((e) => [e.guid, e.fullName])),
    [employees],
  );

  const rows = useMemo(
    () =>
      (Array.isArray(letters) ? letters : [])
        .map((letter) => ({ letter, guid: letter.guid, ...getLetterRange(letter) }))
        .filter((row) => Number.isFinite(row.start))
        .sort((a, b) => a.start - b.start || a.end - b.end),
    [letters],
  );

  const usedCount = useMemo(
    () => rows.reduce((sum, row) => sum + getLetterCount(row.letter), 0),
    [rows],
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
            {formatRange(row.original)}
          </Box>
        ),
      },
      {
        id: "count",
        header: t("referralLetter.quantity"),
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => getLetterCount(row.original.letter),
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
        Cell: ({ row }) => employeeNames.get(row.original.letter.received_opr_guid) || "—",
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
          return text || "—";
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
          const { letter } = row.original;
          if (letter.isRefferal) return null;
          return (
            <Box sx={{ display: "inline-flex", gap: 0.5 }}>
              <Tooltip title={t("edit")} arrow>
                <IconButton size="small" onClick={() => setEditingLetter(letter)}>
                  <PenLine size={14} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("delete")} arrow>
                <IconButton size="small" onClick={() => deleteDialog.open(letter)}>
                  <Trash2 size={14} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [t, formatChange, employeeNames, deleteDialog],
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
    state: {
      isLoading,
      showAlertBanner: isError,
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
    renderEmptyRowsFallback: () => (
      <TableEmptyState
        title={t("referralLetter.noReports")}
        sx={{ minHeight: 0, py: 3 }}
      />
    ),
  });

  return (
    <Box sx={{ p: 2, backgroundColor: "action.hover" }}>
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
          {t("referralLetter.usedCount")}: {usedCount} / {totalCount}
          {"  "}
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
        </Typography>
        <AddButton
          size="small"
          onClick={() => setIsAddOpen(true)}
          disabled={remainingCount === 0 || !suggestedRange}
        >
          {t("referralLetter.addReport")}
        </AddButton>
      </Box>

      <MaterialReactTable table={table} />

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
