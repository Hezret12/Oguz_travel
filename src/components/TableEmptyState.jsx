import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { FolderSearch } from "lucide-react";
import { useLocale } from "../hooks/useLocale";

const TableEmptyState = ({
  title,
  description,
  icon: CustomIcon,
  // Nested / detail-panel tables: one quiet line instead of the full page-sized placeholder.
  dense = false,
  sx = {},
}) => {
  const { t } = useLocale();

  const displayTitle = title || t("noData");

  const IconComponent = CustomIcon || FolderSearch;

  if (dense) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          width: "100%",
          py: 2.5,
          px: 2,
          textAlign: "center",
          userSelect: "none",
          color: "text.secondary",
          ...sx,
        }}
      >
        <IconComponent size={16} strokeWidth={1.75} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {displayTitle}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            {description}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "calc(100vh - 360px)",
        py: 4,
        px: 3,
        textAlign: "center",
        userSelect: "none",
        ...sx,
      }}
    >
      {/* Frosted Icon Badge */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(20, 184, 166, 0.08)"
              : "rgba(14, 133, 132, 0.06)",
          border: "1px solid",
          borderColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(20, 184, 166, 0.20)"
              : "rgba(14, 133, 132, 0.15)",
          color: "primary.main",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 8px 24px rgba(0, 0, 0, 0.35)"
              : "0 4px 16px rgba(15, 23, 42, 0.04)",
        }}
      >
        <IconComponent size={30} strokeWidth={1.75} />
      </Box>

      {/* Main Title */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 650,
          fontSize: "1.125rem",
          color: "text.primary",
          mb: 0.75,
          letterSpacing: "-0.01em",
        }}
      >
        {displayTitle}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.9375rem",
            lineHeight: 1.6,
            maxWidth: 420,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default memo(TableEmptyState);
