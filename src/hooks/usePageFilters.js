import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';


export function useTableFilters({ actions, selectors }) {
  const dispatch = useDispatch();

  const applied     = useSelector(selectors.selectApplied);
  const queryParams = useSelector(selectors.selectQueryParams);
  const page        = useSelector((state) => selectors.selectRoot(state)?.page ?? 1);
  const limit       = useSelector((state) => selectors.selectRoot(state)?.limit ?? 20);
  const sortBy      = useSelector((state) => selectors.selectRoot(state)?.sortBy ?? '');
  const sortOrder   = useSelector((state) => selectors.selectRoot(state)?.sortOrder ?? 'asc');

  const debouncedSearch = useDebounce(applied?.search, 400);

  const debouncedQueryParams = useMemo(() => {
    const params = {
      ...queryParams,
    };
    if (debouncedSearch && debouncedSearch.trim() !== '') {
      params.search = debouncedSearch.trim();
    }
    return params;
  }, [queryParams, debouncedSearch]);

  const openDrawer = useCallback(
    () => dispatch(actions.openDrawer()),
    [dispatch, actions]
  );
  const setFilter = useCallback(
    (key, value) => dispatch(actions.setFilter({ key, value })),
    [dispatch, actions]
  );
  const resetFilters = useCallback(
    () => dispatch(actions.resetFilters()),
    [dispatch, actions]
  );
  const setSearch = useCallback(
    (value) => dispatch(actions.setSearch(value)),
    [dispatch, actions]
  );
  const setPage = useCallback(
    (newPage) => dispatch(actions.setPage(newPage)),
    [dispatch, actions]
  );
  const setPageSize = useCallback(
    (newPageSize) => dispatch(actions.setPageSize(newPageSize)),
    [dispatch, actions]
  );
  const setSort = useCallback(
    (sortBy, sortOrder) => dispatch(actions.setSort({ sortBy, sortOrder })),
    [dispatch, actions]
  );

  return {
    applied,
    queryParams: debouncedQueryParams,
    openDrawer,
    setFilter,
    resetFilters,
    searchQuery: applied?.search ?? '',
    setSearch,
    page,
    limit,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    setSort,
  };
}

export function useDrawerFilters({ actions, selectors }) {
  const dispatch = useDispatch();

  const isDrawerOpen = useSelector(
    (state) => selectors.selectRoot(state)?.isDrawerOpen ?? false
  );
  const draft = useSelector(selectors.selectDraft);
  const selectsOpen = useSelector(
    (state) => selectors.selectRoot(state)?.selectsOpen ?? {}
  );

  const closeDrawer = useCallback(
    () => dispatch(actions.closeDrawer()),
    [dispatch, actions]
  );
  const setDraftFilter = useCallback(
    (key, value) => dispatch(actions.setDraftFilter({ key, value })),
    [dispatch, actions]
  );
  const applyFilters = useCallback(
    () => dispatch(actions.applyFilters()),
    [dispatch, actions]
  );
  const cancelFilters = useCallback(
    () => dispatch(actions.closeDrawer()),
    [dispatch, actions]
  );
  const resetFilters = useCallback(
    () => dispatch(actions.resetFilters()),
    [dispatch, actions]
  );
  const openSelect = useCallback(
    (name) => dispatch(actions.openSelect(name)),
    [dispatch, actions]
  );
  const closeSelect = useCallback(
    (name) => dispatch(actions.closeSelect(name)),
    [dispatch, actions]
  );

  return {
    isDrawerOpen,
    draft,
    selectsOpen,
    closeDrawer,
    setDraftFilter,
    applyFilters,
    cancelFilters,
    resetFilters,
    openSelect,
    closeSelect,
  };
}

export function usePageFilters({ actions, selectors }) {
  const table = useTableFilters({ actions, selectors });
  const drawer = useDrawerFilters({ actions, selectors });
  return {
    ...table,
    ...drawer,
  };
}
