import { useMemo } from "react";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { useLocale } from "../../../../hooks/useLocale";
import { getAllOfficeApi } from "../../../../api/queries/getters";
import { getOfficeAnalyticsMock } from "../../Overview/functions/officeAnalyticsMock";

/**
 * Money in / money out / profit per office, as one total each (no breakdown).
 *
 * Planned endpoint: GET /total-calculations/get-offices-summary
 *   ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 * returning, per office:
 *   { guid, name, inflow: { USD, TMT }, outflow: { USD, TMT } }
 * Profit is derived here as inflow − outflow, per currency. USD and TMT are
 * never converted or added together.
 *
 * Until then the office list is real and the amounts are demo numbers.
 */

// Used only when the office list is empty or cannot be loaded.
const DEMO_OFFICES = [
  { guid: "demo-ashgabat", name: { tk: "Aşgabat", ru: "Ашхабад", en: "Ashgabat" } },
  { guid: "demo-balkan", name: { tk: "Balkan", ru: "Балкан", en: "Balkan" } },
  { guid: "demo-mary", name: { tk: "Mary", ru: "Мары", en: "Mary" } },
  { guid: "demo-lebap", name: { tk: "Lebap", ru: "Лебап", en: "Lebap" } },
  { guid: "demo-dashoguz", name: { tk: "Daşoguz", ru: "Дашогуз", en: "Dashoguz" } },
];

// Seeded 0..1 generator, so an office shows the same numbers for a period.
const seededRandom = (seedText) => {
  let seed = [...seedText].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 11);
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let x = seed;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const bothCurrencies = (fn) => ({ USD: Math.round(fn("USD")), TMT: Math.round(fn("TMT")) });

// Scales one office's demo cash flow per office: size stays the same across
// periods (seeded by office only), the period adds a little movement.
const buildOfficesMock = (offices, period, customRange) => {
  const base = getOfficeAnalyticsMock(period, undefined, customRange);
  const cash = base.cashFlow.current;
  const periodSeed = `${base.period.key}:${base.period.start}`;

  const rows = offices.map((office) => {
    const sizeRand = seededRandom(office.guid);
    const size = 0.35 + sizeRand() * 1.1;
    const costRatio = 0.8 + sizeRand() * 0.28; // above 1 means a loss
    const periodRand = seededRandom(`${periodSeed}:${office.guid}`);
    const move = () => 0.9 + periodRand() * 0.2;

    const inflow = bothCurrencies((cur) => cash[cur].inflow * size * move());
    const outflow = bothCurrencies((cur) => inflow[cur] * costRatio * move());
    return { ...office, inflow, outflow };
  });

  return { period: base.period, rows };
};

export const withProfit = (row) => ({
  ...row,
  profit: { USD: row.inflow.USD - row.outflow.USD, TMT: row.inflow.TMT - row.outflow.TMT },
});

export const sumRows = (rows) =>
  rows.reduce(
    (acc, r) => {
      for (const key of ["inflow", "outflow", "profit"]) {
        acc[key].USD += r[key].USD;
        acc[key].TMT += r[key].TMT;
      }
      return acc;
    },
    { inflow: { USD: 0, TMT: 0 }, outflow: { USD: 0, TMT: 0 }, profit: { USD: 0, TMT: 0 } },
  );

// `customRange` ({ start, end } as "YYYY-MM-DD") applies when period is "custom".
export const useOfficesFinance = (period, customRange) => {
  const { selectedLang } = useLocale();
  const { data: officesData, isLoading } = useGet({
    apiFn: getAllOfficeApi,
    key: "all-offices-filter",
    params: { limit: 100 },
  });

  const offices = useMemo(() => {
    const raw = officesData?.data ?? officesData ?? [];
    const list = Array.isArray(raw) ? raw : [];
    const source = list.length > 0 ? list : DEMO_OFFICES;
    return source.map((o) => ({
      guid: o.guid,
      name:
        selectedLang(o.shortName) ||
        selectedLang(o.fullName) ||
        selectedLang(o.name) ||
        (typeof o.name === "string" ? o.name : "—"),
    }));
  }, [officesData, selectedLang]);

  const start = customRange?.start;
  const end = customRange?.end;
  const data = useMemo(() => {
    const { period: resolved, rows } = buildOfficesMock(offices, period, start && end ? { start, end } : null);
    const withTotals = rows.map(withProfit);
    return { period: resolved, rows: withTotals, totals: sumRows(withTotals) };
  }, [offices, period, start, end]);

  return { data, isLoading, isDemo: true };
};
