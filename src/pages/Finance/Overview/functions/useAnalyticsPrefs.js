import { useCallback, useState } from "react";
import { CUSTOM_PERIOD, PERIODS, isValidCustomRange } from "./officeAnalyticsMock";

const read = (storageKey) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
};

const write = (storageKey, prefs) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(prefs));
  } catch {
    // Preferences are a convenience only.
  }
};

/**
 * The remembered filter selection of an analytics page: reporting range, plus
 * whatever else the page adds through `extraDefaults` (e.g. the picked office).
 *
 * A saved value is only restored when it is still valid — a period that no longer exists or a
 * range reaching into the future falls back to the default.
 *
 * @returns {[object, (patch: object) => void]} the current prefs and a patching setter.
 */
export const useAnalyticsPrefs = (storageKey, extraDefaults = {}) => {
  const [prefs, setPrefs] = useState(() => {
    const saved = read(storageKey);
    const customRange = isValidCustomRange(saved.customRange) ? saved.customRange : null;
    const extras = Object.fromEntries(
      Object.entries(extraDefaults).map(([key, fallback]) => [
        key,
        typeof saved[key] === typeof fallback ? saved[key] : fallback,
      ]),
    );
    return {
      ...extras,
      period:
        PERIODS.includes(saved.period) || (saved.period === CUSTOM_PERIOD && customRange)
          ? saved.period
          : "thisMonth",
      customRange,
      // Dashboards report in USD only; there is no currency switch.
      currency: "USD",
    };
  });

  const updatePrefs = useCallback(
    (patch) =>
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        write(storageKey, next);
        return next;
      }),
    [storageKey],
  );

  return [prefs, updatePrefs];
};
