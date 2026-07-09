import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

/**
 * Generic filter slice factory.
 *
 * Creates a fully-featured Redux slice for any page that needs filtering,
 * pagination, sorting and a filter drawer — without duplicating any logic.
 *
 * @param {string}  name            - Unique slice name, e.g. 'employeeFilters'
 * @param {object}  defaultFilters  - Default filter values, e.g. { search:'', department:'' }
 *                                    A 'search' key is treated as the header search field.
 * @param {number}  defaultPageSize - Rows per page (default: 20)
 *
 * @returns RTK slice + { selectors } object
 *
 * @example
 * export const employeeFilterSlice = createFilterSlice({
 *   name: 'employeeFilters',
 *   defaultFilters: { search: '', department: '', position: '', office: '' },
 * });
 */
export function createFilterSlice({ name, defaultFilters, defaultPageSize = 20 }) {
  // ── Initial state ──────────────────────────────────────────────────────────
  const initialState = {
    /**
     * Applied filters — what the API currently sees.
     * Only updated on "Apply" or "Reset". Never modified mid-drawer.
     */
    applied: { ...defaultFilters },

    /**
     * Draft filters — being edited inside the FilterDrawer.
     * Copied from `applied` when the drawer opens.
     * Discarded on "Cancel". Merged into `applied` on "Apply".
     */
    draft: { ...defaultFilters },

    // Drawer visibility
    isDrawerOpen: false,

    // Track which Select dropdowns are open inside the drawer
    selectsOpen: Object.fromEntries(
      Object.keys(defaultFilters).map((k) => [k, false])
    ),

    // Server-side pagination
    page:     1,
    pageSize: defaultPageSize,

    // Server-side sorting
    sortBy:    '',
    sortOrder: 'asc', // 'asc' | 'desc'
  };

  // ── Slice ──────────────────────────────────────────────────────────────────
  const slice = createSlice({
    name,
    initialState,
    reducers: {
      // ── Drawer lifecycle ───────────────────────────────────────────────────

      /** Open the drawer and snapshot applied → draft so edits don't leak. */
      openDrawer(state) {
        state.draft = { ...state.applied };
        state.isDrawerOpen = true;
      },

      /** Close the drawer without committing draft changes. */
      closeDrawer(state) {
        state.isDrawerOpen = false;
      },

      // ── Draft editing (inside drawer, not yet applied) ─────────────────────

      /**
       * Update a single draft filter field.
       * @param {{ key: string, value: string }} payload
       */
      setDraftFilter(state, { payload: { key, value } }) {
        state.draft[key] = value;
      },

      setFilter(state, { payload: { key, value } }) {
        state.applied[key] = value;
        state.draft[key] = value;
        state.page = 1;
      },

      // ── Commit / Reset ─────────────────────────────────────────────────────

      /**
       * Commit the draft → applied and close the drawer.
       * Automatically resets page to 1 so users see results from the start.
       */
      applyFilters(state) {
        state.applied = { ...state.draft };
        state.isDrawerOpen = false;
        state.page = 1;
      },

      /**
       * Reset all filters, pagination and sorting back to their defaults.
       * Closes the drawer if it was open.
       */
      resetFilters(state) {
        state.applied = { ...defaultFilters };
        state.draft   = { ...defaultFilters };
        state.isDrawerOpen = false;
        state.page     = 1;
        state.sortBy   = '';
        state.sortOrder = 'asc';
      },

      // ── Header search ──────────────────────────────────────────────────────

      /**
       * Update the search field in `applied` directly (no drawer needed).
       * Resets to page 1. Debouncing is handled in usePageFilters.
       * @param {string} payload - search string
       */
      setSearch(state, { payload }) {
        state.applied.search = payload;
        state.page = 1;
      },

      // ── Pagination ─────────────────────────────────────────────────────────

      /** @param {number} payload - 1-based page number */
      setPage(state, { payload }) {
        state.page = payload;
      },

      /** @param {number} payload - rows per page */
      setPageSize(state, { payload }) {
        state.pageSize = payload;
        state.page = 1;
      },

      // ── Sorting ────────────────────────────────────────────────────────────

      /**
       * @param {{ sortBy: string, sortOrder: 'asc'|'desc' }} payload
       */
      setSort(state, { payload: { sortBy, sortOrder } }) {
        state.sortBy    = sortBy;
        state.sortOrder = sortOrder;
        state.page = 1;
      },

      // ── Select open/close state ────────────────────────────────────────────

      /** @param {string} payload - filter key name */
      openSelect(state, { payload }) {
        state.selectsOpen[payload] = true;
      },

      /** @param {string} payload - filter key name */
      closeSelect(state, { payload }) {
        state.selectsOpen[payload] = false;
      },
    },
  });

  // ── Selectors ──────────────────────────────────────────────────────────────

  /** Full slice root — for accessing isDrawerOpen, selectsOpen, page, etc. */
  const selectRoot = (state) => state[name];

  /** Applied filters (what the API sees) */
  const selectApplied = (state) => state[name].applied;

  /** Draft filters (being edited in the drawer) */
  const selectDraft = (state) => state[name].draft;

  // Individual primitive selectors — stable references, safe to use as createSelector inputs
  const selectPage      = (state) => state[name].page;
  const selectPageSize  = (state) => state[name].pageSize;
  const selectSortBy    = (state) => state[name].sortBy;
  const selectSortOrder = (state) => state[name].sortOrder;

  /**
   * Memoised selector — builds the API query params object from applied state.
   *
   * Uses createSelector (reselect) so it returns the same object reference as
   * long as the inputs haven't changed. This prevents useSelector from
   * triggering a re-render on every unrelated state update.
   *
   * Rules:
   * - Empty strings are omitted (no ?department= clutter)
   * - sortBy + sortOrder are combined into a single `sort` param: "createdAt_desc"
   * - `search` is included as-is; debouncing is applied in usePageFilters
   *
   * @example
   * // applied: { search:'John', department:'HR', position:'', office:'' }
   * // → { search:'John', department:'HR', page:1, pageSize:20 }
   */
  const selectQueryParams = createSelector(
    [selectApplied, selectPage, selectPageSize, selectSortBy, selectSortOrder],
    (applied, page, pageSize, sortBy, sortOrder) => {
      const params = { page, pageSize };

      Object.entries(applied).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params[key] = value;
        }
      });

      if (sortBy) {
        params.sort = `${sortBy}_${sortOrder}`;
      }

      return params;
    }
  );

  return {
    ...slice,
    selectors: {
      selectRoot,
      selectApplied,
      selectDraft,
      selectQueryParams,
    },
  };
}
