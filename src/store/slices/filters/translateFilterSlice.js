import { createFilterSlice } from './createFilterSlice';

export const translateFilterSlice = createFilterSlice({
  name: 'translateFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
    translator_guid: '',
    status: '',
  },
  defaultPageSize: 20,
});

export const translateFilterActions = translateFilterSlice.actions;
export const translateFilterSelectors = translateFilterSlice.selectors;
export default translateFilterSlice.reducer;
