import { Box, Typography } from "@mui/material";

const StatusChip = ({ status, config, size = "small" }) => {
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

  const { label, color = "#64748b" } = item;

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
        {label}
      </Typography>
    </Box>
  );
};

export default StatusChip;
