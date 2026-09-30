import { useMemo } from "react";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { useLocale } from "../../../../hooks/useLocale";
import { getAllOfficeApi } from "../../../../api/queries/getters";
import { CURRENCIES } from "../../Overview/functions/analyticsFormat";
import { combineQueries, toDashboardParams, useDashboardOffices } from "../../Overview/functions/dashboardData";

const zero = () => ({ USD: 0, TMT: 0 });

/**
 * Every office's sales (money in), cost of sales (money out) and profit for a
 * period, from GET /dashboard/offices-by-office. The endpoint answers in one
 * currency, so USD and TMT are fetched side by side and joined per office;
 * they are never converted or added together.
 */
// `customRange` ({ start, end } as "YYYY-MM-DD") applies when period is "custom".
export const useOfficesFinance = (period, customRange) => {
  const { selectedLang } = useLocale();
  const start = customRange?.start;
  const end = customRange?.end;
  const range = useMemo(
    () => toDashboardParams({ period, customRange: start && end ? { start, end } : null }),
    [period, start, end],
  );
  const usdParams = useMemo(() => ({ ...range, currency: "USD" }), [range]);
  const tmtParams = useMemo(() => ({ ...range, currency: "TMT" }), [range]);
  const usdQuery = useDashboardOffices(usdParams);
  const tmtQuery = useDashboardOffices(tmtParams);
  const status = combineQueries([usdQuery, tmtQuery]);

  // The report names offices by full name; show the short one, as elsewhere.
  const { data: officesData } = useGet({ apiFn: getAllOfficeApi, key: "all-offices-filter" });
  const shortNames = useMemo(
    () =>
      new Map(
        (Array.isArray(officesData) ? officesData : []).map((o) => [o.guid, selectedLang(o.shortName)]),
      ),
    [officesData, selectedLang],
  );

  const usd = usdQuery.data;
  const tmt = tmtQuery.data;
  const data = useMemo(() => {
    const byOffice = new Map();
    const perCurrency = { USD: usd ?? [], TMT: tmt ?? [] };
    CURRENCIES.forEach((currency) => {
      perCurrency[currency].forEach((o) => {
        const row =
          byOffice.get(o.guid) ??
          {
            guid: o.guid,
            name: shortNames.get(o.guid) || selectedLang(o.name) || "—",
            inflow: zero(),
            outflow: zero(),
            profit: zero(),
            profitChange: zero(),
          };
        row.inflow[currency] = o.sale;
        row.outflow[currency] = o.net;
        row.profit[currency] = o.profit;
        row.profitChange[currency] = o.profitChange;
        byOffice.set(o.guid, row);
      });
    });

    const rows = [...byOffice.values()];
    const totals = { inflow: zero(), outflow: zero(), profit: zero() };
    rows.forEach((row) => {
      Object.keys(totals).forEach((group) => {
        CURRENCIES.forEach((currency) => {
          totals[group][currency] += row[group][currency];
        });
      });
    });
    return { rows, totals };
  }, [usd, tmt, shortNames, selectedLang]);

  return { data, isLoading: status.isLoading, isFetching: status.isFetching, isError: status.isError };
};
