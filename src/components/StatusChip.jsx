import { Box, Typography } from "@mui/material";
import { useLocale } from "../hooks/useLocale";

const StatusChip = ({ status, config, size = "small" }) => {
  const { t } = useLocale();
  const key = status?.toString().toUpperCase();
  const item = config?.[key];

  if (!item) {
    return (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontSize: "0.8125rem" }}
      >
        {status ?? "—"}
      </Typography>
    );
  }

  const { label, labelKey, color = "#64748b" } = item;
  const targetKey = labelKey || label;
  const translated = targetKey ? t(targetKey) : "";
  const displayLabel = (translated && translated !== targetKey) ? translated : (label || targetKey || "—");

  const dotSize = size === "small" ? 7 : 8;

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <Box
        sx={{
          width: dotSize,
          height: dotSize,
          minWidth: dotSize,
          borderRadius: "50%",
          bgcolor: color,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: "text.primary",
          fontWeight: 500,
          fontSize: "0.8125rem",
          lineHeight: 1.4,
          whiteSpace: "nowrap",
        }}
      >
        {displayLabel}
      </Typography>
    </Box>
  );
};

export default StatusChip;
