export const createNewCell = (text = "", colSpan = 1, rowSpan = 1) => ({
  id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  text,
  colSpan,
  rowSpan,
  isMerged: false,
});

export const createNewTable = (tableIndex = 1, customTitle = "") => ({
  id: `tbl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: customTitle || `TABLISA ${tableIndex}`,
  rows: [
    [createNewCell(), createNewCell(), createNewCell()],
    [createNewCell(), createNewCell(), createNewCell()],
  ],
  note: "",
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

export const DEFAULT_SAMPLE_DOCUMENTS = [
  {
    id: "doc-sample-1",
    title: "Täze wiza dokumenti",
    country: "Ýurt",
    tables: [
      {
        id: "tbl-1",
        title: "TABLISA 1: GEREKLI RESMİNAMALAR",
        rows: [
          [
            { id: "c-1-1", text: "T/b", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-1-2", text: "Resminamanyň ady", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-1-3", text: "Düşündiriş", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
          [
            { id: "c-2-1", text: "1", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-2-2", text: "Zagranpasport (Asyl nusgasy)", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-2-3", text: "Möhleti 6 aýdan az bolmadyk", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
          [
            { id: "c-3-1", text: "2", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-3-2", text: "Surat (3.5x4.5)", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-3-3", text: "Ak fonda 2 sany", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
        ],
        note: "Ähli resminamalaryň asyl nusgalary we nusgalary tabşyrylýar.",
      },
      {
        id: "tbl-2",
        title: "TABLISA 2: WIZANYŇ BAHALARY",
        rows: [
          [
            { id: "c-4-1", text: "Wiza görnüşi", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-4-2", text: "Giriş", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-4-3", text: "Möhleti", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-4-4", text: "Bahasy", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
          [
            { id: "c-5-1", text: "Turist wiza", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-5-2", text: "1 gezeklik", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-5-3", text: "30 gün", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-5-4", text: "150 USD", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
        ],
        note: "Konsullyk tölegi girmeýär.",
      },
    ],
    generalNote: "Bu ýere umumy bellik ýazyň...",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc-sample-2",
    title: "HYTAÝ (TURIST, BIZNES WE TALYP) VISA",
    country: "Hytaý",
    tables: [
      {
        id: "tbl-2-1",
        title: "TABLISA 1: GEREKLI RESMİNAMALAR",
        rows: [
          [
            { id: "c-21-1", text: "Wiza görnüşi", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-21-2", text: "Resminamalar", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-21-3", text: "Bellik", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
          [
            { id: "c-22-1", text: "L (Turist) Wiza", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-22-2", text: "Pasport, Surat, Myhmanhana bron", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-22-3", text: "Asyl nusgasy", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
        ],
        note: "Ähli resminamalaryň iňlis ýa-da hytaý dilinde terjimesi bolmaly.",
      },
      {
        id: "tbl-2-2",
        title: "TABLISA 2: BAHALAR",
        rows: [
          [
            { id: "c-23-1", text: "Wiza görnüşi", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-23-2", text: "Giriş sany", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-23-3", text: "Bahasy", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
          [
            { id: "c-24-1", text: "L (Turist)", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-24-2", text: "1 gezeklik", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-24-3", text: "150 USD", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
          [
            { id: "c-25-1", text: "M (Biznes)", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-25-2", text: "Köp gezeklik (Multi)", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-25-3", text: "250 USD", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
        ],
        note: "Talyp çakylygy we JW201/JW202 blankasy asyl nusgada berilmeli.",
      },
    ],
    generalNote: "Konsullyk tölegleri bahalara goşulan däldir.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc-sample-3",
    title: "ROSSIÝA VISA",
    country: "Rossiýa Federasiýasy",
    tables: [
      {
        id: "tbl-3-1",
        title: "TABLISA 1: BAHALAR",
        rows: [
          [
            { id: "c-31-1", text: "Görnüşi", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-31-2", text: "Garaşylýan wagt", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-31-3", text: "Baha", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
          [
            { id: "c-32-1", text: "Gumanitar / Hususy", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-32-2", text: "7-10 iş güni", colSpan: 1, rowSpan: 1, isMerged: false },
            { id: "c-32-3", text: "80 USD", colSpan: 1, rowSpan: 1, isMerged: false },
          ],
        ],
        note: "",
      },
    ],
    generalNote: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc-sample-4",
    title: "INDONEZIÝA VISA (BALI)",
    country: "Indoneziýa",
    tables: [],
    generalNote: "E-Visa (B211A) onlaýn resmileşdirilýär.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc-sample-5",
    title: "ÖZBEGISTAN VISA",
    country: "Özbegistan",
    tables: [],
    generalNote: "",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc-sample-6",
    title: "TÄJIGISTAN TURIST (SYÝAHAT) VISA",
    country: "Täjigistan",
    tables: [],
    generalNote: "",
    updatedAt: new Date().toISOString(),
  },
];
