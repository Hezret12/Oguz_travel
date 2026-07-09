import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';


export function usePageFilters({ actions, selectors }) {
  const dispatch = useDispatch();

  const root        = useSelector(selectors.selectRoot);
  const applied     = useSelector(selectors.selectApplied);
  const draft       = useSelector(selectors.selectDraft);
  const queryParams = useSelector(selectors.selectQueryParams);


  const debouncedSearch = useDebounce(applied.search, 400);

  const debouncedQueryParams = useMemo(() => {
    const params = {
      ...queryParams,
      ...(applied.search !== undefined ? { search: debouncedSearch || undefined } : {}),
    };
    Object.keys(params).forEach((k) => {
      if (params[k] === undefined || params[k] === '') {
        delete params[k];
      }
    });
    return params;
  }, [queryParams, debouncedSearch, applied.search]);

  const openDrawer = useCallback(
    () => dispatch(actions.openDrawer()),
    [dispatch, actions]
  );
  const closeDrawer = useCallback(
    () => dispatch(actions.closeDrawer()),
    [dispatch, actions]
  );


  const setDraftFilter = useCallback(
    (key, value) => dispatch(actions.setDraftFilter({ key, value })),
    [dispatch, actions]
  );

  const setFilter = useCallback(
    (key, value) => dispatch(actions.setFilter({ key, value })),
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

  const openSelect = useCallback(
    (name) => dispatch(actions.openSelect(name)),
    [dispatch, actions]
  );
  const closeSelect = useCallback(
    (name) => dispatch(actions.closeSelect(name)),
    [dispatch, actions]
  );
  return {
    applied,
    draft,
    queryParams: debouncedQueryParams,
    isDrawerOpen: root.isDrawerOpen,
    openDrawer,
    closeDrawer,
    setDraftFilter,
    setFilter,

    applyFilters,
    cancelFilters,
    resetFilters,

    searchQuery: applied.search ?? '',
    setSearch,

    page:        root.page,
    pageSize:    root.pageSize,
    setPage,
    setPageSize,

    sortBy:    root.sortBy,
    sortOrder: root.sortOrder,
    setSort,

    selectsOpen: root.selectsOpen,
    openSelect,
    closeSelect,
  };
}
