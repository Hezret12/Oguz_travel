import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Paper,
  Tooltip,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import ViewColumnRoundedIcon from "@mui/icons-material/ViewColumnRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
import { createNewCell } from "./constants";
import { useLocale } from "../../../hooks/useLocale";

const DynamicTable = ({ table, tableIndex, onUpdate }) => {
  const { t } = useLocale();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeCellCoord, setActiveCellCoord] = useState(null); // { r: rowIndex, c: colIndex }

  const rows = table.rows || [];

  const headerRowCount = useMemo(() => {
    if (!rows || rows.length === 0) return 1;
    let maxSpan = 1;
    (rows[0] || []).forEach((c) => {
      if (c && c.rowSpan && c.rowSpan > maxSpan) {
        maxSpan = c.rowSpan;
      }
    });
    return maxSpan;
  }, [rows]);

  const handleOpenMenu = (event, r, c) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setActiveCellCoord({ r, c });
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setActiveCellCoord(null);
  };

  const handleCellTextChange = (rIdx, cIdx, val) => {
    const newRows = rows.map((row, r) =>
      row.map((cell, c) => {
        if (r === rIdx && c === cIdx) {
          return { ...cell, text: val };
        }
        return cell;
      })
    );
    onUpdate({ ...table, rows: newRows });
  };

  // Row reorder handlers
  const handleMoveRowUp = (rIdx) => {
    if (rIdx <= 1) return;
    const newRows = [...rows];
    [newRows[rIdx - 1], newRows[rIdx]] = [newRows[rIdx], newRows[rIdx - 1]];
    onUpdate({ ...table, rows: newRows });
  };

  const handleMoveRowDown = (rIdx) => {
    if (rIdx === 0 || rIdx >= rows.length - 1) return;
    const newRows = [...rows];
    [newRows[rIdx], newRows[rIdx + 1]] = [newRows[rIdx + 1], newRows[rIdx]];
    onUpdate({ ...table, rows: newRows });
  };

  // Column reorder handlers
  const handleMoveColumnLeft = () => {
    if (!activeCellCoord) return;
    const { c } = activeCellCoord;
    handleCloseMenu();
    if (c <= 1) return;
    const newRows = rows.map((row) => {
      const newRow = [...row];
      [newRow[c - 1], newRow[c]] = [newRow[c], newRow[c - 1]];
      return newRow;
    });
    onUpdate({ ...table, rows: newRows });
  };

  const handleMoveColumnRight = () => {
    if (!activeCellCoord) return;
    const { c } = activeCellCoord;
    handleCloseMenu();
    if (c === 0 || c >= (rows[0]?.length || 1) - 1) return;
    const newRows = rows.map((row) => {
      const newRow = [...row];
      [newRow[c], newRow[c + 1]] = [newRow[c + 1], newRow[c]];
      return newRow;
    });
    onUpdate({ ...table, rows: newRows });
  };

  const handleAddRow = () => {
    const totalCols = rows[0]?.length || 3;
    const newRow = Array.from({ length: totalCols }, () => createNewCell());
    onUpdate({ ...table, rows: [...rows, newRow] });
  };

  const handleAddColumn = () => {
    const newRows = rows.map((row) => [...row, createNewCell()]);
    onUpdate({ ...table, rows: newRows });
  };

  const handleDeleteRow = () => {
    if (!activeCellCoord) return;
    const { r } = activeCellCoord;
    handleCloseMenu();
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, idx) => idx !== r);
    onUpdate({ ...table, rows: newRows });
  };

  const handleDeleteColumn = () => {
    if (!activeCellCoord) return;
    const { c } = activeCellCoord;
    handleCloseMenu();
    if (c === 0) return;
    if ((rows[0]?.length || 0) <= 2) return;
    const newRows = rows.map((row) => row.filter((_, idx) => idx !== c));
    onUpdate({ ...table, rows: newRows });
  };

  const handleMergeRight = () => {
    if (!activeCellCoord) return;
    const { r, c } = activeCellCoord;
    handleCloseMenu();
    if (c === 0) return;

    const currentCell = rows[r]?.[c];
    if (!currentCell) return;

    const targetColIdx = c + (currentCell.colSpan || 1);
    if (targetColIdx >= rows[r].length) return;

    const targetCell = rows[r][targetColIdx];
    if (!targetCell) return;

    const combinedText = [currentCell.text, targetCell.text].filter(Boolean).join(" ");

    const newRows = rows.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === r && cIdx === c) {
          return {
            ...cell,
            text: combinedText,
            colSpan: (cell.colSpan || 1) + (targetCell.colSpan || 1),
          };
        }
        if (rIdx === r && cIdx === targetColIdx) {
          return {
            ...cell,
            isMerged: true,
          };
        }
        return cell;
      })
    );

    onUpdate({ ...table, rows: newRows });
  };

  const handleMergeDown = () => {
    if (!activeCellCoord) return;
    const { r, c } = activeCellCoord;
    handleCloseMenu();
    if (c === 0) return;

    const currentCell = rows[r]?.[c];
    if (!currentCell) return;

    const targetRowIdx = r + (currentCell.rowSpan || 1);
    if (targetRowIdx >= rows.length) return;

    const targetCell = rows[targetRowIdx]?.[c];
    if (!targetCell) return;

    const combinedText = [currentCell.text, targetCell.text].filter(Boolean).join(" ");

    const newRows = rows.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === r && cIdx === c) {
          return {
            ...cell,
            text: combinedText,
            rowSpan: (cell.rowSpan || 1) + (targetCell.rowSpan || 1),
          };
        }
        if (rIdx === targetRowIdx && cIdx === c) {
          return {
            ...cell,
            isMerged: true,
          };
        }
        return cell;
      })
    );

    onUpdate({ ...table, rows: newRows });
  };

  const handleSplitCell = () => {
    if (!activeCellCoord) return;
    const { r, c } = activeCellCoord;
    handleCloseMenu();
    if (c === 0) return;

    const cell = rows[r]?.[c];
    if (!cell) return;

    const spanR = cell.rowSpan || 1;
    const spanC = cell.colSpan || 1;

    const newRows = rows.map((row, rIdx) =>
      row.map((cl, cIdx) => {
        if (rIdx >= r && rIdx < r + spanR && cIdx >= c && cIdx < c + spanC) {
          return {
            ...cl,
            isMerged: false,
            rowSpan: 1,
            colSpan: 1,
          };
        }
        return cl;
      })
    );

    onUpdate({ ...table, rows: newRows });
  };

  const handleSplitToSubColumns = () => {
    if (!activeCellCoord) return;
    const { r, c } = activeCellCoord;
    handleCloseMenu();
    if (c === 0 || r !== 0) return;

    const currentCell = rows[0]?.[c];
    if (!currentCell) return;

    // Check if table currently has 1-row header
    if (headerRowCount === 1) {
      // 1. Row 0:
      const newRow0 = [];
      for (let colIdx = 0; colIdx < rows[0].length; colIdx++) {
        if (colIdx === c) {
          newRow0.push({ ...rows[0][colIdx], colSpan: 2, rowSpan: 1 });
          newRow0.push({ ...createNewCell(""), isMerged: true });
        } else {
          newRow0.push({ ...rows[0][colIdx], rowSpan: 2, colSpan: rows[0][colIdx].colSpan || 1 });
        }
      }

      // 2. Row 1 (Sub-headers):
      const newRow1 = [];
      for (let colIdx = 0; colIdx < rows[0].length; colIdx++) {
        if (colIdx === c) {
          newRow1.push(createNewCell(""));
          newRow1.push(createNewCell(""));
        } else {
          newRow1.push({ ...createNewCell(""), isMerged: true });
        }
      }

      // 3. Data Rows (r >= 1): insert 1 empty cell at index c + 1
      const newDataRows = [];
      for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
        const oldRow = rows[rowIdx];
        const newRow = [];
        for (let colIdx = 0; colIdx < oldRow.length; colIdx++) {
          newRow.push(oldRow[colIdx]);
          if (colIdx === c) {
            newRow.push(createNewCell(""));
          }
        }
        newDataRows.push(newRow);
      }

      onUpdate({ ...table, rows: [newRow0, newRow1, ...newDataRows] });
    } else {
      // Table already has 2-row header:
      const newRows = rows.map((row, rowIdx) => {
        const newRow = [];
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          if (rowIdx === 0 && colIdx === c) {
            newRow.push({ ...row[colIdx], colSpan: 2, rowSpan: 1 });
            newRow.push({ ...createNewCell(""), isMerged: true });
          } else if (rowIdx === 1 && colIdx === c) {
            newRow.push(createNewCell(""));
            newRow.push(createNewCell(""));
          } else {
            newRow.push(row[colIdx]);
            if (rowIdx >= 2 && colIdx === c) {
              newRow.push(createNewCell(""));
            }
          }
        }
        return newRow;
      });

      onUpdate({ ...table, rows: newRows });
    }
  };

  const currentActiveCell = activeCellCoord
    ? rows[activeCellCoord.r]?.[activeCellCoord.c]
    : null;
  const canSplit =
    currentActiveCell &&
    ((currentActiveCell.colSpan && currentActiveCell.colSpan > 1) ||
      (currentActiveCell.rowSpan && currentActiveCell.rowSpan > 1));

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      {/* Table Title and Actions Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box sx={{ flex: 1, minWidth: "260px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.88rem" }}>
              {t("visaDocument.tableTitle", { number: tableIndex + 1 })} *
            </Typography>
            <Tooltip title={t("visaDocument.tableTitleHelper")} placement="top" arrow>
              <HelpOutlineRoundedIcon
                sx={{
                  fontSize: 15,
                  color: "text.secondary",
                  cursor: "pointer",
                  opacity: 0.65,
                  "&:hover": { opacity: 1, color: "primary.main" },
                }}
              />
            </Tooltip>
          </Box>
          <TextField
            fullWidth
            value={table.title ?? (tableIndex === 0 ? "Gerekli resminamalar" : "Wizaň bahalary we möhletleri")}
            onChange={(e) => onUpdate({ ...table, title: e.target.value })}
            placeholder={t("visaDocument.tableTitlePlaceholder", { number: tableIndex + 1 })}
            slotProps={{
              input: {
                sx: {
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  minHeight: "44px",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
                },
              },
            }}
          />
        </Box>

        {/* Add Row / Add Column Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Button
            variant="outlined"
            onClick={handleAddRow}
            startIcon={<TableRowsRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "divider",
              color: "text.primary",
              fontWeight: 600,
              fontSize: "0.88rem",
              px: 2,
              py: 0.75,
              minHeight: "44px",
              "&:hover": {
                borderColor: "text.primary",
                backgroundColor: "action.hover",
              },
            }}
          >
            {t("visaDocument.addRow")}
          </Button>

          <Button
            variant="outlined"
            onClick={handleAddColumn}
            startIcon={<ViewColumnRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "divider",
              color: "text.primary",
              fontWeight: 600,
              fontSize: "0.88rem",
              px: 2,
              py: 0.75,
              minHeight: "44px",
              "&:hover": {
                borderColor: "text.primary",
                backgroundColor: "action.hover",
              },
            }}
          >
            {t("visaDocument.addColumn")}
          </Button>
        </Box>
      </Box>

      {/* Table Grid Container */}
      <Box
        sx={{
          overflowX: "auto",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "480px",
            tableLayout: "fixed",
          }}
        >
          <tbody>
            {rows.map((row, rIdx) => {
              const isHeaderRow = rIdx < headerRowCount;
              const dataRowNumber = rIdx >= headerRowCount ? rIdx - headerRowCount + 1 : 0;

              return (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => {
                    const isOrderCol = cIdx === 0;

                    if (isOrderCol) {
                      if (rIdx > 0 && rIdx < headerRowCount) return null;
                    } else if (cell.isMerged) {
                      return null;
                    }

                    const cellRowSpan = isOrderCol && isHeaderRow ? headerRowCount : cell.rowSpan || 1;
                    const cellColSpan = isOrderCol ? 1 : cell.colSpan || 1;

                    return (
                      <Box
                        component="td"
                        key={cell.id || `${rIdx}-${cIdx}`}
                        colSpan={cellColSpan}
                        rowSpan={cellRowSpan}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          p: 0,
                          position: "relative",
                          minHeight: "46px",
                          ...(isOrderCol && {
                            width: "52px",
                            minWidth: "52px",
                            maxWidth: "52px",
                            textAlign: "center",
                          }),
                          backgroundColor: (theme) => {
                            if (isOrderCol) {
                              return theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.03)"
                                : "#f8fafc";
                            }
                            if (isHeaderRow) {
                              return theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "#f1f5f9";
                            }
                            return "transparent";
                          },
                          "&:hover .cell-menu-btn": {
                            opacity: isOrderCol ? 0 : 1,
                            visibility: isOrderCol ? "hidden" : "visible",
                          },
                        }}
                      >
                        {isOrderCol ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: "46px",
                              px: 0.5,
                              py: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isHeaderRow ? 700 : 500,
                                fontSize: isHeaderRow ? "0.85rem" : "0.9rem",
                                color: isHeaderRow ? "text.secondary" : "text.primary",
                                userSelect: "none",
                              }}
                            >
                              {isHeaderRow ? "№" : dataRowNumber}
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              minHeight: "46px",
                              position: "relative",
                            }}
                          >
                            <TextField
                              fullWidth
                              variant="standard"
                              multiline
                              value={cell.text || ""}
                              onChange={(e) => handleCellTextChange(rIdx, cIdx, e.target.value)}
                              placeholder={
                                isHeaderRow
                                  ? rIdx === 0
                                    ? t("visaDocument.columnNamePlaceholder")
                                    : t("visaDocument.subColumnPlaceholder")
                                  : t("visaDocument.cellPlaceholder")
                              }
                              slotProps={{
                                input: {
                                  disableUnderline: true,
                                  sx: {
                                    px: 1.5,
                                    py: 1,
                                    fontSize: "0.92rem",
                                    fontWeight: isHeaderRow ? 600 : 400,
                                    color: "text.primary",
                                    lineHeight: 1.45,
                                  },
                                },
                              }}
                            />

                            {/* Cell 3-dots actions button */}
                            <IconButton
                              className="cell-menu-btn"
                              size="small"
                              onClick={(e) => handleOpenMenu(e, rIdx, cIdx)}
                              sx={{
                                position: "absolute",
                                right: 4,
                                top: "50%",
                                transform: "translateY(-50%)",
                                opacity: 0,
                                visibility: "hidden",
                                transition: "opacity 0.15s ease",
                                p: 0.4,
                                bgcolor: "background.paper",
                                border: "1px solid",
                                borderColor: "divider",
                                color: "text.secondary",
                                borderRadius: "4px",
                              }}
                            >
                              <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Box>
      </Box>

      {/* Table Note Area */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.88rem" }}>
            {t("visaDocument.tableNote")}
          </Typography>
          <Tooltip title={t("visaDocument.tableNoteHelper")} placement="top" arrow>
            <HelpOutlineRoundedIcon
              sx={{
                fontSize: 15,
                color: "text.secondary",
                cursor: "pointer",
                opacity: 0.65,
                "&:hover": { opacity: 1, color: "primary.main" },
              }}
            />
          </Tooltip>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={table.note || ""}
          onChange={(e) => onUpdate({ ...table, note: e.target.value })}
          placeholder={t("visaDocument.tableNotePlaceholder")}
          slotProps={{
            input: {
              sx: {
                borderRadius: "8px",
                fontSize: "0.92rem",
                p: 1.5,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
              },
            },
          }}
        />
      </Box>

      {/* Context Menu for Cell Actions */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "divider",
              minWidth: "190px",
              py: 0.5,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 0.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.72rem" }}>
            {t("visaDocument.cellActions")}
          </Typography>
        </Box>

        {/* Split into 2 Sub-columns action for header cells */}
        {activeCellCoord && activeCellCoord.r === 0 && activeCellCoord.c > 0 && (
          <MenuItem
            onClick={handleSplitToSubColumns}
            sx={{
              py: 0.8,
              fontSize: "0.85rem",
              color: "primary.main",
              fontWeight: 600,
            }}
          >
            <ListItemIcon sx={{ minWidth: 28, color: "primary.main" }}>
              <CallSplitRoundedIcon sx={{ fontSize: 17 }} />
            </ListItemIcon>
            <ListItemText
              primary={t("visaDocument.splitTo2SubColumns")}
              slotProps={{ primary: { fontSize: "0.85rem", fontWeight: 600 } }}
            />
          </MenuItem>
        )}

        <MenuItem onClick={handleMergeRight} sx={{ py: 0.8, fontSize: "0.85rem" }}>
          <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
            <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
          </ListItemIcon>
          <ListItemText primary={t("visaDocument.mergeRight")} slotProps={{ primary: { fontSize: "0.85rem" } }} />
        </MenuItem>

        <MenuItem onClick={handleMergeDown} sx={{ py: 0.8, fontSize: "0.85rem" }}>
          <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
            <ArrowDownwardRoundedIcon sx={{ fontSize: 17 }} />
          </ListItemIcon>
          <ListItemText primary={t("visaDocument.mergeDown")} slotProps={{ primary: { fontSize: "0.85rem" } }} />
        </MenuItem>

        {canSplit && (
          <MenuItem onClick={handleSplitCell} sx={{ py: 0.8, fontSize: "0.85rem" }}>
            <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
              <ContentCutRoundedIcon sx={{ fontSize: 17 }} />
            </ListItemIcon>
            <ListItemText primary={t("visaDocument.splitCell")} slotProps={{ primary: { fontSize: "0.85rem" } }} />
          </MenuItem>
        )}

        {/* Column & Row Reorder Actions */}
        {activeCellCoord && activeCellCoord.c > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ px: 2, py: 0.5 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.72rem" }}>
                {t("visaDocument.reorder")}
              </Typography>
            </Box>

            {activeCellCoord.c > 1 && (
              <MenuItem onClick={handleMoveColumnLeft} sx={{ py: 0.8, fontSize: "0.85rem" }}>
                <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                  <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText primary={t("visaDocument.moveColLeft")} slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </MenuItem>
            )}

            {activeCellCoord.c < (rows[0]?.length || 1) - 1 && (
              <MenuItem onClick={handleMoveColumnRight} sx={{ py: 0.8, fontSize: "0.85rem" }}>
                <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                  <KeyboardArrowRightRoundedIcon sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText primary={t("visaDocument.moveColRight")} slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </MenuItem>
            )}

            {activeCellCoord.r > 0 && activeCellCoord.r > 1 && (
              <MenuItem
                onClick={() => {
                  const r = activeCellCoord.r;
                  handleCloseMenu();
                  handleMoveRowUp(r);
                }}
                sx={{ py: 0.8, fontSize: "0.85rem" }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                  <KeyboardArrowUpRoundedIcon sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText primary={t("visaDocument.moveRowUp")} slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </MenuItem>
            )}

            {activeCellCoord.r > 0 && activeCellCoord.r < rows.length - 1 && (
              <MenuItem
                onClick={() => {
                  const r = activeCellCoord.r;
                  handleCloseMenu();
                  handleMoveRowDown(r);
                }}
                sx={{ py: 0.8, fontSize: "0.85rem" }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText primary={t("visaDocument.moveRowDown")} slotProps={{ primary: { fontSize: "0.85rem" } }} />
              </MenuItem>
            )}
          </>
        )}

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleDeleteRow} sx={{ py: 0.8, color: "error.main" }}>
          <ListItemIcon sx={{ minWidth: 28, color: "error.main" }}>
            <TableRowsRoundedIcon sx={{ fontSize: 17 }} />
          </ListItemIcon>
          <ListItemText primary={t("visaDocument.deleteRow")} slotProps={{ primary: { fontSize: "0.85rem", fontWeight: 500 } }} />
        </MenuItem>

        <MenuItem onClick={handleDeleteColumn} sx={{ py: 0.8, color: "error.main" }}>
          <ListItemIcon sx={{ minWidth: 28, color: "error.main" }}>
            <ViewColumnRoundedIcon sx={{ fontSize: 17 }} />
          </ListItemIcon>
          <ListItemText primary={t("visaDocument.deleteColumn")} slotProps={{ primary: { fontSize: "0.85rem", fontWeight: 500 } }} />
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default DynamicTable;
