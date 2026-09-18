import dayjs from "dayjs";

/**
 * Realistic demo data for the office finance report.
 *
 * The returned object has the exact shape planned for
 * `GET /total-calculations/get-office-analytics?period=…` (aggregated from
 * tbl_total_calculations + tbl_salary for the caller's office), so swapping
 * this for the real request only changes `useOfficeAnalytics`.
 *
 * USD and TMT are never converted: every amount is `{ USD, TMT }`.
 * Output is deterministic per period, so switching periods back and forth
 * shows the same numbers.
 */

export const PERIODS = ["thisMonth", "lastMonth", "quarter", "year"];

// A user-picked { start, end } range ("YYYY-MM-DD", both inclusive).
export const CUSTOM_PERIOD = "custom";
export const MAX_RANGE_DAYS = 366;

export const isValidCustomRange = (customRange, today = dayjs()) => {
  if (!customRange?.start || !customRange?.end) return false;
  const start = dayjs(customRange.start);
  const end = dayjs(customRange.end);
  return (
    start.isValid() &&
    end.isValid() &&
    !start.isAfter(end, "day") &&
    !end.isAfter(today, "day") &&
    end.diff(start, "day") + 1 <= MAX_RANGE_DAYS
  );
};

// Seeded PRNG (mulberry32) so a period always renders the same demo numbers.
const createRandom = (seedText) => {
  let seed = [...seedText].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let x = seed;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const round = (n) => Math.round(n);
const jitter = (rand, spread) => 1 + (rand() * 2 - 1) * spread;

// One month of a mid-size Ashgabat travel office, by ledger category.
// cost = net_price, revenue = sale_price.
const CATEGORY_BASE = [
  { key: "b2b", name: { tk: "B2B bilet", ru: "B2B билеты", en: "B2B tickets" }, count: 184, USD: [38400, 34700], TMT: [98000, 84200] },
  { key: "airway", name: { tk: "Howa ýollary", ru: "Авиалинии", en: "Airways" }, count: 41, USD: [9300, 8150], TMT: [0, 0] },
  { key: "railway", name: { tk: "Demir ýollary", ru: "Железная дорога", en: "Railway" }, count: 66, USD: [0, 0], TMT: [19200, 15600] },
  { key: "hotel", name: { tk: "Myhmanhana", ru: "Отель", en: "Hotel" }, count: 23, USD: [7850, 6320], TMT: [0, 0] },
  { key: "tour", name: { tk: "Syýahat", ru: "Тур", en: "Tour" }, count: 9, USD: [11600, 9250], TMT: [0, 0] },
  { key: "package", name: { tk: "Bukja", ru: "Пакет", en: "Package" }, count: 6, USD: [6650, 5230], TMT: [0, 0] },
  { key: "transfer", name: { tk: "Ulag", ru: "Трансфер", en: "Transfer" }, count: 31, USD: [0, 0], TMT: [9200, 5900] },
  { key: "translation", name: { tk: "Terjime", ru: "Перевод", en: "Translation" }, count: 142, USD: [0, 0], TMT: [26000, 10200] },
  { key: "referral", name: { tk: "Ugur haty", ru: "Направление", en: "Referral letter" }, count: 57, USD: [0, 0], TMT: [18000, 6100] },
  { key: "cafeteria", name: { tk: "Kafe", ru: "Кафе", en: "Cafeteria" }, count: 318, USD: [0, 0], TMT: [12400, 8200] },
  // Not in tbl_total_calculations yet: read from tbl_visa / tbl_turkish_airlines.
  { key: "visa", name: { tk: "Wiza", ru: "Виза", en: "Visa" }, count: 38, USD: [6800, 4900], TMT: [14500, 7800] },
  { key: "turkish", name: { tk: "Türk howa ýollary", ru: "Turkish Airlines", en: "Turkish Airlines" }, count: 52, USD: [21000, 19200], TMT: [0, 0] },
];

// Where sale costs are paid to (cash outflow to suppliers), by category.
const SUPPLIER_GROUPS = [
  { key: "airlines", categories: ["b2b", "airway", "turkish"], name: { tk: "Awiakompaniýalar", ru: "Авиакомпании", en: "Airlines" } },
  { key: "hotels", categories: ["hotel"], name: { tk: "Myhmanhanalar", ru: "Отели", en: "Hotels" } },
  { key: "tourOperators", categories: ["tour", "package", "transfer"], name: { tk: "Tur operatorlary", ru: "Туроператоры", en: "Tour operators" } },
  { key: "railway", categories: ["railway"], name: { tk: "Demir ýol kassasy", ru: "Ж/д касса", en: "Railway desk" } },
  { key: "visaCenters", categories: ["visa"], name: { tk: "Wiza merkezleri", ru: "Визовые центры", en: "Visa centres" } },
  { key: "contractors", categories: ["translation", "referral"], name: { tk: "Terjimeçiler we hyzmatlar", ru: "Переводчики и услуги", en: "Translators & services" } },
  { key: "cafeSupplies", categories: ["cafeteria"], name: { tk: "Kafe harytlary", ru: "Товары для кафе", en: "Cafeteria supplies" } },
];

const EXCHANGE_RATE = 19.5;
const EXCHANGE_NAME = { tk: "Walýuta çalşygy", ru: "Обмен валюты", en: "Currency exchange" };
const WEEKDAY_WEIGHTS = [0.22, 1.12, 1.08, 1.02, 1.1, 1.24, 0.92]; // Sun..Sat

// Manual cash-flow expenses + payroll, per month.
const EXPENSE_BASE = [
  { key: "salary", source: "salary", name: { tk: "Aýlyklar", ru: "Зарплаты", en: "Salaries" }, USD: 0, TMT: 34200 },
  { key: "rent", source: "manual", name: { tk: "Ofis kärendesi", ru: "Аренда офиса", en: "Office rent" }, USD: 0, TMT: 12000 },
  { key: "utilities", source: "manual", name: { tk: "Kommunal we internet", ru: "Коммуналка и интернет", en: "Utilities & internet" }, USD: 0, TMT: 3250 },
  { key: "transport", source: "manual", name: { tk: "Ulag we ýangyç", ru: "Транспорт и топливо", en: "Transport & fuel" }, USD: 0, TMT: 2800 },
  { key: "marketing", source: "manual", name: { tk: "Mahabat", ru: "Реклама", en: "Marketing" }, USD: 460, TMT: 1500 },
  { key: "supplies", source: "manual", name: { tk: "Kanselýariýa", ru: "Канцелярия", en: "Office supplies" }, USD: 0, TMT: 1150 },
  { key: "other", source: "manual", name: { tk: "Beýlekiler", ru: "Прочее", en: "Other" }, USD: 140, TMT: 1900 },
];

// Share of the office's sales each operator handles.
const OPERATORS = [
  { guid: "op-1", fullName: "Aýgül Orazowa", share: 0.22 },
  { guid: "op-2", fullName: "Merdan Hojamyradow", share: 0.19 },
  { guid: "op-3", fullName: "Leýli Annaýewa", share: 0.16 },
  { guid: "op-4", fullName: "Serdar Gurbanow", share: 0.14 },
  { guid: "op-5", fullName: "Jeren Baýramowa", share: 0.12 },
  { guid: "op-6", fullName: "Döwlet Atayew", share: 0.1 },
  { guid: "op-7", fullName: "Maýsa Çaryýewa", share: 0.07 },
];

// thisMonth / year run up to today; lastMonth / quarter are complete months.
const PERIOD_CONFIG = {
  thisMonth: { months: 1, granularity: "day" },
  lastMonth: { months: 1, granularity: "day" },
  quarter: { months: 3, granularity: "week" },
  year: { months: 12, granularity: "month" },
};

const getRange = (period, today) => {
  switch (period) {
    case "lastMonth": {
      const start = today.subtract(1, "month").startOf("month");
      return { start, end: start.endOf("month") };
    }
    case "quarter": {
      // The last three complete months.
      const start = today.startOf("month").subtract(3, "month");
      return { start, end: today.startOf("month").subtract(1, "day").endOf("day") };
    }
    case "year":
      return { start: today.startOf("year"), end: today.endOf("day") };
    default:
      return { start: today.startOf("month"), end: today.endOf("day") };
  }
};

const emptyTotals = () => ({
  revenue: 0,
  cost: 0,
  grossProfit: 0,
  expenses: 0,
  netProfit: 0,
  collected: 0,
  receivable: 0,
  salesCount: 0,
});

const buildTotals = (categories, expenses, collectionRate) => {
  const totals = { USD: emptyTotals(), TMT: emptyTotals() };
  categories.forEach((c) => {
    ["USD", "TMT"].forEach((cur) => {
      totals[cur].revenue += c[cur].revenue;
      totals[cur].cost += c[cur].cost;
      if (c[cur].revenue > 0) totals[cur].salesCount += c[`count${cur}`];
    });
  });
  expenses.forEach((e) => {
    totals.USD.expenses += e.USD;
    totals.TMT.expenses += e.TMT;
  });
  ["USD", "TMT"].forEach((cur) => {
    const t = totals[cur];
    t.grossProfit = t.revenue - t.cost;
    t.netProfit = t.grossProfit - t.expenses;
    t.collected = round(t.revenue * collectionRate[cur]);
    t.receivable = t.revenue - t.collected;
  });
  return totals;
};

const buildCategories = (rand, scale) =>
  CATEGORY_BASE.map((c) => {
    const k = scale * jitter(rand, 0.12);
    const margin = jitter(rand, 0.06);
    const [usdRev, usdCost] = c.USD;
    const [tmtRev, tmtCost] = c.TMT;
    const count = round(c.count * k);
    // B2B sells in both currencies; single-currency services keep one.
    const usdShare = usdRev && tmtRev ? 0.45 : usdRev ? 1 : 0;
    const money = (rev, cost) => {
      const revenue = round(rev * k);
      const spent = Math.min(revenue, round(cost * k * margin));
      return { revenue, cost: spent, profit: revenue - spent };
    };
    return {
      key: c.key,
      name: c.name,
      count,
      countUSD: round(count * usdShare),
      countTMT: count - round(count * usdShare),
      USD: money(usdRev, usdCost),
      TMT: money(tmtRev, tmtCost),
    };
  });

const buildExpenses = (rand, months) =>
  EXPENSE_BASE.map((e) => ({
    key: e.key,
    source: e.source,
    name: e.name,
    // Payroll and rent barely move month to month; the rest fluctuates.
    USD: round(e.USD * months * (e.source === "salary" || e.key === "rent" ? 1 : jitter(rand, 0.25))),
    TMT: round(e.TMT * months * (e.source === "salary" ? jitter(rand, 0.03) : e.key === "rent" ? 1 : jitter(rand, 0.25))),
  }));

// Time buckets for the period with a relative activity weight (a gentle
// wave; Sundays are quiet).
const buildBuckets = (rand, range, granularity) => {
  const buckets = [];
  // A custom range can cross months, where a bare "05" would be ambiguous.
  const dayFormat = range.start.isSame(range.end, "month") ? "DD" : "DD.MM";
  let cursor = range.start;
  while (cursor.isBefore(range.end)) {
    const next = cursor.add(1, granularity);
    buckets.push({
      date: cursor.format("YYYY-MM-DD"),
      label:
        granularity === "day"
          ? cursor.format(dayFormat)
          : granularity === "week"
            ? cursor.format("DD.MM")
            : cursor.format("MM.YYYY"),
      dayOfMonth: cursor.date(),
      weight:
        (granularity === "day" && cursor.day() === 0 ? 0.25 : 1) *
        (1 + 0.18 * Math.sin((buckets.length / 4) * Math.PI)) *
        jitter(rand, 0.2),
    });
    cursor = next;
  }
  return buckets;
};

const toShares = (weights) => {
  const sum = weights.reduce((acc, w) => acc + w, 0) || 1;
  return weights.map((w) => w / sum);
};

// Splits period totals across trend buckets.
// Also carries the per-bucket series the summary sparklines need:
// expenses, net profit and the running receivable.
const buildTrend = (rand, buckets, totals) => {
  const shares = toShares(buckets.map((b) => b.weight));
  // Expenses are steadier than sales.
  const expenseShares = toShares(buckets.map((b) => Math.sqrt(b.weight) * jitter(rand, 0.1)));
  const cumulative = { USD: 0, TMT: 0 };
  return buckets.map((b, i) => {
    const share = shares[i];
    const point = { date: b.date, label: b.label };
    ["USD", "TMT"].forEach((cur) => {
      const revenue = round(totals[cur].revenue * share);
      const cost = round(totals[cur].cost * share * jitter(rand, 0.04));
      const expenses = round(totals[cur].expenses * expenseShares[i]);
      cumulative[cur] += revenue;
      point[cur] = {
        revenue,
        cost,
        profit: revenue - cost,
        grossProfit: revenue - cost,
        expenses,
        netProfit: revenue - cost - expenses,
        // Open balance grows with sales as the period goes on.
        receivable: totals[cur].revenue
          ? round((totals[cur].receivable * cumulative[cur]) / totals[cur].revenue)
          : 0,
      };
    });
    return point;
  });
};

const buildOperators = (rand, categories) => {
  const sum = (cur, field) => categories.reduce((s, c) => s + c[cur][field], 0);
  const totalCount = categories.reduce((s, c) => s + c.count, 0) - (categories.find((c) => c.key === "cafeteria")?.count || 0);
  const weights = OPERATORS.map((o) => o.share * jitter(rand, 0.15));
  const weightSum = weights.reduce((s, w) => s + w, 0);
  return OPERATORS.map((o, i) => {
    const share = weights[i] / weightSum;
    const marginFactor = jitter(rand, 0.1);
    const entry = { guid: o.guid, fullName: o.fullName, count: round(totalCount * share) };
    ["USD", "TMT"].forEach((cur) => {
      const revenue = round(sum(cur, "revenue") * share);
      entry[cur] = { revenue, profit: round(sum(cur, "profit") * share * marginFactor) };
    });
    return entry;
  }).sort((a, b) => b.USD.revenue - a.USD.revenue);
};

const RECEIVABLE_SERVICES = ["b2b", "tour", "visa", "hotel", "turkish", "package", "translation"];

const buildReceivables = (rand, totals, today) => {
  const split = [0.58, 0.27, 0.15];
  const buckets = ["d0_30", "d31_60", "d60_plus"].map((key, i) => ({
    key,
    USD: round(totals.USD.receivable * split[i]),
    TMT: round(totals.TMT.receivable * split[i]),
    count: round((totals.USD.salesCount + totals.TMT.salesCount) * 0.08 * split[i]) + 1,
  }));

  const items = Array.from({ length: 7 }, (_, i) => {
    const currency = rand() < 0.55 ? "USD" : "TMT";
    const service = CATEGORY_BASE.find((c) => c.key === RECEIVABLE_SERVICES[i % RECEIVABLE_SERVICES.length]);
    const sale = round((currency === "USD" ? 400 + rand() * 2600 : 2500 + rand() * 14000) / 10) * 10;
    const paid = round((sale * (rand() < 0.35 ? 0 : 0.2 + rand() * 0.5)) / 10) * 10;
    const days = [74, 52, 41, 33, 19, 11, 6][i];
    const operator = OPERATORS[Math.floor(rand() * OPERATORS.length)];
    return {
      guid: `rcv-${i + 1}`,
      category: service.name,
      operator: operator.fullName,
      date: today.subtract(days, "day").format("YYYY-MM-DD"),
      days,
      currency,
      sale,
      paid,
      due: sale - paid,
    };
  });

  return { buckets, items };
};

// Cash actually received (payments on sales) and paid out (suppliers,
// cash-flow expenses, salaries), plus the USD to TMT exchange that funds TMT
// costs. Every figure stays in its own currency.
const buildCashFlow = (rand, { categories, expenses, totals }, opening) => {
  const inflow = categories
    .map((c) => {
      const entry = { key: c.key, name: c.name, group: "sales" };
      ["USD", "TMT"].forEach((cur) => {
        // Collected share of this period plus some older debts paid now.
        entry[cur] = round(c[cur].revenue * (0.84 + rand() * 0.12) + c[cur].revenue * 0.04);
      });
      return entry;
    })
    .filter((e) => e.USD || e.TMT);

  const suppliers = SUPPLIER_GROUPS.map((g) => {
    const entry = { key: g.key, name: g.name, group: "supplier" };
    ["USD", "TMT"].forEach((cur) => {
      const cost = categories
        .filter((c) => g.categories.includes(c.key))
        .reduce((acc, c) => acc + c[cur].cost, 0);
      entry[cur] = round(cost * (0.92 + rand() * 0.07));
    });
    return entry;
  });

  const operating = expenses.map((e) => ({
    key: e.key,
    name: e.name,
    group: e.source === "salary" ? "salary" : "expense",
    // Salaries are paid after the month closes; a little is still owed.
    USD: e.source === "salary" ? round(e.USD * 0.97) : e.USD,
    TMT: e.source === "salary" ? round(e.TMT * 0.97) : e.TMT,
  }));

  const outflow = [...suppliers, ...operating].filter((e) => e.USD || e.TMT);
  const sumOf = (list, cur) => list.reduce((acc, e) => acc + e[cur], 0);

  // Sell enough USD to keep the TMT till slightly positive.
  const tmtGap = sumOf(outflow, "TMT") - sumOf(inflow, "TMT") + totals.TMT.revenue * 0.03;
  if (tmtGap > 0) {
    const tmt = Math.ceil(tmtGap / 1000) * 1000;
    inflow.push({ key: "exchange", name: EXCHANGE_NAME, group: "exchange", USD: 0, TMT: tmt });
    outflow.push({ key: "exchange", name: EXCHANGE_NAME, group: "exchange", USD: round(tmt / EXCHANGE_RATE), TMT: 0 });
  }

  const summary = {};
  ["USD", "TMT"].forEach((cur) => {
    const inTotal = sumOf(inflow, cur);
    const outTotal = sumOf(outflow, cur);
    summary[cur] = {
      inflow: inTotal,
      outflow: outTotal,
      net: inTotal - outTotal,
      opening: opening[cur],
      closing: opening[cur] + inTotal - outTotal,
    };
  });

  return { summary, inflow, outflow };
};

// Cash in/out per bucket and the running till balance. Outflows are lumpy:
// rent and salaries early in the month, supplier settlements mid-month.
const buildCashSeries = (rand, buckets, granularity, cash) => {
  const inShares = toShares(buckets.map((b) => b.weight * jitter(rand, 0.15)));
  const outShares = toShares(
    buckets.map((b) => {
      const spike = granularity === "day" && [3, 5, 15, 25].includes(b.dayOfMonth) ? 3.2 : 1;
      return b.weight * spike * jitter(rand, 0.45);
    }),
  );
  const balance = { USD: cash.summary.USD.opening, TMT: cash.summary.TMT.opening };
  const used = { USD: { in: 0, out: 0 }, TMT: { in: 0, out: 0 } };
  const isLast = (i) => i === buckets.length - 1;
  return buckets.map((b, i) => {
    const point = { date: b.date, label: b.label };
    ["USD", "TMT"].forEach((cur) => {
      // The last bucket absorbs rounding so the series ends on `closing`.
      const inAmount = isLast(i)
        ? cash.summary[cur].inflow - used[cur].in
        : round(cash.summary[cur].inflow * inShares[i]);
      const outAmount = isLast(i)
        ? cash.summary[cur].outflow - used[cur].out
        : round(cash.summary[cur].outflow * outShares[i]);
      used[cur].in += inAmount;
      used[cur].out += outAmount;
      balance[cur] += inAmount - outAmount;
      point[cur] = { inflow: inAmount, outflow: outAmount, net: inAmount - outAmount, balance: balance[cur] };
    });
    return point;
  });
};

// Sales count and revenue by weekday, Monday first.
const buildWeekdays = (rand, totals) => {
  const shares = toShares(WEEKDAY_WEIGHTS.map((w) => w * jitter(rand, 0.08)));
  return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    day,
    count: round((totals.USD.salesCount + totals.TMT.salesCount) * shares[day]),
    USD: round(totals.USD.revenue * shares[day]),
    TMT: round(totals.TMT.revenue * shares[day]),
  }));
};

// scale = number of (possibly partial) months the period covers.
const buildPeriod = (period, seedSuffix, scale) => {
  const rand = createRandom(`${period}:${seedSuffix}`);
  const categories = buildCategories(rand, scale);
  const expenses = buildExpenses(rand, scale);
  const collectionRate = { USD: 0.86 + rand() * 0.06, TMT: 0.9 + rand() * 0.05 };
  const totals = buildTotals(categories, expenses, collectionRate);
  return { rand, categories, expenses, totals };
};

// Bucket size for a custom range: daily up to ~6 weeks, weekly up to ~6
// months, monthly beyond (keeps every trend chart at a readable point count).
const granularityForDays = (days) => (days <= 45 ? "day" : days <= 180 ? "week" : "month");

// Resolves a period key (or "custom" + { start, end }) to its range and size.
const resolvePeriod = (period, today, customRange) => {
  if (period === CUSTOM_PERIOD && isValidCustomRange(customRange, today)) {
    const start = dayjs(customRange.start).startOf("day");
    const end = dayjs(customRange.end).endOf("day");
    const days = end.diff(start, "day") + 1;
    return {
      range: { start, end },
      granularity: granularityForDays(days),
      scale: days / 30.44,
      seed: `custom:${start.format("YYYY-MM-DD")}:${end.format("YYYY-MM-DD")}`,
      key: CUSTOM_PERIOD,
    };
  }

  const key = PERIOD_CONFIG[period] ? period : "thisMonth";
  const { months, granularity } = PERIOD_CONFIG[key];
  // Running periods only count the elapsed part.
  const progress =
    key === "thisMonth"
      ? Math.max(0.2, today.date() / today.daysInMonth())
      : key === "year"
        ? (today.diff(today.startOf("year"), "day") + 1) / (today.endOf("year").diff(today.startOf("year"), "day") + 1)
        : 1;
  return { range: getRange(key, today), granularity, scale: months * progress, seed: key, key };
};

export const getOfficeAnalyticsMock = (period = "thisMonth", today = dayjs(), customRange = null) => {
  const { range, granularity, scale, seed, key } = resolvePeriod(period, today, customRange);

  // Previous = the same span right before (slightly lower, seasonal noise).
  const current = buildPeriod(seed, "current", scale);
  const previous = buildPeriod(seed, "previous", scale * 0.93);

  const openingRand = createRandom(`${seed}:opening`);
  const previousOpening = {
    USD: round(15000 + openingRand() * 6000),
    TMT: round(120000 + openingRand() * 30000),
  };
  const previousCash = buildCashFlow(previous.rand, previous, previousOpening);
  // This period starts where the previous one ended.
  const currentCash = buildCashFlow(current.rand, current, {
    USD: previousCash.summary.USD.closing,
    TMT: previousCash.summary.TMT.closing,
  });
  const buckets = buildBuckets(current.rand, range, granularity);

  return {
    office: { name: { tk: "Aşgabat — Baş ofis", ru: "Ашхабад — Главный офис", en: "Ashgabat — Head office" } },
    period: {
      key,
      start: range.start.format("YYYY-MM-DD"),
      end: range.end.format("YYYY-MM-DD"),
      granularity,
    },
    totals: { current: current.totals, previous: previous.totals },
    trend: buildTrend(current.rand, buckets, current.totals),
    // Per-currency counts are only needed for the totals.
    categories: current.categories.map((c) => ({ key: c.key, name: c.name, count: c.count, USD: c.USD, TMT: c.TMT })),
    expenses: current.expenses,
    operators: buildOperators(current.rand, current.categories),
    receivables: buildReceivables(current.rand, current.totals, today),
    weekdays: buildWeekdays(current.rand, current.totals),
    cashFlow: {
      current: currentCash.summary,
      previous: previousCash.summary,
      inflow: currentCash.inflow,
      outflow: currentCash.outflow,
      series: buildCashSeries(current.rand, buckets, granularity, currentCash),
    },
  };
};
