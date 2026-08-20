export const createNewCell = (text = "", colSpan = 1, rowSpan = 1) => ({
  id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  text,
  colSpan,
  rowSpan,
  isMerged: false,
});

export const createDocumentsTable = () => ({
  id: `tbl-docs-${Date.now()}`,
  title: "TABLISA 1: GEREKLI RESMİNAMALAR",
  rows: [
    [
      createNewCell("T/b"),
      createNewCell("Resminamanyň ady"),
      createNewCell("Düşündiriş / Format"),
    ],
    [
      createNewCell("1"),
      createNewCell("Zagranpasport (Asyl nusgasy)"),
      createNewCell("Möhleti iň az 6 aý bolmaly"),
    ],
    [
      createNewCell("2"),
      createNewCell("Surat (3.5 x 4.5)"),
      createNewCell("Ak fonda, 2 sany täze düşülen"),
    ],
    [
      createNewCell("3"),
      createNewCell("Wiza anketi"),
      createNewCell("Doly we dogry doldurylan"),
    ],
  ],
  note: "Ähli resminamalar doly we talaplara laýyk bolmaly.",
});

export const createPricesTable = () => ({
  id: `tbl-prices-${Date.now() + 1}`,
  title: "TABLISA 2: WIZANYŇ BAHALARY WE MÖHLETLERI",
  rows: [
    [
      createNewCell("Wizanyň görnüşi"),
      createNewCell("Giriş sany"),
      createNewCell("Garaşylýan wagt"),
      createNewCell("Bahasy"),
    ],
    [
      createNewCell("Syýahatçylyk (Turist)"),
      createNewCell("1 gezeklik (Single)"),
      createNewCell("7 - 10 iş güni"),
      createNewCell("120 USD"),
    ],
    [
      createNewCell("Işewürlik (Biznes)"),
      createNewCell("Köp gezeklik (Multi)"),
      createNewCell("5 - 7 iş güni"),
      createNewCell("250 USD"),
    ],
  ],
  note: "Konsullyk tölegleri we goşmaça hyzmatlar hasaba goşulan däldir.",
});

export const createNewDocument = () => ({
  id: `doc-${Date.now()}`,
  title: "Täze wiza dokumenti",
  country: "",
  tables: [createDocumentsTable(), createPricesTable()],
  generalNote: "",
  updatedAt: new Date().toISOString(),
});
