import { useMemo } from "react";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { useLocale } from "../../../../hooks/useLocale";
import { getAllOfficeApi } from "../../../../api/queries/getters";
import { toDashboardParams, useDashboardOffices } from "../../Overview/functions/dashboardData";

const EMPTY = { USD: 0, TMT: 0 };
const EMPTY_TOTALS = { inflow: EMPTY, outflow: EMPTY, credit: EMPTY, profit: EMPTY };

/**
 * Every office's sales (money in), cost of sales (money out) and profit for a
 * period, from GET /dashboard/office-by-office. USD and TMT are never
 * converted or added together.
 */
// `customRange` ({ start, end } as "YYYY-MM-DD") applies when period is "custom".
export const useOfficesFinance = (period, customRange) => {
  const { selectedLang } = useLocale();
  const start = customRange?.start;
  const end = customRange?.end;
  const params = useMemo(
    () => toDashboardParams({ period, customRange: start && end ? { start, end } : null }),
    [period, start, end],
  );
  const { data: report, isLoading, isFetching, isError } = useDashboardOffices(params);

  // The report names offices by full name; show the short one, as elsewhere.
  const { data: officesData } = useGet({ apiFn: getAllOfficeApi, key: "all-offices-filter" });
  const shortNames = useMemo(
    () =>
      new Map(
        (Array.isArray(officesData) ? officesData : []).map((o) => [o.guid, selectedLang(o.shortName)]),
      ),
    [officesData, selectedLang],
  );

  const data = useMemo(
    () => ({
      rows: (report?.rows ?? []).map((row) => ({
        ...row,
        name: shortNames.get(row.guid) || selectedLang(row.name) || "—",
      })),
      totals: report?.totals ?? EMPTY_TOTALS,
    }),
    [report, shortNames, selectedLang],
  );

  return { data, isLoading, isFetching, isError };
};
