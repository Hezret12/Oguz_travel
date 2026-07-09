import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

export function createFilterSlice({ name, defaultFilters, defaultPageSize = 20 }) {
  const initialState = {
    applied: { ...defaultFilters },
    draft: { ...defaultFilters },
    isDrawerOpen: false,
    selectsOpen: Object.fromEntries(
      Object.keys(defaultFilters).map((k) => [k, false])
    ),
    page:     1,
    limit: defaultPageSize,
    sortBy:    '',
    sortOrder: 'asc',
  };

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      openDrawer(state) {
        state.draft = { ...state.applied };
        state.isDrawerOpen = true;
      },

      closeDrawer(state) {
        state.isDrawerOpen = false;
      },

      setDraftFilter(state, { payload: { key, value } }) {
        state.draft[key] = value;
      },

      setFilter(state, { payload: { key, value } }) {
        state.applied[key] = value;
        state.draft[key] = value;
        state.page = 1;
      },

      applyFilters(state) {
        state.applied = { ...state.draft };
        state.isDrawerOpen = false;
        state.page = 1;
      },

      resetFilters(state) {
        state.applied = { ...defaultFilters };
        state.draft   = { ...defaultFilters };
        state.isDrawerOpen = false;
        state.page     = 1;
        state.sortBy   = '';
        state.sortOrder = 'asc';
      },

      setSearch(state, { payload }) {
        state.applied.search = payload;
        state.page = 1;
      },

      setPage(state, { payload }) {
        state.page = payload;
      },

      setPageSize(state, { payload }) {
        state.limit = payload;
        state.page = 1;
      },


      setSort(state, { payload: { sortBy, sortOrder } }) {
        state.sortBy    = sortBy;
        state.sortOrder = sortOrder;
        state.page = 1;
      },

      openSelect(state, { payload }) {
        state.selectsOpen[payload] = true;
      },

      closeSelect(state, { payload }) {
        state.selectsOpen[payload] = false;
      },
    },
  });


  const selectRoot = (state) => state[name];
  const selectApplied = (state) => state[name].applied;
  const selectDraft = (state) => state[name].draft;
  const selectPage      = (state) => state[name].page;
  const selectPageSize  = (state) => state[name].limit;
  const selectSortBy    = (state) => state[name].sortBy;
  const selectSortOrder = (state) => state[name].sortOrder;

  const selectQueryParams = createSelector(
    [selectApplied, selectPage, selectPageSize, selectSortBy, selectSortOrder],
    (applied, page, limit, sortBy, sortOrder) => {
      const params = { page, limit };

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
