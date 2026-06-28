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
    border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
    color: isDark ? "rgba(255,255,255,0.7)" : "#374151",
    fontSize: "13px", fontWeight: 500,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.07)",
      borderColor: "#6366f1",
      color: "#6366f1",
    },
  };

  const activeBtn = {
    ...baseBtn,
    backgroundColor: "#2563eb", borderColor: "#2563eb",
    color: "#fff", fontWeight: 700,
    boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
    "&:hover": { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8", color: "#fff" },
  };

  const navSx = {
    width: 34, height: 34, borderRadius: "8px",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
    color: isDark ? "rgba(255,255,255,0.6)" : "#374151",
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.07)",
      borderColor: "#6366f1",
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
            sx={{ width: 34, textAlign: "center", fontSize: "13px", color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8", userSelect: "none" }}
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
      <Box sx={{ width: "1px", height: 20, backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0", mx: 0.5 }} />

      {/* Go to page */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Typography sx={{ fontSize: "13px", color: isDark ? "rgba(255,255,255,0.45)" : "#94a3b8", whiteSpace: "nowrap" }}>
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
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
            fontSize: "13px", fontWeight: 500,
            color: isDark ? "rgba(255,255,255,0.75)" : "#374151",
            px: 0.5,
            "& input": {
              textAlign: "center",
              padding: "0 4px",
              "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 },
            },
            "&.Mui-focused": { borderColor: "#2563eb", boxShadow: "0 0 0 2px rgba(37,99,235,0.15)" },
            transition: "all 0.15s ease",
          }}
        />
      </Box>

      {/* Total pages */}
      {totalRows !== undefined && (
        <Typography sx={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8", ml: 0.25, whiteSpace: "nowrap" }}>
          / {pageCount} pg
        </Typography>
      )}
    </Box>
  );
};

export default Pagination;
