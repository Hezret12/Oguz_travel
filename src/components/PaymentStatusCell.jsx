import { Box, useTheme } from "@mui/material";

const getPaymentColor = (percent, isDarkMode) => {
  if (percent >= 100) {
    return {
      ring: "#5DCAA5",
      track: isDarkMode ? "rgba(93, 202, 165, 0.15)" : "#E1F5EE",
      text: isDarkMode ? "#5DCAA5" : "#085041",
    };
  }
  if (percent <= 0) {
    return {
      ring: "#E24B4A",
      track: isDarkMode ? "rgba(226, 75, 74, 0.15)" : "#FCEBEB",
      text: isDarkMode ? "#E24B4A" : "#791F1F",
    };
  }
  return {
    ring: "#EF9F27",
    track: isDarkMode ? "rgba(239, 159, 39, 0.15)" : "#FAEEDA",
    text: isDarkMode ? "#EF9F27" : "#633806",
  };
};

const SIZE = 34;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PaymentStatusCell = ({ percent = 0 }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const numericPercent = typeof percent === "string" ? parseFloat(percent) : percent;
  const value = Math.min(100, Math.max(0, Math.round(numericPercent || 0)));
  const { ring, track, text } = getPaymentColor(value, isDarkMode);
  const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={track}
          strokeWidth={STROKE}
        />
        {value > 0 && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={ring}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )}
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 3}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill={text}
        >
          {value}
        </text>
      </svg>
    </Box>
  );
};

export default PaymentStatusCell;
