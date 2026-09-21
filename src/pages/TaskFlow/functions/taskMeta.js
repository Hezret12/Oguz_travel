import dayjs from "dayjs";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import {
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from "../../../functions/statusChipConfigs";

/**
 * Single source of truth for the TaskFlow board columns, the table's status
 * cell, the quick status menus and both modals' selects. Colors and labels come
 * from the centralized configs in `statusChipConfigs.js`; only the icons live
 * here, because that file stays free of component imports.
 */

const STATUS_ICONS = {
  1: RadioButtonUncheckedIcon,
  2: RadioButtonCheckedIcon,
  3: CheckCircleRoundedIcon,
};

export const TASK_STATUS_ITEMS = [1, 2, 3].map((id) => ({
  id,
  color: TASK_STATUS_CONFIG[id].color,
  labelKey: TASK_STATUS_CONFIG[id].labelKey,
  Icon: STATUS_ICONS[id],
}));

export const getTaskStatus = (status) => {
  const id = Number(status) || 1;
  return TASK_STATUS_ITEMS.find((item) => item.id === id) || TASK_STATUS_ITEMS[0];
};

const toPriorityItem = (value) => ({
  value,
  color: TASK_PRIORITY_CONFIG[value.toUpperCase()].color,
  labelKey: TASK_PRIORITY_CONFIG[value.toUpperCase()].labelKey,
});

/** Priorities offered in the filter and the create/edit selects. */
export const TASK_PRIORITY_ITEMS = ["urgent", "medium"].map(toPriorityItem);

// `low` is no longer selectable but older tasks still carry it, so it stays displayable.
const DISPLAY_PRIORITY_ITEMS = [...TASK_PRIORITY_ITEMS, toPriorityItem("low")];

export const DEFAULT_TASK_PRIORITY = "medium";

/** A priority the selects can show; anything else (e.g. legacy `low`) falls back to the default. */
export const toSelectablePriority = (priority) => {
  const key = String(priority || "").toLowerCase();
  return TASK_PRIORITY_ITEMS.some((item) => item.value === key) ? key : DEFAULT_TASK_PRIORITY;
};

export const getTaskPriority = (priority) => {
  const key = String(priority || "").toLowerCase();
  return (
    DISPLAY_PRIORITY_ITEMS.find((item) => item.value === key) ||
    DISPLAY_PRIORITY_ITEMS.find((item) => item.value === DEFAULT_TASK_PRIORITY)
  );
};

/**
 * Assignees arrive under different keys depending on the endpoint:
 * `assignees` (flat `{ guid, fullName }`) from `get-all-tasks`, and
 * `empltaskAssignee` (`{ user: { employee } }`) from add/update responses,
 * which `useUpdate` merges into the cached list row. The first key that is
 * present wins even when empty, so clearing assignees never falls back to a
 * stale list. `admuser` is the task's creator, not an assignee.
 */
export const getTaskAssignees = (task) => {
  if (!task) return [];

  const list = [task.empltaskAssignee, task.assignees].find(Array.isArray);
  return list ? list.filter(Boolean) : [];
};

/**
 * Maps the TaskFlow filter slice onto the `/messages/get-all-tasks` query:
 * - the slice stores the assignee as `opr_guid`, the backend reads `assignee_guid`;
 * - the period (`date_from` / `date_to`, local `YYYY-MM-DD` days, both inclusive) becomes the
 *   exact `[date_from, date_to)` instants; the backend returns tasks whose window overlaps it.
 * - a legacy `due_date` left in the slice is dropped.
 */
export const toTaskApiParams = ({
  opr_guid,
  status,
  date_from,
  date_to,
  ...rest
} = {}) => {
  const params = { ...rest };
  delete params.due_date;
  if (opr_guid) params.assignee_guid = opr_guid;
  const statusId = Number(status);
  if (TASK_STATUS_ITEMS.some((item) => item.id === statusId)) params.status = statusId;
  const from = date_from ? dayjs(date_from) : null;
  if (from?.isValid()) params.date_from = from.startOf("day").toISOString();
  const to = date_to ? dayjs(date_to) : null;
  if (to?.isValid()) params.date_to = to.startOf("day").add(1, "day").toISOString();
  return params;
};

export const toIsoOrNull = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).toISOString() : null;

/** The task window; tasks saved before `start_date`/`end_date` existed only have `due_date`. */
export const getTaskStart = (task) => task?.start_date || null;
export const getTaskEnd = (task) => task?.end_date || task?.due_date || task?.dueDate || null;

export const isTaskOverdue = (task) => {
  const end = getTaskEnd(task);
  return Boolean(end) && Number(task.status) !== 3 && dayjs(end).isBefore(dayjs());
};

// The year is only spelled out when it isn't the current one, to keep cards compact.
const formatWindowPoint = (date) =>
  date.format(date.isSame(dayjs(), "year") ? "DD.MM HH:mm" : "DD.MM.YYYY HH:mm");

/**
 * Display parts of a task window, rendered as `start → end`. A window inside one day
 * drops the repeated date from the end (`21.09 09:00 → 18:00`). Missing sides are `null`.
 */
export const getTaskWindowParts = (task) => {
  const start = getTaskStart(task) ? dayjs(getTaskStart(task)) : null;
  const end = getTaskEnd(task) ? dayjs(getTaskEnd(task)) : null;
  const validStart = start?.isValid() ? start : null;
  const validEnd = end?.isValid() ? end : null;
  if (!validStart && !validEnd) return null;

  return {
    start: validStart ? formatWindowPoint(validStart) : null,
    end: validEnd
      ? validStart && validStart.isSame(validEnd, "day")
        ? validEnd.format("HH:mm")
        : formatWindowPoint(validEnd)
      : null,
  };
};

export const getTaskAttachments = (task) => {
  if (Array.isArray(task?.images)) return task.images;
  if (Array.isArray(task?.attachments)) return task.attachments;
  return [];
};

/**
 * The user GUID (`tbl_users.guid`) behind an assignee entry. In
 * `empltaskAssignee` rows `guid` is the assignment record's own id, so
 * `assignee_guid` / `user.guid` must win; flat `assignees` rows only have `guid`.
 */
export const getAssigneeUserGuid = (a) =>
  typeof a === "string" ? a : a?.assignee_guid || a?.user?.guid || a?.guid;

/** Resolves the assignee GUIDs a task form should start from. */
export const getTaskAssigneeGuids = (task) =>
  getTaskAssignees(task)
    .map(getAssigneeUserGuid)
    .filter((guid) => typeof guid === "string" && guid.length > 0);
