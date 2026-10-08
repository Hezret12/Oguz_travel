import { memo, useMemo } from "react";
import { BanknoteArrowDown, BanknoteArrowUp, PiggyBank, Wallet } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";
import BaseFareLabel from "../../../../components/BaseFareLabel";
import KpiStrip from "../../../AdminDashboard/Contents/KpiStrip";
import { KPI_TONES } from "../../Overview/functions/analyticsFormat";

/**
 * Headline totals across every office, drawn with the admin dashboard's KPI cards: a row per
 * currency, without the change-against-the-previous-period pill. `cards` is the dashboard
 * cards figure set for all offices ({ revenue, cost, profit }, each { TMT, USD } → { value }).
 * Money out — base fare, salaries and kassa expenses together — is the cards' own `outTotal`;
 * an API without it falls back to `outTotal` ({ TMT, USD }), the per-office totals added up.
 */
const OfficesSummary = ({ cards, outTotal }) => {
  const { t } = useLocale();

  const kpis = useMemo(
    () => [
      { key: "revenue", label: t("dashboard.sales"), icon: BanknoteArrowDown, tone: KPI_TONES.inflow, figure: cards.revenue },
      { key: "cost", label: <BaseFareLabel />, icon: BanknoteArrowUp, tone: KPI_TONES.outflow, figure: cards.cost },
      { key: "profit", label: t("dashboard.profit"), icon: PiggyBank, tone: KPI_TONES.profit, figure: cards.profit },
      {
        key: "out",
        label: t("finance.offices.outTotal"),
        icon: Wallet,
        tone: KPI_TONES.expense,
        figure: cards.outTotal ?? { TMT: { value: outTotal.TMT }, USD: { value: outTotal.USD } },
      },
    ],
    [cards, outTotal, t],
  );

  return <KpiStrip cells={kpis} showChange={false} />;
};

export default memo(OfficesSummary);
