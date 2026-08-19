import { createFilterSlice } from './createFilterSlice';

export const translateFilterSlice = createFilterSlice({
  name: 'translateFilters',
  defaultFilters: {
    received_day: '',
    received_time: '',
    opr_guid: '',
    completed_time: '',
    completed_day: '',
    translator_guid: '',
  },
  defaultPageSize: 20,
});

export const translateFilterActions = translateFilterSlice.actions;
export const translateFilterSelectors = translateFilterSlice.selectors;
export default translateFilterSlice.reducer;
