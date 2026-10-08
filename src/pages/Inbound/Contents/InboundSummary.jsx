import { memo, useMemo } from "react";
import { Box, Tooltip, Typography, alpha } from "@mui/material";
import { useLocale } from "../../../hooks/useLocale";
import { useGet } from "../../../hooks/CRUD/useGet";
import { getInboundSummaryApi } from "../../../api/queries/getters";
import { INBOUND_SUMMARY_KEY } from "../constants";

// Paging does not change the totals, so it is left out of the request.
const SUMMARY_KEYS = ["search", "start_date", "end_date"];
// Countries shown as their own pill before the rest is folded into "+N".
const MAX_COUNTRIES = 5;

const formatCount = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));

const StatPill = ({ label, value, color = "primary" }) => (
  <Box
    sx={(theme) => ({
      height: 32,
      display: "flex",
      alignItems: "center",
      gap: 0.6,
      px: 1.25,
      borderRadius: "8px",
      whiteSpace: "nowrap",
      color: theme.palette[color].main,
      backgroundColor: alpha(theme.palette[color].main, 0.08),
      border: `1px solid ${alpha(theme.palette[color].main, 0.22)}`,
    })}
  >
    <Typography component="span" sx={{ fontSize: "11.5px", fontWeight: 600, opacity: 0.85 }}>
      {label}:
    </Typography>
    <Typography component="span" sx={{ fontSize: "13.5px", fontWeight: 750 }}>
      {value}
    </Typography>
  </Box>
);

/** Totals of the active tab's report, for the same search and dates as its table. */
const InboundSummary = ({ tab, queryParams = {} }) => {
  const { t } = useLocale();

  const params = useMemo(
    () =>
      Object.fromEntries(
        SUMMARY_KEYS.filter((k) => queryParams[k] !== undefined && queryParams[k] !== "").map((k) => [
          k,
          queryParams[k],
        ]),
      ),
    [queryParams],
  );

  const { data } = useGet({
    apiFn: getInboundSummaryApi,
    key: INBOUND_SUMMARY_KEY,
    params,
  });

  const summary = Array.isArray(data) ? null : data;
  if (!summary) return null;

  if (tab === "expected") {
    return (
      <>
        <StatPill label={t("inbound.summary.groups")} value={formatCount(summary.expected?.groups)} />
        <StatPill
          label={t("inbound.summary.tourists")}
          value={formatCount(summary.expected?.tourists)}
          color="success"
        />
      </>
    );
  }

  if (tab === "arrivals") {
    const countries = summary.arrivals?.countries || [];
    const shown = countries.slice(0, MAX_COUNTRIES);
    const rest = countries.slice(MAX_COUNTRIES);
    return (
      <>
        <StatPill
          label={t("inbound.summary.totalArrivals")}
          value={formatCount(summary.arrivals?.total)}
          color="success"
        />
        {shown.map((row) => (
          <StatPill key={row.country} label={row.country} value={formatCount(row.count)} />
        ))}
        {rest.length > 0 && (
          <Tooltip title={rest.map((row) => `${row.country}: ${row.count}`).join(", ")} arrow>
            <Box>
              <StatPill
                label={t("inbound.summary.otherCountries")}
                value={`+${rest.length}`}
              />
            </Box>
          </Tooltip>
        )}
      </>
    );
  }

  return (
    <>
      <StatPill label={t("inbound.summary.submitted")} value={formatCount(summary.invitations?.submitted)} />
      <StatPill
        label={t("inbound.summary.granted")}
        value={formatCount(summary.invitations?.granted)}
        color="success"
      />
      <StatPill
        label={t("inbound.summary.refused")}
        value={formatCount(summary.invitations?.refused)}
        color="error"
      />
      <StatPill
        label={t("inbound.summary.pending")}
        value={formatCount(summary.invitations?.pending)}
        color="warning"
      />
      <StatPill
        label={t("inbound.summary.notArrived")}
        value={formatCount(summary.invitations?.not_arrived)}
        color="info"
      />
    </>
  );
};

export default memo(InboundSummary);
