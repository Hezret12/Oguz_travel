import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import { useCallback } from "react";
import { BASE_URL } from "../api/axiosIntance";

export const getFileUrl = (pathOrUrl) => {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return "";
  const trimmed = pathOrUrl.trim();
  if (
    !trimmed ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "[object Object]"
  ) {
    return "";
  }
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const serverRoot = (BASE_URL || "").replace(/\/api(\/v\d+)?\/?$/i, "");
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${serverRoot}${cleanPath}`;
};

// Handle error
export function handleError(msg, error) {
  console.error(msg, error);
  hdlErrResMsg(error);
}

// Handle error response message
export function hdlErrResMsg(error) {
  toast.error(
    error?.response?.data?.message || error?.message || "Unknown error",
  );
}

// Handle success response message
export function hdlSuccessResMsg(response) {
  toast.success(response?.data?.message || response?.message);
}

// Handle response data
export function hdlResData(response, key) {
  return response?.data[key];
}

export function hdlCloseTableEditModal(table) {
  table.setEditingRow(null);
}

// Handle installed date
export function handleInstDate(value) {
  return value ? dayjs(value) : null;
}

export const useDateFormat = () => {
  const format = "DD.MM.YYYY HH:mm";
  const dateOnlyFormat = "DD.MM.YYYY";

  const formatChange = useCallback((date, options = {}) => {
    if (!date) return "";
    const parsed = dayjs(date);
    if (!parsed.isValid()) return "";
    if (options.smartToday && parsed.isSame(dayjs(), "day")) {
      return parsed.format("HH:mm");
    }
    return parsed.format(options.dateOnly ? dateOnlyFormat : format);
  }, []);

  return { format, dateOnlyFormat, formatChange };
};

export const useUserInfo = () => {
  const { user, isAuthenticated } = useAuth();

  return {
    userIsLogin: isAuthenticated && Boolean(user?.user_is_login),
    userIsAdmin: Boolean(user?.user_is_admin),
    role: user?.role,
  };
};

/**
 * Format a numeric value with locale-aware thousand separators.
 * Returns "—" for non-numeric/null values.
 */
export const formatNumber = (val) => {
  const num = Number(val);
  if (!num && num !== 0) return "—";
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

/**
 * Format a numeric value in a compact human-readable form (e.g., 1.5K, 2.3M).
 * Returns "0" for non-numeric/null values.
 */
export const formatCompact = (val) => {
  const num = Number(val);
  if (!num && num !== 0) return "0";
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

/**
 * Standard translated payment status options (boolean values for forms)
 */
export const getBooleanPaymentOptions = (t) => [
  { label: t("paymentPaid"), value: true },
  { label: t("paymentCredit"), value: false },
];

/**
 * Standard translated payment status options (string values for filters)
 */
export const getBooleanPaymentFilterOptions = (t) => [
  { label: t("paymentPaid"), value: "true" },
  { label: t("paymentCredit"), value: "false" },
];

