import { Alert, Slide } from "@mui/material";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useLocale } from "../hooks/useLocale";

export default function NetworkStatusBanner() {
  const isOffline = useNetworkStatus();
  const { t } = useLocale();

  return (
    <Slide direction="down" in={isOffline} mountOnEnter unmountOnExit>
      <Alert
        severity="warning"
        variant="filled"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.snackbar,
          borderRadius: 0,
          justifyContent: "center",
        }}
      >
        {t("common.offlineNotice")}
      </Alert>
    </Slide>
  );
}
