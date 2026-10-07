import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { CONTROL_HEIGHT } from "./PeriodRangeFilter";

/**
 * "Updated HH:mm:ss" and a refresh button for a report page, sized to sit next to the period
 * filter. `updatedAt` is the time the shown data was fetched (ms); the icon spins while a
 * fetch is running and the button is disabled until it ends.
 */
const RefreshControl = ({ updatedAt, isFetching, onRefresh }) => {
  const { t } = useLocale();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        pl: 1,
        ml: 0.25,
        borderLeft: "1px solid",
        borderColor: "divider",
        "@keyframes refreshSpin": { to: { transform: "rotate(360deg)" } },
      }}
    >
      {updatedAt > 0 && (
        <Typography noWrap sx={{ fontSize: "0.75rem", color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
          {t("dashboard.updatedAt", { time: dayjs(updatedAt).format("HH:mm:ss") })}
        </Typography>
      )}
      <Tooltip title={t("dashboard.refresh")} arrow>
        <span>
          <IconButton
            onClick={onRefresh}
            disabled={isFetching}
            sx={{
              width: CONTROL_HEIGHT,
              height: CONTROL_HEIGHT,
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              color: "text.secondary",
              "&:hover": { borderColor: "primary.main", color: "primary.main", backgroundColor: "background.paper" },
            }}
          >
            <RefreshCw size={16} style={{ animation: isFetching ? "refreshSpin 1s linear infinite" : "none" }} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default RefreshControl;
