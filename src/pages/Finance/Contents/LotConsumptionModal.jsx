import { useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getLotConsumptionHistoryApi } from "../../../api/queries/getters";
import { useDateFormat } from "../../../functions/generalHelpers";
import TableEmptyState from "../../../components/TableEmptyState";

const LotConsumptionModal = ({ open, onClose, lot }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();

  const lotGuid = lot?.guid;

  const { data: consumptionsData, isLoading } = useGet({
    apiFn: () => getLotConsumptionHistoryApi(lotGuid),
    key: ["lot-consumptions", lotGuid],
    options: {
      enabled: Boolean(open && lotGuid),
    },
  });

  const consumptions = useMemo(
    () => (Array.isArray(consumptionsData?.data) ? consumptionsData.data : consumptionsData) || [],
    [consumptionsData]
  );

  const totalConsumedUnits = consumptions.reduce((acc, c) => acc + Number(c.quantity || 0), 0);
  const totalCostConsumed = consumptions.reduce((acc, c) => acc + Number(c.total_realized_cost || 0), 0);
  const totalRevenue = consumptions.reduce((acc, c) => acc + Number(c.realized_revenue || 0), 0);

  return (
    <CustomDialog open={Boolean(open)} close={onClose} widthX={800}>
      <CustomDialogHeader
        variant="h6"
        title={`${t("finance.consumptionHistoryTitle")}: ${lot?.lot_number || ""}`}
        onClose={onClose}
      />
      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Lot summary card */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "action.hover",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {t("finance.lotBatchName")}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {lot?.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {t("finance.unitCost")}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {lot?.unit_cost} {lot?.currency}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {t("finance.consumptionProgress")}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "success.main" }}>
              {lot?.consumed_quantity} / {lot?.total_quantity} {t("finance.used")} ({lot?.remaining_quantity} {t("finance.left")})
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Consumptions table */}
        {consumptions.length === 0 && !isLoading ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("finance.noConsumptions")}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("client", "Müşderi / Ýazgy")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("type", "Görnüşi")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("quantity", "Sany")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("finance.realizedCost")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("finance.realizedRevenue")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("date", "Senesi")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consumptions.map((item, idx) => (
                  <TableRow key={item.guid || idx} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {item.client_name || item.reference_guid || "—"}
                      </Typography>
                      {item.notes && (
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {item.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.reference_type}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "11px", fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{item.quantity}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "warning.main" }}>
                      {item.total_realized_cost} {lot?.currency || "$"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "success.main" }}>
                      {item.realized_revenue ? `${item.realized_revenue} ${lot?.currency || "$"}` : "—"}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "12px" }}>
                      {formatChange(item.consumed_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Realization totals */}
        {consumptions.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 3,
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
              {t("total", "Jemi ulanylan")}: <strong>{totalConsumedUnits}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "warning.main" }}>
              COGS: <strong>{totalCostConsumed.toFixed(2)} {lot?.currency}</strong>
            </Typography>
            {totalRevenue > 0 && (
              <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                {t("finance.grossMargin")}: <strong>{(totalRevenue - totalCostConsumed).toFixed(2)} {lot?.currency}</strong>
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </CustomDialog>
  );
};

export default LotConsumptionModal;
