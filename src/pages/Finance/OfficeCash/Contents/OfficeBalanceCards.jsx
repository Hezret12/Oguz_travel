import { memo } from "react";
import { Box, IconButton, Skeleton, Tooltip, Typography, alpha } from "@mui/material";
import { Building, Layers, Plus } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import { useDateFormat } from "../../../../functions/generalHelpers";
import { fmtMoney } from "../../CashFlow/functions/cashFlowHelpers";

const numSx = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };
const fmtNumber = (val) =>
  Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BalanceLine = ({ currency, total }) => {
  const { t } = useLocale();
  const balance = Number(total?.balance || 0);

  return (
    <Tooltip
      placement="top-start"
      title={
        total
          ? `${t("finance.income")} ${fmtMoney(total.income, currency)} · ${t("finance.expense")} ${fmtMoney(total.expense, currency)}`
          : ""
      }
    >
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
        <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "text.secondary" }}>{currency}</Typography>
        <Typography
          sx={{
            ...numSx,
            fontSize: "15px",
            fontWeight: 700,
            color: balance < 0 ? "error.main" : total ? "text.primary" : "text.disabled",
          }}
        >
          {fmtNumber(balance)}
        </Typography>
      </Box>
    </Tooltip>
  );
};

const OfficeCard = ({ name, icon: Icon, totals, count, lastDate, currencies, selected, onSelect, onAdd }) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const byCurrency = new Map(totals.map((x) => [x.currency, x]));

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
      sx={(theme) => ({
        p: 1.75,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : "background.paper",
        boxShadow: selected ? `0 0 0 1px ${theme.palette.primary.main}` : "none",
        cursor: "pointer",
        outline: "none",
        transition: "border-color .15s ease, background-color .15s ease",
        "&:hover": { borderColor: selected ? "primary.main" : "text.disabled" },
        "&:focus-visible": { boxShadow: `0 0 0 2px ${theme.palette.primary.main}` },
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <Box
          sx={(theme) => ({
            width: 30,
            height: 30,
            flexShrink: 0,
            borderRadius: "8px",
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          })}
        >
          <Icon size={16} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontSize: "14px", fontWeight: 700 }}>
            {name}
          </Typography>
          <Typography sx={{ fontSize: "11.5px", color: "text.secondary" }}>
            {t("finance.cashBook.operations", { count })}
          </Typography>
        </Box>
        {onAdd && (
          <Tooltip title={t("finance.officeCash.addForOffice")}>
            <IconButton
              size="small"
              aria-label={t("finance.officeCash.addForOffice")}
              onClick={(e) => {
                e.stopPropagation();
                e.currentTarget.blur();
                onAdd();
              }}
              onKeyDown={(e) => e.stopPropagation()}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: "8px", color: "primary.main" }}
            >
              <Plus size={16} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {currencies.map((currency) => (
          <BalanceLine key={currency} currency={currency} total={byCurrency.get(currency)} />
        ))}
      </Box>

      <Typography sx={{ fontSize: "11.5px", color: "text.secondary", mt: "auto" }}>
        {lastDate
          ? t("finance.officeCash.lastTransaction", { date: formatChange(lastDate, { dateOnly: true }) })
          : t("finance.officeCash.noTransactions")}
      </Typography>
    </Box>
  );
};

// One card per office with its cash balance per currency, plus an "all
// offices" card. Picking a card filters the transactions table below.
const OfficeBalanceCards = ({ offices, allTotals, currencies, selectedGuid, onSelect, onAdd, isLoading }) => {
  const { t, selectedLang } = useLocale();

  const gridSx = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 1.5,
    mb: 2,
  };

  if (isLoading && !offices.length) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={150} sx={{ borderRadius: "12px" }} />
        ))}
      </Box>
    );
  }

  const allCount = offices.reduce((sum, o) => sum + Number(o.count || 0), 0);
  const allLast = offices.reduce(
    (last, o) => (o.last_datetime && (!last || new Date(o.last_datetime) > new Date(last)) ? o.last_datetime : last),
    null,
  );

  return (
    <Box sx={gridSx}>
      <OfficeCard
        name={t("finance.officeCash.allOffices")}
        icon={Layers}
        totals={allTotals}
        count={allCount}
        lastDate={allLast}
        currencies={currencies}
        selected={!selectedGuid}
        onSelect={() => onSelect("")}
      />
      {offices.map((office) => (
        <OfficeCard
          key={office.guid}
          name={selectedLang(office.shortName) || selectedLang(office.fullName) || "—"}
          icon={Building}
          totals={office.totals || []}
          count={Number(office.count || 0)}
          lastDate={office.last_datetime}
          currencies={currencies}
          selected={selectedGuid === office.guid}
          onSelect={() => onSelect(selectedGuid === office.guid ? "" : office.guid)}
          onAdd={() => onAdd(office.guid)}
        />
      ))}
    </Box>
  );
};

export default memo(OfficeBalanceCards);
