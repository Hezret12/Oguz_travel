import dayjs from "dayjs";
import { DATE_FORMAT, toCount, toDay, trimText } from "../constants";

// For each tab: the form's default values (from a row when editing) and the
// API payload built from the submitted values.

export const getExpectedDefaults = (item) => ({
  country: item?.country || "",
  tourists_count: item?.tourists_count ?? "",
  start_date: item?.start_date || null,
  end_date: item?.end_date || null,
  route: item?.route || "",
  transport: item?.transport || "",
  note: item?.note || "",
});

export const toExpectedPayload = (values) => ({
  country: trimText(values.country),
  tourists_count: toCount(values.tourists_count),
  start_date: toDay(values.start_date),
  end_date: toDay(values.end_date),
  route: trimText(values.route),
  transport: trimText(values.transport),
  note: trimText(values.note),
});

export const getArrivalDefaults = (item) => ({
  full_name: item?.full_name || "",
  gender: item?.gender || "",
  birth_date: item?.birth_date || null,
  passport_number: item?.passport_number || "",
  citizenship: item?.citizenship || "",
  invitation_number: item?.invitation_number || "",
  voucher_number: item?.voucher_number || "",
  entry_date: item?.entry_date || null,
  exit_date: item?.exit_date || null,
  entry_border: item?.entry_border || "",
  exit_border: item?.exit_border || "",
  note: item?.note || "",
});

// Names, passports, citizenship and checkpoints are written in capitals in the report.
export const toArrivalPayload = (values) => ({
  full_name: trimText(values.full_name).toUpperCase(),
  gender: values.gender,
  birth_date: toDay(values.birth_date),
  passport_number: trimText(values.passport_number).toUpperCase(),
  citizenship: trimText(values.citizenship).toUpperCase(),
  invitation_number: trimText(values.invitation_number),
  voucher_number: trimText(values.voucher_number),
  entry_date: toDay(values.entry_date),
  exit_date: toDay(values.exit_date),
  entry_border: trimText(values.entry_border).toUpperCase(),
  exit_border: trimText(values.exit_border).toUpperCase(),
  note: trimText(values.note),
});

export const getInvitationDefaults = (item) => ({
  report_month: item?.report_month || dayjs().startOf("month").format(DATE_FORMAT),
  country: item?.country || "",
  granted_count: item?.granted_count ?? "",
  refused_count: item?.refused_count ?? "",
  pending_count: item?.pending_count ?? "",
  note: item?.note || "",
});

export const toInvitationPayload = (values) => ({
  report_month: dayjs(values.report_month).startOf("month").format(DATE_FORMAT),
  country: trimText(values.country).toUpperCase(),
  granted_count: toCount(values.granted_count),
  refused_count: toCount(values.refused_count),
  pending_count: toCount(values.pending_count),
  note: trimText(values.note),
});
