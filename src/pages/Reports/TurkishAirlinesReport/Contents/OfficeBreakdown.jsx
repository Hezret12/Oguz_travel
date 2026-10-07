import { memo, useMemo } from "react";
import { Box, Divider, Tooltip, Typography } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import BaseFareLabel from "../../../../components/BaseFareLabel";

// rank | office | bar | amount | share
const ROW_COLUMNS = "18px minmax(72px, 1fr) minmax(0, 2fr) minmax(64px, auto) 52px";

const numberSx = { fontVariantNumeric: "tabular-nums", textAlign: "right", fontSize: 13 };

const DetailLine = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3, fontSize: 12 }}>
    <span>{label}</span>
    <Box component="span" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
      {value}
    </Box>
  </Box>
);

/**
 * Offices ranked by the amount they sold, largest first. One colour for every bar: the bars
 * compare one measure, so the office is told apart by its name, not by a colour. An office's
 * share is its part of the total shown here, so the amount and the percentage always agree.
 * Offices with no sales in the month are named in one line under the list.
 */
const OfficeBreakdown = ({ items = [], formatNumber, color }) => {
  const { t } = useLocale();

  const { ranked, idleNames, total } = useMemo(() => {
    const withSales = items
      .filter((item) => item.totalQuoted > 0)
      .sort((a, b) => b.totalQuoted - a.totalQuoted);
    const sum = withSales.reduce((acc, item) => acc + item.totalQuoted, 0);
    const top = withSales[0]?.totalQuoted || 1;
    return {
      total: sum,
      ranked: withSales.map((item) => ({
        ...item,
        share: sum > 0 ? (item.totalQuoted / sum) * 100 : 0,
        // The longest bar belongs to the top office; the rest are measured against it.
        barWidth: (item.totalQuoted / top) * 100,
      })),
      idleNames: [...new Set(items.filter((item) => !(item.totalQuoted > 0)).map((item) => item.office))],
    };
  }, [items]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mt: 0.5 }}>
      {ranked.map((item, index) => (
        <Tooltip
          key={item.key || item.office}
          placement="top"
          arrow
          title={
            <Box sx={{ minWidth: 170, py: 0.25 }}>
              <Box sx={{ fontWeight: 700, fontSize: 12.5, mb: 0.5 }}>{item.office}</Box>
              <DetailLine label={t("report.turkishAirlines.quotedPrice")} value={formatNumber(item.totalQuoted)} />
              <DetailLine label={<BaseFareLabel />} value={formatNumber(item.totalBase)} />
              <DetailLine label={t("report.turkishAirlines.profit")} value={formatNumber(item.profit)} />
            </Box>
          }
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: ROW_COLUMNS,
              alignItems: "center",
              columnGap: 1.5,
              px: 1,
              py: 1.1,
              mx: -1,
              borderRadius: "8px",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled", fontVariantNumeric: "tabular-nums" }}>
              {index + 1}
            </Typography>

            <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
              {item.office}
            </Typography>

            <Box sx={{ height: 8, borderRadius: "4px", backgroundColor: "action.hover", overflow: "hidden" }}>
              <Box
                sx={{
                  width: `${item.barWidth}%`,
                  minWidth: 3,
                  height: "100%",
                  borderRadius: "0 4px 4px 0",
                  backgroundColor: color,
                  transition: "width 0.4s ease",
                }}
              />
            </Box>

            <Typography sx={{ ...numberSx, fontWeight: 700, color: "text.primary" }}>
              {formatNumber(item.totalQuoted)}
            </Typography>

            <Typography sx={{ ...numberSx, fontSize: 12.5, fontWeight: 500, color: "text.secondary" }}>
              {item.share.toFixed(1)}%
            </Typography>
          </Box>
        </Tooltip>
      ))}

      <Divider sx={{ my: 0.75 }} />

      <Box sx={{ display: "grid", gridTemplateColumns: ROW_COLUMNS, alignItems: "center", columnGap: 1.5, py: 0.75 }}>
        <span />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>
          {t("report.turkishAirlines.total")}
        </Typography>
        <span />
        <Typography sx={{ ...numberSx, fontWeight: 800, color: "text.primary" }}>
          {formatNumber(total)}
        </Typography>
        <Typography sx={{ ...numberSx, fontSize: 12.5, fontWeight: 500, color: "text.secondary" }}>
          100%
        </Typography>
      </Box>

      {idleNames.length > 0 && (
        <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
          {t("report.turkishAirlines.officesNoSales")}: {idleNames.join(", ")}
        </Typography>
      )}
    </Box>
  );
};

export default memo(OfficeBreakdown);
