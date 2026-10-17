import { useState, useEffect } from "react";
import "./App.css";
import AppRouter from "./routes/index";
import { Box } from "@mui/material";
import { Toaster } from "react-hot-toast";
import OguzTravelLogo from "./layouts/Logo";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import GlobalModal from "./components/GlobalModal";
import AddClientModal from "./components/global/AddClientModal/AddClientModal";
import NetworkStatusBanner from "./components/NetworkStatusBanner";

import { useLocale } from "./hooks/useLocale";

import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/tk";
import "dayjs/locale/ru";
import "dayjs/locale/en";

dayjs.extend(updateLocale);

dayjs.updateLocale("tk", {
  weekdaysShort: ["Ýek", "Duş", "Siş", "Çar", "Pen", "Ann", "Şen"],
  weekdaysMin: ["Ýe", "Du", "Şi", "Ça", "Pe", "An", "Şe"],
});

function App() {
  const { currentLanguage } = useLocale();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const activeLocale =
    currentLanguage === "ru" ? "ru" : currentLanguage === "en" ? "en" : "tk";

  useEffect(() => {
    dayjs.locale(activeLocale);
  }, [activeLocale]);

  useEffect(() => {
    let minTimePassed = false;
    let isAppLoaded = document.readyState === "complete";

    const tryFinish = () => {
      if (minTimePassed && isAppLoaded) {
        setFadeOut(true);
        setTimeout(() => setShowSplash(false), 400);
      }
    };

    const minTimer = setTimeout(() => {
      minTimePassed = true;
      tryFinish();
    }, 1400);

    const handleLoad = () => {
      isAppLoaded = true;
      tryFinish();
    };

    if (!isAppLoaded) {
      window.addEventListener("load", handleLoad);
    }

    const maxSafetyTimer = setTimeout(() => {
      isAppLoaded = true;
      minTimePassed = true;
      tryFinish();
    }, 6000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxSafetyTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={activeLocale}
      key={activeLocale}
    >
      {showSplash && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.35s ease-out",
            pointerEvents: fadeOut ? "none" : "auto",
          }}
        >
          {/* The logo drifts forward a touch as the splash dissolves. */}
          <Box
            sx={{
              width: 360,
              maxWidth: "78vw",
              transform: fadeOut ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <OguzTravelLogo autoPlay style={{ width: "100%", display: "block" }} />
          </Box>
          {/* Only fades in once the intro is over, i.e. on a slow load. */}
          <Box
            sx={{
              position: "relative",
              width: 140,
              height: 2,
              mt: 3,
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: "action.hover",
              opacity: 0,
              animation: "splashBarIn 0.4s ease-out 1.5s forwards",
              "@keyframes splashBarIn": { to: { opacity: 1 } },
              "@keyframes splashBarSlide": {
                from: { transform: "translateX(-100%)" },
                to: { transform: "translateX(350%)" },
              },
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                width: "40%",
                borderRadius: 1,
                bgcolor: "primary.main",
                animation:
                  "splashBarSlide 1.3s cubic-bezier(0.65, 0, 0.35, 1) infinite",
              },
            }}
          />
        </Box>
      )}
      <NetworkStatusBanner />
      <AppRouter />
      <GlobalModal />
      <AddClientModal />
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </LocalizationProvider>
  );
}

export default App;
