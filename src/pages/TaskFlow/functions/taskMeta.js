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

export const TASK_PRIORITY_ITEMS = ["urgent", "medium", "low"].map((value) => ({
  value,
  color: TASK_PRIORITY_CONFIG[value.toUpperCase()].color,
  labelKey: TASK_PRIORITY_CONFIG[value.toUpperCase()].labelKey,
}));

export const DEFAULT_TASK_PRIORITY = "medium";

export const getTaskPriority = (priority) => {
  const key = String(priority || "").toLowerCase();
  return (
    TASK_PRIORITY_ITEMS.find((item) => item.value === key) ||
    TASK_PRIORITY_ITEMS.find((item) => item.value === DEFAULT_TASK_PRIORITY)
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
 * - `due_date` (a local `YYYY-MM-DD`) becomes the exact `[due_from, due_to)` instants of
 *   that local day, because due dates are saved as the UTC instant of local midnight.
 */
export const toTaskApiParams = ({ opr_guid, status, due_date, ...rest } = {}) => {
  const params = { ...rest };
  if (opr_guid) params.assignee_guid = opr_guid;
  const statusId = Number(status);
  if (TASK_STATUS_ITEMS.some((item) => item.id === statusId)) params.status = statusId;
  const day = due_date ? dayjs(due_date) : null;
  if (day?.isValid()) {
    params.due_from = day.startOf("day").toISOString();
    params.due_to = day.startOf("day").add(1, "day").toISOString();
  }
  return params;
};

export const getTaskAttachments = (task) => {
  if (Array.isArray(task?.images)) return task.images;
  if (Array.isArray(task?.attachments)) return task.attachments;
  return [];
};

/** Resolves the assignee GUIDs a task form should start from. */
export const getTaskAssigneeGuids = (task) =>
  getTaskAssignees(task)
    .map((a) => a?.guid || a?.user?.guid || a?.assignee_guid || a)
    .filter((guid) => typeof guid === "string" && guid.length > 0);
