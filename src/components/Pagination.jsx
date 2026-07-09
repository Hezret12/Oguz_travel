import { useState } from "react";
import { Box, IconButton, InputBase, Typography, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const Pagination = ({ pageIndex = 0, pageCount = 1, onPageChange, totalRows }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [goToValue, setGoToValue] = useState("");

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  const handlePrev = () => { if (canPrev) onPageChange(pageIndex - 1); };
  const handleNext = () => { if (canNext) onPageChange(pageIndex + 1); };

  const handleGoTo = (e) => {
    if (e.key === "Enter") {
      const num = parseInt(goToValue, 10);
      if (!isNaN(num) && num >= 1 && num <= pageCount) onPageChange(num - 1);
      setGoToValue("");
    }
  };

  const getPageNumbers = () => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);
    const pages = [];
    const left = Math.max(1, pageIndex - 1);
    const right = Math.min(pageCount - 2, pageIndex + 1);
    pages.push(0);
    if (left > 1) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < pageCount - 2) pages.push("...");
    pages.push(pageCount - 1);
    return pages;
  };

  const baseBtn = {
    width: 34, height: 34, borderRadius: "8px",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    fontSize: "13px", fontWeight: 500,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },
  };

  const activeBtn = {
    ...baseBtn,
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 700,
    boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(37,99,235,0.35)",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      borderColor: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText,
    },
  };

  const navSx = {
    width: 34, height: 34, borderRadius: "8px",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-disabled": { opacity: 0.35, pointerEvents: "none" },
  };

  if (pageCount <= 1) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
      {/* Prev */}
      <IconButton size="small" onClick={handlePrev} disabled={!canPrev} sx={navSx}>
        <ChevronLeftIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* Page numbers */}
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <Typography
            key={`el-${idx}`}
            sx={{ width: 34, textAlign: "center", fontSize: "13px", color: theme.palette.text.disabled, userSelect: "none" }}
          >
            …
          </Typography>
        ) : (
          <Box key={page} onClick={() => onPageChange(page)} sx={page === pageIndex ? activeBtn : baseBtn}>
            {page + 1}
          </Box>
        )
      )}

      {/* Next */}
      <IconButton size="small" onClick={handleNext} disabled={!canNext} sx={navSx}>
        <ChevronRightIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* Separator */}
      <Box sx={{ width: "1px", height: 20, backgroundColor: theme.palette.divider, mx: 0.5 }} />

      {/* Go to page */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Typography sx={{ fontSize: "13px", color: theme.palette.text.secondary, whiteSpace: "nowrap" }}>
          Go to
        </Typography>
        <InputBase
          value={goToValue}
          onChange={(e) => setGoToValue(e.target.value)}
          onKeyDown={handleGoTo}
          inputProps={{ type: "number", min: 1, max: pageCount, style: { textAlign: "center" } }}
          placeholder="pg"
          sx={{
            width: 46, height: 34, borderRadius: "8px",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            fontSize: "13px", fontWeight: 500,
            color: theme.palette.text.primary,
            px: 0.5,
            "& input": {
              textAlign: "center",
              padding: "0 4px",
              "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 },
            },
            "&.Mui-focused": {
              borderColor: theme.palette.primary.main,
              boxShadow: isDark
                ? "0 0 0 2px rgba(59,130,246,0.18)"
                : "0 0 0 2px rgba(37,99,235,0.15)",
            },
            transition: "all 0.15s ease",
          }}
        />
      </Box>

      {/* Total pages */}
      {totalRows !== undefined && (
        <Typography sx={{ fontSize: "12px", color: theme.palette.text.disabled, ml: 0.25, whiteSpace: "nowrap" }}>
          / {pageCount} pg
        </Typography>
      )}
    </Box>
  );
};

export default Pagination;
