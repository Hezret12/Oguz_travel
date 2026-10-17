/**
 * Cache helpers for the board's per-column infinite queries
 * (key `["tasks-board", statusId, params]`, pages `{ data: Task[], meta }`).
 *
 * Invalidating an infinite query refetches every loaded page one after another, so a
 * column scrolled 15 pages deep would cost 15 sequential requests per save. Edits,
 * status moves and deletes are therefore applied to the loaded pages directly; only
 * creating a task (whose position depends on server-side filters) goes to the server.
 */

export const TASK_BOARD_KEY = "tasks-board";

const pageItems = (page) => (Array.isArray(page?.data) ? page.data : []);

const shiftTotal = (page, delta) => {
  const total = Number(page?.meta?.totalItems);
  if (!delta || !page?.meta || !Number.isFinite(total)) return page;
  return { ...page, meta: { ...page.meta, totalItems: Math.max(0, total + delta) } };
};

const findBoardTask = (entries, guid) =>
  entries
    .flatMap(([, data]) => data?.pages ?? [])
    .flatMap(pageItems)
    .find((item) => item?.guid === guid);

/**
 * Merges `patch` into a loaded card. A card whose status changes moves to the top of
 * its new column and both column badges shift by one. No-op when the card isn't loaded.
 */
export const patchTaskInBoardCache = (queryClient, guid, patch = {}) => {
  const entries = queryClient.getQueriesData({ queryKey: [TASK_BOARD_KEY] });
  const task = findBoardTask(entries, guid);
  if (!task) return;

  const sourceStatus = Number(task.status);
  const nextTask = { ...task, ...patch };
  const targetStatus = Number(nextTask.status);

  entries.forEach(([queryKey, data]) => {
    if (!data?.pages) return;
    const columnStatus = Number(queryKey[1]);

    // Same column: replace in place so the card keeps its position.
    if (sourceStatus === targetStatus) {
      if (columnStatus !== sourceStatus) return;
      queryClient.setQueryData(queryKey, {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          data: pageItems(page).map((item) => (item?.guid === guid ? nextTask : item)),
        })),
      });
      return;
    }

    const isSource = columnStatus === sourceStatus;
    const isTarget = columnStatus === targetStatus;
    if (!isSource && !isTarget) return;

    queryClient.setQueryData(queryKey, {
      ...data,
      pages: data.pages.map((page, index) => {
        const items = pageItems(page).filter((item) => item?.guid !== guid);
        return shiftTotal(
          { ...page, data: isTarget && index === 0 ? [nextTask, ...items] : items },
          index === 0 ? (isTarget ? 1 : -1) : 0,
        );
      }),
    });
  });
};

/** Drops a deleted card from every column and lowers that column's badge. */
export const removeTaskFromBoardCache = (queryClient, guid) => {
  queryClient.getQueriesData({ queryKey: [TASK_BOARD_KEY] }).forEach(([queryKey, data]) => {
    if (!data?.pages) return;
    const hadTask = data.pages.some((page) => pageItems(page).some((item) => item?.guid === guid));
    if (!hadTask) return;

    queryClient.setQueryData(queryKey, {
      ...data,
      pages: data.pages.map((page, index) =>
        shiftTotal(
          { ...page, data: pageItems(page).filter((item) => item?.guid !== guid) },
          index === 0 ? -1 : 0,
        ),
      ),
    });
  });
};

/**
 * Reloads the board from the server: every column is trimmed to its first page before
 * invalidating, so the refetch costs one request per column however far it was scrolled.
 */
export const resetTaskBoard = (queryClient) => {
  queryClient.setQueriesData({ queryKey: [TASK_BOARD_KEY] }, (data) =>
    data?.pages?.length > 1
      ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) }
      : data,
  );
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  return queryClient.invalidateQueries({ queryKey: [TASK_BOARD_KEY] });
};
