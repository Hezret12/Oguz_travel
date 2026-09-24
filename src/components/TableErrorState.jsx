import { memo } from "react";
import { Alert, Box, Button } from "@mui/material";
import { RotateCw } from "lucide-react";
import { useLocale } from "../hooks/useLocale";

/**
 * What a table shows when its request failed.
 *
 * The API answers a failed read with an HTTP error (the response interceptor copies the body's
 * status onto the response), so React Query reports it as an error rather than as an empty
 * list. Without this the table falls back to `TableEmptyState` and a broken request reads as
 * "there are no records", with nothing to retry from.
 */
const TableErrorState = ({ onRetry, isRetrying = false, message }) => {
  const { t } = useLocale();

  return (
    <Box sx={{ p: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => onRetry()}
              disabled={isRetrying}
              startIcon={<RotateCw size={14} />}
            >
              {t("errorBoundary.retry")}
            </Button>
          ) : null
        }
      >
        {message || t("errorOccurred")}
      </Alert>
    </Box>
  );
};

export default memo(TableErrorState);
