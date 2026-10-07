import { Box, Typography } from "@mui/material";
import { Package } from "lucide-react";
import { useLocale } from "../../../../hooks/useLocale";

/** "Jemi Stok: N sany hat" — every letter of every stock batch. Draws nothing until the count is known. */
const TotalStockPill = ({ count }) => {
  const { t } = useLocale();
  if (count === null || count === undefined) return null;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        height: 48,
        borderRadius: "12px",
        backgroundColor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
        whiteSpace: "nowrap",
      }}
    >
      <Package size={17} style={{ opacity: 0.75 }} />
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.825rem",
          color: "text.secondary",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 0.6,
        }}
      >
        {t("referralLetter.totalStock")}:
        <Box
          component="span"
          sx={{
            color: "text.primary",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count} {t("referralLetter.letterUnit")}
        </Box>
      </Typography>
    </Box>
  );
};

export default TotalStockPill;
