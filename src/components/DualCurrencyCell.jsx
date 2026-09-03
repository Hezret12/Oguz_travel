import { Box, Typography } from "@mui/material";

/**
 * DualCurrencyCell
 * Renders monetary amounts cleanly in tables and lists.
 * If both USD and TMT are present, displays both neatly stacked without expanding row height.
 * If only one currency is present, renders that single currency cleanly.
 */
const DualCurrencyCell = ({
  usd,
  tmt,
  amount,
  currency = "USD",
  align = "right",
}) => {
  const numUsd = Number(usd || 0);
  const numTmt = Number(tmt || 0);

  if (numUsd > 0 && numTmt > 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.15,
          lineHeight: 1.2,
          alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: "12.5px",
            fontWeight: 600,
            color: "text.primary",
            fontFamily: "'Inter', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          ${numUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontSize: "11px",
            fontWeight: 600,
            color: "primary.main",
            fontFamily: "'Inter', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {numTmt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m
        </Typography>
      </Box>
    );
  }

  if (numTmt > 0 && numUsd === 0) {
    return (
      <Typography
        component="span"
        sx={{
          fontSize: "12.5px",
          fontWeight: 600,
          color: "text.primary",
          fontFamily: "'Inter', sans-serif",
          display: "block",
          textAlign: align,
          whiteSpace: "nowrap",
        }}
      >
        {numTmt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m
      </Typography>
    );
  }

  const finalAmount = numUsd > 0 ? numUsd : Number(amount || 0);
  const isTmt = currency === "TMT";

  return (
    <Typography
      component="span"
      sx={{
        fontSize: "12.5px",
        fontWeight: 600,
        color: "text.primary",
        fontFamily: "'Inter', sans-serif",
        display: "block",
        textAlign: align,
        whiteSpace: "nowrap",
      }}
    >
      {!isTmt && "$"}
      {finalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      {isTmt && " m"}
    </Typography>
  );
};

export default DualCurrencyCell;
