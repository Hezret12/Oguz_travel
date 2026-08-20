import { useState } from "react";
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
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ViewColumnRoundedIcon from "@mui/icons-material/ViewColumnRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import { createNewCell } from "./constants";

const DynamicTable = ({ table, tableIndex, onUpdate }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeCellCoord, setActiveCellCoord] = useState(null); // { r: rowIndex, c: colIndex }

  const rows = table.rows || [];

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
    if (rIdx <= 1) return; // Can't move header (0) or first data row (1) up
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
    // Can't move № col (0) or first data col (1) left
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
    // Can't move № col (0) or last col right
    if (c === 0 || c >= (rows[0]?.length || 1) - 1) return;
    const newRows = rows.map((row) => {
      const newRow = [...row];
      [newRow[c], newRow[c + 1]] = [newRow[c + 1], newRow[c]];
      return newRow;
    });
    onUpdate({ ...table, rows: newRows });
  };

  const handleAddRow = () => {
    const colCount = rows[0]?.length || 3;
    const newRow = Array.from({ length: colCount }, () => createNewCell());
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
    // Protect the fixed № column (index 0)
    if (c === 0) return;
    if ((rows[0]?.length || 0) <= 2) return; // Keep at least № + 1 data column
    const newRows = rows.map((row) => row.filter((_, idx) => idx !== c));
    onUpdate({ ...table, rows: newRows });
  };

  const handleMergeRight = () => {
    if (!activeCellCoord) return;
    const { r, c } = activeCellCoord;
    handleCloseMenu();
    // Protect the fixed № column
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
    // Protect the fixed № column
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
    // Protect the fixed № column
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
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        p: { xs: 2, sm: 3 },
        mb: 3,
        transition: "box-shadow 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      {/* Table Header: Title */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          value={table.title ?? `TABLISA ${tableIndex + 1}`}
          onChange={(e) => onUpdate({ ...table, title: e.target.value })}
          placeholder={`TABLISA ${tableIndex + 1}`}
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                fontWeight: 800,
                letterSpacing: "1px",
                color: "text.secondary",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                width: "100%",
                p: 0,
                "& input": {
                  p: 0,
                },
              },
            },
          }}
        />
      </Box>

      {/* Interactive Table Grid */}
      <Box
        sx={{
          overflowX: "auto",
          width: "100%",
          borderRadius: "10px",
          border: "1px solid",
          borderColor: "divider",
          mb: 2.5,
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
              // Track visible data row index for auto-increment (skip header row 0)
              let dataRowNumber = 0;
              if (rIdx > 0) {
                // Count visible (non-header) rows up to this index
                dataRowNumber = rIdx;
              }

              return (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => {
                    if (cell.isMerged) return null;

                    // First column (index 0) is the fixed "№" column
                    const isOrderCol = cIdx === 0;

                    return (
                      <Box
                        component="td"
                        key={cell.id || `${rIdx}-${cIdx}`}
                        colSpan={isOrderCol ? 1 : cell.colSpan || 1}
                        rowSpan={isOrderCol ? 1 : cell.rowSpan || 1}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          p: 0,
                          position: "relative",
                          minHeight: "44px",
                          // Fixed narrow width for № column
                          ...(isOrderCol && {
                            width: "56px",
                            minWidth: "56px",
                            maxWidth: "56px",
                            textAlign: "center",
                          }),
                          backgroundColor: (theme) => {
                            if (isOrderCol) {
                              return theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.04)"
                                : "#f1f5f9";
                            }
                            if (rIdx === 0 && rows.length > 1) {
                              return theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.03)"
                                : "#f8fafc";
                            }
                            return "transparent";
                          },
                          "&:hover .cell-menu-btn": {
                            opacity: isOrderCol ? 0 : 1,
                            visibility: isOrderCol ? "hidden" : "visible",
                          },
                          "&:focus-within .cell-menu-btn": {
                            opacity: isOrderCol ? 0 : 1,
                            visibility: isOrderCol ? "hidden" : "visible",
                          },
                        }}
                      >
                        {isOrderCol ? (
                          /* Fixed auto-increment № column */
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: "44px",
                              px: 0.5,
                              py: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: rIdx === 0 ? 700 : 500,
                                fontSize: rIdx === 0 ? "0.78rem" : "0.88rem",
                                color: rIdx === 0 ? "text.secondary" : "text.primary",
                                userSelect: "none",
                                letterSpacing: rIdx === 0 ? "0.5px" : 0,
                              }}
                            >
                              {rIdx === 0 ? "№" : dataRowNumber}
                            </Typography>
                          </Box>
                        ) : (
                          /* Normal editable cell */
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              minHeight: "44px",
                              position: "relative",
                            }}
                          >
                            <TextField
                              fullWidth
                              variant="standard"
                              multiline
                              value={cell.text || ""}
                              onChange={(e) => handleCellTextChange(rIdx, cIdx, e.target.value)}
                              placeholder="..."
                              slotProps={{
                                input: {
                                  disableUnderline: true,
                                  sx: {
                                    px: 1.5,
                                    py: 1,
                                    fontSize: "0.9rem",
                                    fontWeight: rIdx === 0 ? 600 : 400,
                                    color: "text.primary",
                                    lineHeight: 1.4,
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
                                transition: "all 0.15s ease",
                                p: 0.5,
                                bgcolor: "background.paper",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                                border: "1px solid",
                                borderColor: "divider",
                                color: "text.secondary",
                                "&:hover": {
                                  bgcolor: "action.hover",
                                  color: "text.primary",
                                },
                              }}
                            >
                              <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    );
                  })}

                  {/* Right-side reorder action column */}
                  <Box
                    component="td"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      p: 0,
                      width: "40px",
                      minWidth: "40px",
                      maxWidth: "40px",
                      textAlign: "center",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.02)"
                          : "#fafbfc",
                      "&:hover .reorder-btn": {
                        opacity: 1,
                      },
                    }}
                  >
                    {rIdx === 0 ? (
                      /* Empty header for action column */
                      <Box sx={{ minHeight: "44px" }} />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: "44px",
                          gap: 0,
                        }}
                      >
                        <IconButton
                          className="reorder-btn"
                          size="small"
                          disabled={rIdx <= 1}
                          onClick={() => handleMoveRowUp(rIdx)}
                          sx={{
                            p: 0.25,
                            opacity: 0,
                            transition: "opacity 0.15s ease",
                            color: rIdx <= 1 ? "action.disabled" : "text.secondary",
                            "&:hover": {
                              color: "primary.main",
                              bgcolor: "action.hover",
                            },
                          }}
                        >
                          <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          className="reorder-btn"
                          size="small"
                          disabled={rIdx >= rows.length - 1}
                          onClick={() => handleMoveRowDown(rIdx)}
                          sx={{
                            p: 0.25,
                            opacity: 0,
                            transition: "opacity 0.15s ease",
                            color: rIdx >= rows.length - 1 ? "action.disabled" : "text.secondary",
                            "&:hover": {
                              color: "primary.main",
                              bgcolor: "action.hover",
                            },
                          }}
                        >
                          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </tr>
              );
            })}
          </tbody>
        </Box>
      </Box>

      {/* Context Menu for Cell Actions */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        disablePortal
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              border: "1px solid",
              borderColor: "divider",
              minWidth: "180px",
              py: 0.5,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 0.75 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.72rem" }}>
            Cell hereketleri
          </Typography>
        </Box>

        <MenuItem onClick={handleMergeRight} sx={{ py: 1, fontSize: "0.86rem" }}>
          <ListItemIcon sx={{ minWidth: 30, color: "text.secondary" }}>
            <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Saga birikdir" slotProps={{ primary: { fontSize: "0.86rem", fontWeight: 500 } }} />
        </MenuItem>

        <MenuItem onClick={handleMergeDown} sx={{ py: 1, fontSize: "0.86rem" }}>
          <ListItemIcon sx={{ minWidth: 30, color: "text.secondary" }}>
            <ArrowDownwardRoundedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Aşakyna birikdir" slotProps={{ primary: { fontSize: "0.86rem", fontWeight: 500 } }} />
        </MenuItem>

        {canSplit && (
          <MenuItem onClick={handleSplitCell} sx={{ py: 1, fontSize: "0.86rem" }}>
            <ListItemIcon sx={{ minWidth: 30, color: "text.secondary" }}>
              <ContentCutRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Böl (split)" slotProps={{ primary: { fontSize: "0.86rem", fontWeight: 500 } }} />
          </MenuItem>
        )}

        {/* Column & Row Reorder Actions */}
        {activeCellCoord && activeCellCoord.c > 0 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ px: 2, py: 0.75 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.72rem" }}>
                Ýerini çalyş
              </Typography>
            </Box>

            {activeCellCoord.c > 1 && (
              <MenuItem onClick={handleMoveColumnLeft} sx={{ py: 1, fontSize: "0.86rem" }}>
                <ListItemIcon sx={{ minWidth: 30, color: "text.secondary" }}>
                  <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Sütüni çepe göçür" slotProps={{ primary: { fontSize: "0.86rem", fontWeight: 500 } }} />
              </MenuItem>
            )}

            {activeCellCoord.c < (rows[0]?.length || 1) - 1 && (
              <MenuItem onClick={handleMoveColumnRight} sx={{ py: 1, fontSize: "0.86rem" }}>
                <ListItemIcon sx={{ minWidth: 30, color: "text.secondary" }}>
                  <KeyboardArrowRightRoundedIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Sütüni saga göçür" slotProps={{ primary: { fontSize: "0.86rem", fontWeight: 500 } }} />
              </MenuItem>
            )}

            {activeCellCoord.r > 0 && activeCellCoord.r > 1 && (
              <MenuItem
                onClick={() => {
                  const r = activeCellCoord.r;
                  handleCloseMenu();
                  handleMoveRowUp(r);
                }}
                sx={{ py: 1, fontSize: "0.86rem" }}
              >
                <ListItemIcon sx={{ minWidth: 30, color: "text.secondary" }}>
                  <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Setiri ýokaryk göçür" slotProps={{ primary: { fontSize: "0.86rem", fontWeight: 500 } }} />
              </MenuItem>
            )}

            {activeCellCoord.r > 0 && activeCellCoord.r < rows.length - 1 && (
              <MenuItem
                onClick={() => {
                  const r = activeCellCoord.r;
                  handleCloseMenu();
                  handleMoveRowDown(r);
                }}
                sx={{ py: 1, fontSize: "0.86rem" }}
              >
                <ListItemIcon sx={{ minWidth: 30, color: "text.secondary" }}>
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary="Setiri aşak göçür" slotProps={{ primary: { fontSize: "0.86rem", fontWeight: 500 } }} />
              </MenuItem>
            )}
          </>
        )}

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleDeleteRow} sx={{ py: 1, color: "error.main" }}>
          <ListItemIcon sx={{ minWidth: 30, color: "error.main" }}>
            <TableRowsRoundedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Setiri poz" slotProps={{ primary: { fontSize: "0.86rem", fontWeight: 600 } }} />
        </MenuItem>

        <MenuItem onClick={handleDeleteColumn} sx={{ py: 1, color: "error.main" }}>
          <ListItemIcon sx={{ minWidth: 30, color: "error.main" }}>
            <ViewColumnRoundedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText primary="Sütni poz" slotProps={{ primary: { fontSize: "0.86rem", fontWeight: 600 } }} />
        </MenuItem>
      </Menu>

      {/* Table Action Buttons: Add Row & Add Column */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleAddRow}
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "divider",
            color: "text.secondary",
            fontWeight: 600,
            fontSize: "0.82rem",
            px: 1.75,
            py: 0.6,
            "&:hover": {
              borderColor: "primary.main",
              color: "primary.main",
              backgroundColor: "rgba(12, 138, 123, 0.04)",
            },
          }}
        >
          Setir goş
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={handleAddColumn}
          startIcon={<ViewColumnRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "divider",
            color: "text.secondary",
            fontWeight: 600,
            fontSize: "0.82rem",
            px: 1.75,
            py: 0.6,
            "&:hover": {
              borderColor: "primary.main",
              color: "primary.main",
              backgroundColor: "rgba(12, 138, 123, 0.04)",
            },
          }}
        >
          Sütün goş
        </Button>
      </Box>

      {/* Table Note Area */}
      <Box sx={{ pt: 1, borderTop: "1px dashed", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
          <NoteAltOutlinedIcon sx={{ fontSize: 16, color: "warning.main" }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.5px",
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            BELLIK
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={2}
          value={table.note || ""}
          onChange={(e) => onUpdate({ ...table, note: e.target.value })}
          placeholder="Bu tablisanyň bellikleri..."
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                fontSize: "0.88rem",
                color: "text.primary",
                p: 0,
              },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default DynamicTable;
