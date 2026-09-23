import { Box, Typography } from "@mui/material";
import OverflowTooltipLabel from "../../../../components/OverflowTooltipLabel";
import { useLocale } from "../../../../hooks/useLocale";

/** Read-only "quantity" field, sized like the ÝH inputs it sits next to. */
export const LetterCountField = ({ count }) => {
  const { t } = useLocale();

  return (
    <>
      <OverflowTooltipLabel label={t("referralLetter.quantity")} />
      <Box
        sx={{
          minHeight: 44,
          px: 1.5,
          display: "flex",
          alignItems: "center",
          borderRadius: "7px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "action.hover",
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
          noWrap
        >
          {count} {t("referralLetter.letterUnit")}
        </Typography>
      </Box>
    </>
  );
};

/** Batch total, shown as a summary strip under the batch form fields. */
export const LetterTotalSummary = ({ count }) => {
  const { t } = useLocale();

  return (
    <Box
      sx={{
        mt: 0.5,
        p: 2,
        borderRadius: "10px",
        backgroundColor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
        {t("referralLetter.totalQuantity")}:{" "}
        <Box
          component="span"
          sx={{ color: "text.primary", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
        >
          {count}
        </Box>{" "}
        {t("referralLetter.letterUnit")}
      </Typography>
    </Box>
  );
};
