import { useMemo } from "react";
import { useTheme } from "@mui/material";

/**
 * Centralizes all theme-aware design tokens and memoized style objects
 * used across TurkishAirlinesReport sub-components.
 */
const useReportTheme = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  /* ── Color Tokens ── */
  const colors = useMemo(
    () => ({
      teal: isDark ? "#14B8A6" : "#0E8584",
      accent: isDark ? "#22D3EE" : "#0284C7",
      green: isDark ? "#34D399" : "#10B981",
      orange: isDark ? "#FBBF24" : "#D97706",
      bgCard: isDark ? "#031E2A" : "#FFFFFF",
      bgSticky: isDark ? "#021721" : "#FFFFFF",
      bgHeader: isDark ? "#052938" : "#F8FAFC",
      border: isDark ? "rgba(20, 184, 166, 0.15)" : "#E2E8F0",
    }),
    [isDark]
  );

  /* ── Paper Card Style ── */
  const paperSx = useMemo(
    () => ({
      borderRadius: 3,
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.bgCard,
      boxShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.36)"
        : "0 2px 12px rgba(0,0,0,0.04)",
    }),
    [colors, isDark]
  );

  /* ── Date Select Style ── */
  const selectSx = useMemo(
    () => ({
      backgroundColor: isDark ? "rgba(20,184,166,0.06)" : "#FFFFFF",
      borderRadius: 2,
      "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.teal,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.teal,
      },
    }),
    [isDark, colors]
  );

  /* ── Table Cell Styles ── */
  const headerCellSx = useMemo(
    () => ({
      fontWeight: 700,
      fontSize: 11.5,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
      borderBottom: `1px solid ${colors.border}`,
      py: 1.5,
      px: 1.5,
      whiteSpace: "nowrap",
      backgroundColor: colors.bgHeader,
    }),
    [isDark, colors]
  );

  const bodyCellSx = useMemo(
    () => ({
      fontSize: 13,
      fontWeight: 500,
      color: isDark ? "rgba(255,255,255,0.85)" : "#334155",
      borderBottom: isDark
        ? "1px solid rgba(255,255,255,0.05)"
        : "1px solid #F1F5F9",
      py: 1.2,
      px: 1.5,
      whiteSpace: "nowrap",
      fontFamily: "'Inter', sans-serif",
    }),
    [isDark]
  );

  const footerCellSx = useMemo(
    () => ({
      ...bodyCellSx,
      fontWeight: 700,
      fontSize: 13,
      backgroundColor: isDark ? "rgba(20,184,166,0.08)" : "#F0FDF4",
      borderBottom: "none",
      borderTop: isDark
        ? "2px solid rgba(20,184,166,0.3)"
        : "2px solid #CBD5E1",
    }),
    [bodyCellSx, isDark]
  );

  return {
    isDark,
    colors,
    paperSx,
    selectSx,
    headerCellSx,
    bodyCellSx,
    footerCellSx,
  };
};

export default useReportTheme;
