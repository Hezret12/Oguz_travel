export const createNewCell = (text = "", colSpan = 1, rowSpan = 1) => ({
  id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  text,
  colSpan,
  rowSpan,
  isMerged: false,
});

export const createDocumentsTable = () => ({
  id: `tbl-docs-${Date.now()}`,
  title: "Gerekli resminamalar",
  rows: [
    [
      createNewCell("№"),
      createNewCell(""),
      createNewCell(""),
    ],
    [
      createNewCell(""),
      createNewCell(""),
      createNewCell(""),
    ],
  ],
  note: "",
});

export const createPricesTable = () => ({
  id: `tbl-prices-${Date.now() + 1}`,
  title: "Wizaň bahalary we möhletleri",
  rows: [
    [
      createNewCell("№"),
      createNewCell(""),
      createNewCell(""),
    ],
    [
      createNewCell(""),
      createNewCell(""),
      createNewCell(""),
    ],
  ],
  note: "",
});

export const createNewDocument = () => ({
  id: `doc-${Date.now()}`,
  title: "",
  country: "",
  tables: [createDocumentsTable(), createPricesTable()],
  generalNote: "",
  updatedAt: new Date().toISOString(),
});

// Serialization: Frontend 2D Array Matrix -> Backend TableDataDto format
export const serializeTableToBackend = (table, orderIndex = 0) => {
  const tableRows = table.rows || [];
  const maxCols = tableRows.reduce((max, r) => Math.max(max, (r || []).length), 0);

  const columns = Array.from({ length: maxCols }, (_, i) => ({
    id: `col_${i + 1}`,
    name: tableRows[0]?.[i]?.text || `Sütün ${i + 1}`,
    width: 200,
  }));

  const rows = tableRows.map((row, rIdx) => {
    const cells = {};
    (row || []).forEach((cell, cIdx) => {
      const colId = `col_${cIdx + 1}`;
      cells[colId] = {
        value: cell.text ?? "",
        rowSpan: Number(cell.rowSpan || 1),
        colSpan: Number(cell.colSpan || 1),
      };
    });
    return {
      id: `row_${rIdx + 1}`,
      cells,
    };
  });

  return {
    guid: table.guid || (table.id && !table.id.startsWith("tbl-") ? table.id : undefined),
    title: table.title || `TABLISA ${orderIndex + 1}`,
    orderIndex,
    data: {
      columns,
      rows,
    },
    note: table.note || "",
  };
};

export const serializeDocumentToBackend = (doc) => {
  const isExistingGuid = doc.guid || (doc.id && !doc.id.startsWith("doc-"));
  return {
    ...(isExistingGuid ? { guid: doc.guid || doc.id } : {}),
    title: doc.title || "Wiza resminamasy",
    country: doc.country || "",
    docDetails: (doc.tables || []).map((t, idx) => serializeTableToBackend(t, idx)),
  };
};

// Deserialization: Backend TableDataDto -> Frontend 2D Array Matrix format
export const deserializeBackendToDocument = (serverDoc) => {
  if (!serverDoc) return createNewDocument();

  const docGuid = serverDoc.guid || serverDoc.id;
  const docDetails = serverDoc.docDetails || [];

  const tables = docDetails.map((detail, dIdx) => {
    const tableGuid = detail.guid;
    const tableTitle = detail.title || `TABLISA ${dIdx + 1}`;
    const tableNote = detail.note || "";
    const rawData = detail.data || {};
    const columns = rawData.columns || [];
    const rows = rawData.rows || [];

    let matrixRows = [];
    if (Array.isArray(rows) && rows.length > 0) {
      matrixRows = rows.map((r, rIdx) => {
        if (Array.isArray(r)) {
          return r.map((c, cIdx) => ({
            id: c.id || `c-${rIdx}-${cIdx}`,
            text: c.value ?? c.text ?? "",
            colSpan: Number(c.colSpan || 1),
            rowSpan: Number(c.rowSpan || 1),
            isMerged: false,
          }));
        }

        const cellsObj = r.cells || {};
        if (columns.length > 0) {
          return columns.map((col, cIdx) => {
            const cellData = cellsObj[col.id] || { value: "", rowSpan: 1, colSpan: 1 };
            return {
              id: `c-${r.id || rIdx}-${col.id || cIdx}`,
              text: cellData.value ?? "",
              colSpan: Number(cellData.colSpan || 1),
              rowSpan: Number(cellData.rowSpan || 1),
              isMerged: false,
            };
          });
        }

        return Object.keys(cellsObj).map((key, cIdx) => {
          const cellData = cellsObj[key] || {};
          return {
            id: `c-${rIdx}-${cIdx}`,
            text: cellData.value ?? "",
            colSpan: Number(cellData.colSpan || 1),
            rowSpan: Number(cellData.rowSpan || 1),
            isMerged: false,
          };
        });
      });
    }

    if (matrixRows.length === 0) {
      matrixRows = dIdx === 0 ? createDocumentsTable().rows : createPricesTable().rows;
    }

    return {
      id: tableGuid || `tbl-${dIdx}-${Date.now()}`,
      guid: tableGuid,
      title: tableTitle,
      rows: matrixRows,
      note: tableNote,
    };
  });

  return {
    id: docGuid,
    guid: docGuid,
    title: serverDoc.title || "",
    country: serverDoc.country || "",
    tables: tables.length > 0 ? tables : [createDocumentsTable(), createPricesTable()],
    updatedAt: serverDoc.updatedAt || new Date().toISOString(),
  };
};
