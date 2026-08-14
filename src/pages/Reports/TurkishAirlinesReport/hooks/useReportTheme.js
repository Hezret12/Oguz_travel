import { useMemo } from "react";
import { useTheme } from "@mui/material";

const useReportTheme = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const colors = useMemo(
    () => ({
      teal: isDark ? "#2DD4BF" : "#0E8584",
      tealSoft: isDark ? "#14B8A6" : "#0D9488",
      accent: isDark ? "#22D3EE" : "#0284C7",
      green: isDark ? "#34D399" : "#10B981",
      orange: isDark ? "#FBBF24" : "#D97706",
      red: "#EF4444",
      bgCard: isDark ? "#031E2A" : "#FFFFFF",
      bgSticky: isDark ? "#021721" : "#FFFFFF",
      bgHeader: isDark ? "#052938" : "#F8FAFC",
      border: isDark ? "rgba(20, 184, 166, 0.15)" : "#E2E8F0",
      hoverTeal: isDark ? "rgba(20,184,166,0.08)" : "rgba(14,133,132,0.05)",
      gradientTeal: isDark
        ? "linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(34,211,238,0.06) 100%)"
        : "linear-gradient(135deg, rgba(14,133,132,0.06) 0%, rgba(2,132,199,0.04) 100%)",
      shadowCard: isDark
        ? "0 8px 32px rgba(0,0,0,0.36), 0 2px 8px rgba(20,184,166,0.08)"
        : "0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
      shadowHover: isDark
        ? "0 12px 40px rgba(0,0,0,0.4), 0 4px 12px rgba(20,184,166,0.12)"
        : "0 8px 28px rgba(0,0,0,0.08), 0 2px 8px rgba(14,133,132,0.06)",
    }),
    [isDark]
  );

  const paperSx = useMemo(
    () => ({
      borderRadius: 3,
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.bgCard,
      boxShadow: colors.shadowCard,
      transition: "box-shadow 0.25s ease, transform 0.25s ease",
      "&:hover": {
        boxShadow: colors.shadowHover,
      },
    }),
    [colors]
  );

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
        borderWidth: 1.5,
      },
    }),
    [isDark, colors]
  );

  const headerCellSx = useMemo(
    () => ({
      fontWeight: 700,
      fontSize: 11.5,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
      borderBottom: `2px solid ${isDark ? "rgba(20,184,166,0.2)" : "#E2E8F0"}`,
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
