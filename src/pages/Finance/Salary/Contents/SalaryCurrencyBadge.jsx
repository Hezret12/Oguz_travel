import { memo, useState } from "react";
import { Box, CircularProgress, Tooltip } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import { BONUS_CURRENCY } from "../functions/salaryUtils";

/**
 * Compact currency toggle badge for table cells (bonus).
 * Displays "$" (green tint) for USD and "m" (neutral tint) for TMT.
 * Clicking toggles the currency directly via onToggle callback.
 */
const SalaryCurrencyBadge = ({ currency, onToggle, readOnly = false }) => {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);
  const isUsd = currency === BONUS_CURRENCY.USD;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (readOnly || pending || !onToggle) return;
    const nextCurrency = isUsd ? BONUS_CURRENCY.TMT : BONUS_CURRENCY.USD;
    setPending(true);
    try {
      await onToggle(nextCurrency);
    } catch {
      // Mutation error handled upstream
    } finally {
      setPending(false);
    }
  };

  const tooltipTitle = readOnly
    ? (isUsd ? "USD ($)" : "TMT (m)")
    : (isUsd ? t("salary.currencyToggleToTmt") : t("salary.currencyToggleToUsd"));

  return (
    <Tooltip title={tooltipTitle} arrow placement="top">
      <Box
        component="button"
        type="button"
        disabled={readOnly || pending}
        onClick={handleClick}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        sx={(theme) => ({
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 22,
          minWidth: 24,
          px: 0.5,
          fontSize: "0.72rem",
          fontWeight: 800,
          fontFamily: "inherit",
          lineHeight: 1,
          borderRadius: "4px",
          cursor: readOnly ? "default" : "pointer",
          userSelect: "none",
          transition: "all 0.15s ease",
          outline: "none",
          border: "1px solid",
          ...(isUsd
            ? {
                color: "#059669",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                borderColor: "rgba(16, 185, 129, 0.35)",
                "&:hover": !readOnly
                  ? {
                      backgroundColor: "rgba(16, 185, 129, 0.16)",
                      borderColor: "#059669",
                      transform: "scale(1.05)",
                    }
                  : {},
                ...theme.applyStyles("dark", {
                  color: "#34d399",
                  backgroundColor: "rgba(52, 211, 153, 0.12)",
                  borderColor: "rgba(52, 211, 153, 0.4)",
                  "&:hover": !readOnly
                    ? {
                        backgroundColor: "rgba(52, 211, 153, 0.22)",
                        borderColor: "#34d399",
                      }
                    : {},
                }),
              }
            : {
                color: "text.secondary",
                backgroundColor: "action.hover",
                borderColor: "divider",
                "&:hover": !readOnly
                  ? {
                      color: "primary.main",
                      borderColor: "primary.main",
                      backgroundColor: "action.selected",
                      transform: "scale(1.05)",
                    }
                  : {},
              }),
          "&:active": !readOnly ? { transform: "scale(0.95)" } : {},
          "&:disabled": { opacity: 0.6, cursor: "not-allowed" },
        })}
      >
        {pending ? (
          <CircularProgress size={10} color="inherit" />
        ) : isUsd ? (
          "$"
        ) : (
          "m"
        )}
      </Box>
    </Tooltip>
  );
};

export default memo(SalaryCurrencyBadge);
