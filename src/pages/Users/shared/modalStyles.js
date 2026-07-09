export const tabStyles = {
  minHeight: 48,
  p: 0.75,
  borderRadius: "14px",
  backgroundColor: (theme) =>
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "#f8fafc",
  border: (theme) =>
    `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
  display: "flex",
  "& .MuiTabs-flexContainer": { gap: 1 },
  "& .MuiTabs-indicator": { display: "none" },
  "& .MuiTab-root": {
    minHeight: 36,
    height: 36,
    flex: 1,
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "14px",
    color: "text.secondary",
    transition: "all 0.2s ease",
    "&.Mui-selected": {
      color: (theme) =>
        theme.palette.mode === "dark" ? "text.primary" : "#ffffff",
      backgroundColor: (theme) =>
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#2563eb",
      boxShadow: (theme) =>
        theme.palette.mode === "dark"
          ? "none"
          : "0 6px 16px rgba(37,99,235,0.24)",
    },
    "&:hover:not(.Mui-selected)": {
      color: "text.primary",
      backgroundColor: (theme) =>
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.8)",
    },
  },
};

export const scrollAreaStyles = {
  height: 430,
  minHeight: 430,
  maxHeight: 430,
  overflowY: "auto",
  overflowX: "hidden",
  pr: 1,
  mr: -1,
  pb: 0.5,
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(148, 163, 184, 0.7) transparent",
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "divider", borderRadius: 999 },
};
