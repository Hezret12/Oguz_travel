import { memo, useRef, useState } from "react";
import { Box, CircularProgress, InputBase, Tooltip } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import { formatMoney, toNumber } from "../functions/salaryUtils";
import SalaryCurrencyBadge from "./SalaryCurrencyBadge";

const CELL_ATTR = "data-salary-cell";
// Fixed tints that read on both themes (info blue, primary teal), so the
// cell style needs no theme callback.
const CHANGED_TINT = "rgba(41, 146, 209, 0.10)";
const FOCUS_RING = "0 0 0 3px rgba(14, 133, 132, 0.22)";

const focusCell = (rowIndex, field) => {
  document.querySelector(`[${CELL_ATTR}="${rowIndex}:${field}"]`)?.focus();
};

const parseInput = (raw, integer) => {
  const cleaned = String(raw).replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return 0;
  if (!/^\d*\.?\d*$/.test(cleaned)) return NaN;
  const num = Number(cleaned);
  if (integer && !Number.isInteger(num)) return NaN;
  return num;
};

/**
 * Spreadsheet-style numeric cell.
 * Focus (click / Tab) opens the editor; Enter / ↓ saves and moves down,
 * ↑ saves and moves up, Tab saves and moves right, Esc cancels.
 * `onCommit(value)` must return a promise; the cell shows the pending value
 * until it settles and falls back to the cached value on failure.
 */
const EditableCell = ({
  value,
  previous,
  rowIndex,
  field,
  integer = false,
  readOnly = false,
  align = "right",
  currency,
  onCurrencyChange,
  onCommit,
}) => {
  const { t } = useLocale();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(null);
  const cancelRef = useRef(false);
  const moveRef = useRef(0);

  const current = toNumber(value);
  const format = (v) => (integer ? String(toNumber(v)) : formatMoney(v));
  const hasPrevious = previous !== undefined && previous !== null;
  const changed = hasPrevious && toNumber(previous) !== current;

  const startEdit = () => {
    if (readOnly || editing) return;
    cancelRef.current = false;
    moveRef.current = 0;
    setDraft(current === 0 ? "" : String(current));
    setEditing(true);
  };

  const finishEdit = async () => {
    setEditing(false);
    const move = moveRef.current;
    if (move) requestAnimationFrame(() => focusCell(rowIndex + move, field));
    if (cancelRef.current) return;

    const next = parseInput(draft, integer);
    if (Number.isNaN(next) || next === current) return;

    setPending(next);
    try {
      await onCommit(next);
    } catch {
      // The mutation hook already showed the error; the cached value stays.
    } finally {
      setPending(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      cancelRef.current = true;
      e.currentTarget.blur();
    } else if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      moveRef.current = 1;
      e.currentTarget.blur();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveRef.current = -1;
      e.currentTarget.blur();
    }
  };

  const shown = pending ?? current;
  const cell = (
    <Box
      {...{ [CELL_ATTR]: `${rowIndex}:${field}` }}
      tabIndex={readOnly || editing ? -1 : 0}
      onFocus={startEdit}
      // Looks like an input (same 7px radius as CustomTextField) so it is
      // obvious the value can be typed in; a locked month drops the frame.
      // Plain object, no theme callback and no colour transitions: ~270 of
      // these render at once, and a theme switch must stay cheap.
      sx={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        px: 1,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: currency ? "space-between" : align === "right" ? "flex-end" : "center",
        gap: 0.5,
        borderRadius: "7px",
        border: "1px solid",
        borderColor: readOnly ? "transparent" : editing ? "primary.main" : "divider",
        backgroundColor: readOnly
          ? "transparent"
          : changed && !editing
            ? CHANGED_TINT
            : "background.paper",
        boxShadow: editing ? FOCUS_RING : "none",
        cursor: readOnly ? "default" : "text",
        outline: "none",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        transition: "box-shadow 0.15s ease",
        ...(!readOnly && {
          "&:hover": { borderColor: editing ? "primary.main" : "text.secondary" },
        }),
      }}
    >
      {currency && (
        <SalaryCurrencyBadge
          currency={currency}
          onToggle={onCurrencyChange}
          readOnly={readOnly}
        />
      )}
      {editing ? (
        <InputBase
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={finishEdit}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
          slotProps={{
            input: { inputMode: "decimal", style: { textAlign: align, padding: 0 } },
          }}
          sx={{ width: "100%", fontSize: "inherit", fontWeight: 600 }}
        />
      ) : (
        <Box component="span" sx={{ opacity: pending !== null ? 0.6 : 1, width: "100%", textAlign: align }}>
          {format(shown)}
        </Box>
      )}
      {pending !== null && (
        <CircularProgress size={10} sx={{ position: "absolute", top: 4, right: 4 }} />
      )}
    </Box>
  );

  // Only cells that differ from last month get a Tooltip. `changed` does not
  // flip while editing, so entering/leaving edit mode never remounts the
  // cell and drops focus.
  if (!changed) return cell;
  return (
    <Tooltip
      title={
        editing
          ? ""
          : t("salary.previousValue", {
              value: integer ? String(toNumber(previous)) : formatMoney(previous, { currency }),
            })
      }
      arrow
      placement="top"
    >
      {cell}
    </Tooltip>
  );
};

export default memo(EditableCell);
