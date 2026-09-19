// Parses the "GÜNLIK KASSA" workbook (GIRDEJI + ÇYKDAJY sheets) into
// cash-ledger rows for POST /total-calculations/import-total-calculations.
//
// - Sheets are recognised by name (GIRDEJI → INCOME, ÇYKDAJY → EXPENSE);
//   KASSA / overview sheets are ignored — they are daily cashier closings that
//   would double-count the money already listed in GIRDEJI.
// - Columns are located by header text, not position, so inserted/moved
//   columns in future files still parse.
// - A row carrying both USD and TMT becomes two rows (one per currency).
// - Every row gets a deterministic import_key so re-uploading a file (or a
//   newer file that still contains the old rows) never duplicates data.

const SHEET_KINDS = [
  { match: /GIRDEJI/, type: "INCOME" },
  { match: /[ÇC]YKDAJY/, type: "EXPENSE" },
];

const HEADER_ALIASES = {
  date: ["SENE"],
  time: ["SAGAT"],
  giver: ["TABŞYRAN", "TABSYRAN"],
  receiver: ["KABUL EDEN"],
  description: ["AÇYKLAMA", "ACYKLAMA"],
  company: ["KÄRHANA ÜÇIN", "KARHANA UCIN", "KÄRHANA"],
  category: ["CATEGORY", "KATEGORIÝA", "KATEGORIYA"],
  usd: ["USD"],
  tmt: ["TMT"],
};

const norm = (v) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const clean = (v) => {
  const s = String(v ?? "").replace(/\s+/g, " ").trim();
  return s || null;
};

const pad = (n) => String(n).padStart(2, "0");

// Excel serial day → { y, m, d } (1900 date system)
const fromSerial = (serial) => {
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  const dt = new Date(ms);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
};

const parseDate = (v) => {
  if (v == null || v === "") return null;
  if (typeof v === "number" && v > 20000 && v < 80000) return fromSerial(Math.floor(v));
  if (v instanceof Date && !isNaN(v)) {
    return { y: v.getFullYear(), m: v.getMonth() + 1, d: v.getDate() };
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); // M/D/YY (Excel US display)
  if (m) {
    const y = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
    return { y, m: Number(m[1]), d: Number(m[2]) };
  }
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/); // DD.MM.YYYY
  if (m) {
    const y = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
    return { y, m: Number(m[2]), d: Number(m[1]) };
  }
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
  return null;
};

const parseTime = (v) => {
  if (v == null || v === "") return { h: 0, min: 0 };
  if (typeof v === "number") {
    const totalMin = Math.round((v % 1) * 24 * 60);
    return { h: Math.floor(totalMin / 60) % 24, min: totalMin % 60 };
  }
  if (v instanceof Date && !isNaN(v)) return { h: v.getHours(), min: v.getMinutes() };
  const m = String(v).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!m) return { h: 0, min: 0 };
  let h = Number(m[1]);
  if (m[3]) {
    const pm = m[3].toUpperCase() === "PM";
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
  }
  return { h: h % 24, min: Number(m[2]) };
};

// Returns { amount, currency }. The USD column sometimes holds euro amounts
// typed as text ("200euro", "60 Euro", "200e") — those become EUR rows.
const parseMoney = (v, columnCurrency) => {
  if (v == null || v === "") return { amount: 0, currency: columnCurrency };
  if (typeof v === "number") {
    return { amount: Number.isFinite(v) ? v : 0, currency: columnCurrency };
  }
  const text = String(v).trim();
  const isEuro = /eur|€/i.test(text) || /\d\s*e$/i.test(text);
  const n = Number(text.replace(/[^\d.,-]/g, "").replace(/,/g, ""));
  return {
    amount: Number.isFinite(n) ? n : 0,
    currency: isEuro ? "EUR" : columnCurrency,
  };
};

// cyrb53 — small, fast non-crypto hash (crypto.subtle is unavailable on plain-http hosts)
const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
};

const hashKey = (s) => `xl-${cyrb53(s, 1)}${cyrb53(s, 7)}`;

// Collapse spelling variants ("Oguztravel" / "Oguz Travel" / "OGUZ TRAVEL")
// to the most frequently used spelling.
const canonicalizer = (values) => {
  const groups = new Map();
  for (const v of values) {
    if (!v) continue;
    const k = v.toLowerCase().replace(/\s+/g, "");
    if (!groups.has(k)) groups.set(k, new Map());
    const g = groups.get(k);
    g.set(v, (g.get(v) || 0) + 1);
  }
  const best = new Map();
  for (const [k, g] of groups) {
    best.set(k, [...g.entries()].sort((a, b) => b[1] - a[1])[0][0]);
  }
  return (v) => (v ? best.get(v.toLowerCase().replace(/\s+/g, "")) || v : null);
};

const findHeader = (rows) => {
  for (let i = 0; i < Math.min(rows.length, 60); i++) {
    const cells = (rows[i] || []).map(norm);
    if (cells.includes("SENE") && cells.some((c) => c === "AÇYKLAMA" || c === "ACYKLAMA")) {
      const cols = {};
      for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
        const idx = cells.findIndex((c) => aliases.includes(c));
        if (idx >= 0) cols[field] = idx;
      }
      return { index: i, cols };
    }
  }
  return null;
};

/**
 * @param {ArrayBuffer} buffer  file contents
 * @returns {Promise<{ rows, sheets, skipped, totals, dateFrom, dateTo, categories }>}
 */
export async function parseKassaExcel(buffer) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buffer, { type: "array" });

  const raw = [];
  const sheets = [];
  const skipped = [];

  for (const sheetName of wb.SheetNames) {
    const kind = SHEET_KINDS.find((k) => k.match.test(norm(sheetName)));
    if (!kind) continue;

    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
      header: 1,
      defval: null,
      raw: true,
    });
    const header = findHeader(rows);
    if (!header) {
      sheets.push({ name: sheetName, type: kind.type, count: 0, error: "header" });
      continue;
    }
    const { cols } = header;
    let count = 0;

    for (let r = header.index + 1; r < rows.length; r++) {
      const row = rows[r] || [];
      const hasContent = row.some((v) => v != null && String(v).trim() !== "");
      if (!hasContent) continue;

      const date = parseDate(row[cols.date]);
      const money = [parseMoney(row[cols.usd], "USD"), parseMoney(row[cols.tmt], "TMT")];
      const hasAmount = money.some((m) => m.amount !== 0);

      if (!date) {
        // Footer "Total" rows have amounts but no date — not a transaction.
        if (hasAmount) skipped.push({ sheet: sheetName, row: r + 1, reason: "noDate" });
        continue;
      }
      if (!hasAmount) {
        skipped.push({ sheet: sheetName, row: r + 1, reason: "noAmount" });
        continue;
      }

      const { h, min } = parseTime(row[cols.time]);
      const base = {
        type: kind.type,
        datetime: new Date(date.y, date.m - 1, date.d, h, min).toISOString(),
        dateKey: `${date.y}-${pad(date.m)}-${pad(date.d)} ${pad(h)}:${pad(min)}`,
        giver: clean(row[cols.giver]),
        receiver: clean(row[cols.receiver]),
        description: clean(row[cols.description]),
        company: clean(row[cols.company]),
        category_name: clean(row[cols.category]),
      };

      for (const { currency, amount } of money) {
        if (amount > 0) raw.push({ ...base, currency, amount: Math.round(amount * 100) / 100 });
        else if (amount < 0) skipped.push({ sheet: sheetName, row: r + 1, reason: "negative" });
      }
      count++;
    }
    sheets.push({ name: sheetName, type: kind.type, count });
  }

  const canonCategory = canonicalizer(raw.map((r) => r.category_name));
  const canonCompany = canonicalizer(raw.map((r) => r.company));

  // Identical rows can legitimately repeat (two equal payments in one minute),
  // so the key includes the occurrence number of that exact content.
  const occurrences = new Map();
  const rows = raw.map((r) => {
    const content = [
      r.type, r.dateKey, r.currency, r.amount.toFixed(2),
      r.giver || "", r.receiver || "", r.description || "",
    ].join("|").toLowerCase();
    const n = (occurrences.get(content) || 0) + 1;
    occurrences.set(content, n);

    const rest = { ...r };
    delete rest.dateKey;
    return {
      ...rest,
      category_name: canonCategory(r.category_name),
      company: canonCompany(r.company),
      import_key: hashKey(`${content}#${n}`),
    };
  });

  const totals = {};
  let dateFrom = null;
  let dateTo = null;
  for (const r of rows) {
    const t = (totals[r.currency] ||= { INCOME: 0, EXPENSE: 0, count: 0 });
    t[r.type] += r.amount;
    t.count++;
    if (!dateFrom || r.datetime < dateFrom) dateFrom = r.datetime;
    if (!dateTo || r.datetime > dateTo) dateTo = r.datetime;
  }

  const categories = [...new Set(rows.map((r) => r.category_name).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "tr"),
  );

  return { rows, sheets, skipped, totals, dateFrom, dateTo, categories };
}
