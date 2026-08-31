import { useMemo } from "react";
import { useTheme } from "@mui/material";

const useReportTheme = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const colors = useMemo(
    () => ({
      teal: theme.palette.primary.main,
      tealSoft: theme.palette.primary.light,
      accent: isDark ? "#38BDF8" : "#0284C7",
      green: isDark ? "#34D399" : "#10B981",
      orange: isDark ? "#FBBF24" : "#D97706",
      red: isDark ? "#F87171" : "#EF4444",
      bgCard: isDark ? "#12131A" : "#FFFFFF",
      bgSticky: isDark ? "#12131A" : "#FFFFFF",
      bgHeader: isDark ? (theme.palette.subtable?.header || "#151621") : "#F8FAFC",
      border: theme.palette.divider,
      hoverTeal: isDark ? "rgba(255, 255, 255, 0.045)" : "rgba(14, 133, 132, 0.05)",
      gradientTeal: isDark
        ? "linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(56, 189, 248, 0.04) 100%)"
        : "linear-gradient(135deg, rgba(14, 133, 132, 0.06) 0%, rgba(2, 132, 199, 0.04) 100%)",
      shadowCard: isDark
        ? "0 4px 24px rgba(0, 0, 0, 0.50)"
        : "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      shadowHover: isDark
        ? "0 8px 32px rgba(0, 0, 0, 0.65)"
        : "0 4px 16px rgba(0,0,0,0.08)",
    }),
    [theme, isDark]
  );

  const paperSx = useMemo(
    () => ({
      borderRadius: "12px",
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: "background.paper",
      boxShadow: colors.shadowCard,
      transition: "box-shadow 0.25s ease, transform 0.25s ease",
      "&:hover": {
        boxShadow: colors.shadowHover,
      },
    }),
    [theme.palette.divider, colors.shadowCard, colors.shadowHover]
  );

  const selectSx = useMemo(
    () => ({
      backgroundColor: "background.paper",
      borderRadius: "10px",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1.5,
      },
    }),
    [theme.palette.divider, theme.palette.primary.main]
  );

  const headerCellSx = useMemo(
    () => ({
      fontWeight: 700,
      fontSize: 11.5,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "text.secondary",
      borderBottom: `1px solid ${theme.palette.divider}`,
      py: 1.5,
      px: 1.5,
      whiteSpace: "nowrap",
      backgroundColor: colors.bgHeader,
    }),
    [colors.bgHeader, theme.palette.divider]
  );

  const bodyCellSx = useMemo(
    () => ({
      fontSize: 13,
      fontWeight: 500,
      color: "text.primary",
      borderBottom: `1px solid ${theme.palette.divider}`,
      py: 1.2,
      px: 1.5,
      whiteSpace: "nowrap",
      fontFamily: "'Inter', sans-serif",
    }),
    [theme.palette.divider]
  );

  const footerCellSx = useMemo(
    () => ({
      ...bodyCellSx,
      fontWeight: 700,
      fontSize: 13,
      backgroundColor: colors.bgHeader,
      borderBottom: "none",
      borderTop: `1px solid ${theme.palette.divider}`,
    }),
    [bodyCellSx, colors.bgHeader, theme.palette.divider]
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

