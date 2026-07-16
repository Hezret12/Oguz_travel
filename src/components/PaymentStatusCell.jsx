import { Box } from "@mui/material";

const getPaymentColor = (percent) => {
  if (percent >= 100)
    return { ring: "#5DCAA5", track: "#E1F5EE", text: "#085041" };
  if (percent <= 0)
    return { ring: "#E24B4A", track: "#FCEBEB", text: "#791F1F" };
  return { ring: "#EF9F27", track: "#FAEEDA", text: "#633806" };
};

const SIZE = 34;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PaymentStatusCell = ({ percent = 0 }) => {
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  const { ring, track, text } = getPaymentColor(value);
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
