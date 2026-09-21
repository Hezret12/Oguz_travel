import { createFilterSlice } from './createFilterSlice';

// Letter stock (ÝH batches) page. Kept apart from `referralLetterFilters` so the two pages
// don't share search/filters.
export const letterStockFilterSlice = createFilterSlice({
  name: 'letterStockFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
  },
  defaultPageSize: 40,
});

export const letterStockFilterActions = letterStockFilterSlice.actions;
export const letterStockFilterSelectors = letterStockFilterSlice.selectors;
export default letterStockFilterSlice.reducer;
