import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

const StatusChip = ({ status, config, size = "small" }) => {
  const key = status?.toString().toUpperCase();
  const item = config?.[key];

  if (!item) {
    return <Chip label={status ?? "-"} size={size} variant="outlined" />;
  }

  const { label, color = "#64748b", icon: Icon } = item;

  // Check if color is a valid hex, rgb, or hsl string so alpha() does not throw on theme palette keys
  const isDirectColor =
    typeof color === "string" &&
    (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl"));

  const chipBg = isDirectColor ? alpha(color, 0.12) : "action.hover";
  const chipBorder = isDirectColor ? alpha(color, 0.24) : "divider";

  return (
    <Chip
      icon={Icon ? <Icon sx={{ fontSize: 16, color: isDirectColor ? `${color} !important` : "inherit" }} /> : undefined}
      label={label}
      size={size}
      sx={{
        bgcolor: chipBg,
        color: isDirectColor ? color : "text.primary",
        fontWeight: 600,
        fontSize: "0.75rem",
        borderRadius: "6px",
        border: "1px solid",
        borderColor: chipBorder,
        "& .MuiChip-label": { px: "8px" },
        "& .MuiChip-icon": { ml: "8px" },
      }}
    />
  );
};

export default StatusChip;
