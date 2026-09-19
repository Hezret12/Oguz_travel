import dayjs from "dayjs";

// Demo sales in the exact row shape of GET /total-calculations/get-all-total-calculations,
// so the dashboard runs end-to-end without the backend. Seeded per year:
// the same year always produces the same rows. Delete with USE_MOCK_SALES.

export const MOCK_OFFICES = [
  { guid: "mock-office-ag", shortName: { tk: "Aşgabat", ru: "Ашхабад", en: "Ashgabat" } },
  { guid: "mock-office-lb", shortName: { tk: "Lebap", ru: "Лебап", en: "Lebap" } },
  { guid: "mock-office-mr", shortName: { tk: "Mary", ru: "Мары", en: "Mary" } },
  { guid: "mock-office-bn", shortName: { tk: "Balkan", ru: "Балкан", en: "Balkan" } },
  { guid: "mock-office-dz", shortName: { tk: "Daşoguz", ru: "Дашогуз", en: "Dashoguz" } },
];

// weight = share of sales; price = [min, max] in USD; margin = [min, max];
// statuses: whether the module tracks paid / credit / refund.
const SERVICES = [
  { guid: "mock-thy", name: { tk: "Türk howa ýollary", ru: "Turkish Airlines", en: "Turkish Airlines" }, weight: 12, price: [260, 1300], margin: [0.03, 0.07], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000007", name: { tk: "Bukja", ru: "Пакет", en: "Package" }, weight: 2, price: [800, 3000], margin: [0.1, 0.2], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000001", name: { tk: "B2B", ru: "B2B", en: "B2B" }, weight: 26, price: [180, 900], margin: [0.05, 0.12], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000002", name: { tk: "Howa ýollary", ru: "Авиалинии", en: "Airways" }, weight: 16, price: [220, 1100], margin: [0.04, 0.09], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000008", name: { tk: "Wiza", ru: "Виза", en: "Visa" }, weight: 14, price: [60, 450], margin: [0.18, 0.4], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000004", name: { tk: "Myhmanhana", ru: "Отель", en: "Hotel" }, weight: 9, price: [250, 2400], margin: [0.08, 0.18], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000005", name: { tk: "Syýahat", ru: "Тур", en: "Tour" }, weight: 6, price: [600, 3500], margin: [0.1, 0.22], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000009", name: { tk: "Terjime", ru: "Перевод", en: "Translation" }, weight: 12, price: [15, 120], margin: [0.35, 0.6], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000010", name: { tk: "Ugur haty", ru: "Направление", en: "Referral Letter" }, weight: 6, price: [40, 160], margin: [0.3, 0.5], statuses: false },
  { guid: "e1000000-0000-0000-0000-000000000003", name: { tk: "Demir ýollary", ru: "Железная дорога", en: "Railway" }, weight: 4, price: [30, 180], margin: [0.06, 0.12], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000006", name: { tk: "Ulag", ru: "Трансфер", en: "Transfer" }, weight: 3, price: [25, 150], margin: [0.15, 0.3], statuses: true },
  { guid: "e1000000-0000-0000-0000-000000000011", name: { tk: "Kafe", ru: "Кафе", en: "Cafeteria" }, weight: 4, price: [3, 25], margin: [0.4, 0.6], statuses: false },
];

const OPERATORS = [
  ["Ahat Orazow", 0], ["Nasyba Gurbanowa", 0], ["Şöhrat Annaýew", 0], ["Elmira Hojaýewa", 1],
  ["Dawud Rejepow", 1], ["Kakajan Myradow", 2], ["Bägül Atayewa", 2], ["Atabaý Nurlyýew", 3],
  ["Çynar Sähedowa", 3], ["Aýlar Berdiýewa", 4],
].map(([fullName, office], i) => ({ guid: `mock-opr-${i}`, fullName, office: MOCK_OFFICES[office] }));

const OFFICE_WEIGHTS = [34, 22, 18, 14, 12];
const TMT_RATE = 19.5;

const seeded = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const pickWeighted = (rand, items, weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
};

export const buildMockSales = (year, today = dayjs()) => {
  const rand = seeded(year * 7919);
  const rows = [];
  const first = dayjs(`${year}-01-01`);
  const last = year === today.year() ? today : dayjs(`${year}-12-31`);
  const growth = year < today.year() ? 0.85 : 1; // last year a little smaller

  for (let d = first; !d.isAfter(last, "day"); d = d.add(1, "day")) {
    const weekend = d.day() === 0 ? 0.35 : d.day() === 6 ? 0.7 : 1;
    const season = 1 + 0.35 * Math.sin(((d.month() - 3) / 12) * 2 * Math.PI); // summer peak
    const perDay = Math.round((8 + rand() * 10) * weekend * season * growth);

    for (let n = 0; n < perDay; n++) {
      const service = pickWeighted(rand, SERVICES, SERVICES.map((s) => s.weight));
      const office = pickWeighted(rand, MOCK_OFFICES, OFFICE_WEIGHTS);
      const officeOps = OPERATORS.filter((o) => o.office.guid === office.guid);
      const operator = officeOps[Math.floor(rand() * officeOps.length)];
      const tmt = service.guid.endsWith("11") || service.guid.endsWith("09") ? rand() < 0.8 : rand() < 0.25;
      const currency = tmt ? "TMT" : "USD";

      let sale = service.price[0] + rand() * (service.price[1] - service.price[0]);
      if (tmt) sale *= TMT_RATE;
      sale = Math.round(sale);
      const margin = service.margin[0] + rand() * (service.margin[1] - service.margin[0]);
      const net = Math.round(sale * (1 - margin));

      // Older sales are mostly settled; recent ones still carry credit.
      const ageDays = today.diff(d, "day");
      let status = null;
      if (service.statuses) {
        const roll = rand();
        const creditChance = ageDays < 14 ? 0.35 : ageDays < 60 ? 0.15 : 0.05;
        status = roll < 0.025 ? "REFUND" : roll < 0.025 + creditChance ? "notpaid" : "paid";
      }
      const credit = status === "paid" ? sale : status === "notpaid" ? Math.round(sale * rand() * 0.5) : 0;
      const time = d.hour(9 + Math.floor(rand() * 9)).minute(Math.floor(rand() * 60));

      rows.push({
        guid: `mock-${year}-${rows.length}`,
        category_guid: service.guid,
        category: { guid: service.guid, name: service.name },
        datetime: time.toISOString(),
        receiver_opr_guid: operator.guid,
        receiver_operator: { guid: operator.guid, fullName: operator.fullName },
        office_guid: office.guid,
        office: { guid: office.guid, shortName: office.shortName, fullName: office.shortName },
        status,
        sale_price: sale,
        net_price: net,
        profit: sale - net,
        credit_price: credit,
        currency,
        is_manual: false,
      });
    }
  }
  return rows;
};
