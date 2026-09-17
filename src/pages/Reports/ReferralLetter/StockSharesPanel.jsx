import { useMemo, useState } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { PenLine, Trash2 } from "lucide-react";
import { useLocale } from "../../../hooks/useLocale";
import { useDateFormat } from "../../../functions/generalHelpers";
import { useDeleteDialog } from "../../../hooks/useDeleteDialog";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { useGet } from "../../../hooks/CRUD/useGet";
import AddButton from "../../../components/AddButton";
import StatusChip from "../../../components/StatusChip";
import DeleteDialog from "../../../components/DeleteDialog";
import { REFERRAL_REPORT_STATUS_CONFIG } from "../../../functions/statusChipConfigs";
import { getAllReportSharesApi } from "../../../api/queries/getters";
import { deleteReportShareApi } from "../../../api/queries/delete";
import AddReferralReportModal from "./AddReferralReportModal";
import EditReferralReportModal from "./EditReferralReportModal";

const resolveStatusKey = (val) => {
  if (val === 1 || val === "1") return "SATYLDY";
  if (val === 2 || val === "2") return "ZYÝAN ÝETEN";
  if (val === 3 || val === "3") return "ÝITIRILEN";
  return val;
};

// First free gap in the batch range (`shares` must be sorted by start), so
// gaps left by deleted shares get reused. `start` pre-fills the single-letter
// tab of the add modal, `start`..`end` pre-fills its range tab.
const findFirstFreeRange = (stock, shares) => {
  const start = Number(stock?.start_yh_number);
  const end = Number(stock?.end_yh_number);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  let candidate = start;
  for (const s of shares) {
    const sStart = Number(s.start_yh_number);
    if (sStart > candidate) return { start: candidate, end: sStart - 1 };
    candidate = Math.max(candidate, Number(s.end_yh_number) + 1);
  }
  return candidate <= end ? { start: candidate, end } : null;
};

// A stock batch (e.g. letters 1-100) and its report-shares (individual sales/
// usages carved out of that range) aren't linked by a foreign key in this
// API — the relationship is purely the share's number range falling inside
// the batch's range, so grouping has to happen client-side.
const StockSharesPanel = ({ stock }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingShare, setEditingShare] = useState(null);

  const { data: allShares = [], isLoading } = useGet({
    apiFn: getAllReportSharesApi,
    key: "reportShares",
    params: { limit: 9999, page: 1 },
  });

  const shares = useMemo(() => {
    const start = Number(stock?.start_yh_number);
    const end = Number(stock?.end_yh_number);
    return (allShares || [])
      .filter((s) => {
        const sStart = Number(s.start_yh_number);
        const sEnd = Number(s.end_yh_number);
        return sStart >= start && sEnd <= end;
      })
      .sort((a, b) => Number(a.start_yh_number) - Number(b.start_yh_number));
  }, [allShares, stock]);

  const usedCount = useMemo(
    () => shares.reduce((sum, s) => sum + Number(s.total_count || 0), 0),
    [shares],
  );
  const totalCount = Number(stock?.total_letter || 0);
  const remainingCount = Math.max(0, totalCount - usedCount);

  const suggestedRange = useMemo(
    () => findFirstFreeRange(stock, shares),
    [shares, stock],
  );

  const { mutate: deleteShare, isPending: isDeleting } = useDelete({
    deleteFn: deleteReportShareApi,
    queryKey: "reportShares",
    idKey: "guid",
  });

  const deleteDialog = useDeleteDialog({
    onConfirm: (item) => deleteShare(item.guid || item.id),
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
          disabled={remainingCount === 0}
        >
          {t("referralLetter.addReport")}
        </AddButton>
      </Box>

      {isLoading ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          {t("loading")}
        </Typography>
      ) : shares.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
          {t("referralLetter.noReports")}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {shares.map((s) => (
            <Box
              key={s.guid || s.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                py: 1,
                px: 1.5,
                borderRadius: "8px",
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {s.start_yh_number} - {s.end_yh_number}
                  </Typography>
                  <StatusChip
                    status={resolveStatusKey(s.status)}
                    config={REFERRAL_REPORT_STATUS_CONFIG}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatChange(s.datetime, { dateOnly: true })}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {s.reportAS_operator?.fullName || ""}
                  {s.received_by ? ` → ${s.received_by}` : ""}
                  {s.note ? ` • ${s.note}` : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                <Tooltip title={t("edit")} arrow>
                  <IconButton size="small" onClick={() => setEditingShare(s)}>
                    <PenLine size={14} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("delete")} arrow>
                  <IconButton size="small" onClick={() => deleteDialog.open(s)}>
                    <Trash2 size={14} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {isAddOpen && (
        <AddReferralReportModal
          open={isAddOpen}
          close={() => setIsAddOpen(false)}
          stock={stock}
          shares={shares}
          defaultRange={suggestedRange}
        />
      )}

      {editingShare && (
        <EditReferralReportModal
          open={Boolean(editingShare)}
          close={() => setEditingShare(null)}
          row={{ original: editingShare }}
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
