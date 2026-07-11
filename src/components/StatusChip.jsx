import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

const StatusChip = ({ status, config, size = "small" }) => {
  const key = status?.toString().toUpperCase();
  const item = config[key];

  if (!item) {
    return <Chip label={status ?? "-"} size={size} variant="outlined" />;
  }

  const { label, color, icon: Icon } = item;

  return (
    <Chip
      icon={<Icon sx={{ fontSize: 16, color: `${color} !important` }} />}
      label={label}
      size={size}
      sx={{
        bgcolor: alpha(color, 0.12),
        color,
        fontWeight: 600,
        fontSize: "0.75rem",
        borderRadius: "6px",
        border: "1px solid",
        borderColor: alpha(color, 0.24),
        "& .MuiChip-label": { px: "8px" },
        "& .MuiChip-icon": { ml: "8px" },
      }}
    />
  );
};

export default StatusChip;
