import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { FolderSearch } from "lucide-react";
import { useLocale } from "../hooks/useLocale";

const TableEmptyState = ({
  title,
  icon: CustomIcon,
  sx = {},
}) => {
  const { t } = useLocale();

  const displayTitle = title || t("noData");

  const IconComponent = CustomIcon || FolderSearch;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        width: "100%",
        height: "100%",
        minHeight: "100%",
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
          width: 58,
          height: 58,
          borderRadius: "16px",
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
        <IconComponent size={26} strokeWidth={1.75} />
      </Box>

      {/* Main Title */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 650,
          fontSize: "0.95rem",
          color: "text.primary",
          mb: 0.5,
          letterSpacing: "-0.01em",
        }}
      >
        {displayTitle}
      </Typography>
    </Box>
  );
};

export default memo(TableEmptyState);
