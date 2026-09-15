import { createFilterSlice } from './createFilterSlice';

export const translateFilterSlice = createFilterSlice({
  name: 'translateFilters',
  defaultFilters: {
    start_received_day: '',
    end_received_day: '',
    received_time: '',
    opr_guid: '',
    completed_time: '',
    start_completed_day: '',
    end_completed_day: '',
    translator_guid: '',
  },
  defaultPageSize: 30,
});

export const translateFilterActions = translateFilterSlice.actions;
export const translateFilterSelectors = translateFilterSlice.selectors;
export default translateFilterSlice.reducer;
