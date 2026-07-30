import { useState, useEffect } from "react";
import "./App.css";
import AppRouter from "./routes/index";
import { Toaster } from "react-hot-toast";
import OguzTravelLogo from "./layouts/Logo";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import GlobalModal from "./components/GlobalModal";
import AddClientModal from "./components/global/AddClientModal/AddClientModal";

import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/tr";

dayjs.extend(updateLocale);

dayjs.updateLocale("tr", {
  weekdays: [
    "Duşenbe",
    "Sişenbe",
    "Çarşenbe",
    "Penşenbe",
    "Anna",
    "Şenbe",
    "Ýekşenbe",
  ],
  weekdaysShort: ["Du", "Şi", "Ça", "Pe", "An", "Şe", "Ýe"],
  weekdaysMin: ["Du", "Şi", "Ça", "Pe", "An", "Şe", "Ýe"],
  months: [
    "Ýanwar",
    "Fewral",
    "Mart",
    "Aprel",
    "Maý",
    "Iýun",
    "Iýul",
    "Awgust",
    "Sentýabr",
    "Oktýabr",
    "Noýabr",
    "Dekabr",
  ],
  monthsShort: [
    "Ýan",
    "Few",
    "Mar",
    "Apr",
    "Maý",
    "Iýn",
    "Iýl",
    "Awg",
    "Sen",
    "Okt",
    "Noý",
    "Dek",
  ],
  weekStart: 1,
});

dayjs.locale("tr");

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let minTimePassed = false;
    let isAppLoaded = document.readyState === "complete";

    const tryFinish = () => {
      if (minTimePassed && isAppLoaded) {
        setFadeOut(true);
        setTimeout(() => setShowSplash(false), 400);
      }
    };

    // 1. Min duration gate: Ensure 1 full logo animation cycle plays (1.4s)
    const minTimer = setTimeout(() => {
      minTimePassed = true;
      tryFinish();
    }, 1400);

    // 2. App load gate: Ensure assets and initial DOM/chunks are loaded
    const handleLoad = () => {
      isAppLoaded = true;
      tryFinish();
    };

    if (!isAppLoaded) {
      window.addEventListener("load", handleLoad);
    }

    // 3. Production Safety Net: Max 6s fallback limit (prevents freezing on bad network)
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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      {showSplash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, #f0fdfa 0%, #e0f7f5 50%, #d0f0ee 100%)",
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.35s ease-out",
            pointerEvents: fadeOut ? "none" : "auto",
          }}
        >
          <OguzTravelLogo autoPlay style={{ width: 400, maxWidth: "90vw" }} />
        </div>
      )}
      <AppRouter />
      <GlobalModal />
      <AddClientModal />
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </LocalizationProvider>
  );
}

export default App;
