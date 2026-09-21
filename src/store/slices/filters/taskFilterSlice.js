import { createFilterSlice } from './createFilterSlice';

export const taskFilterSlice = createFilterSlice({
  name: 'taskFilters',
  defaultFilters: {
    search: '',
    status: '',
    priority: '',
    date_from: '',
    date_to: '',
    opr_guid: '',
  },
  defaultPageSize: 40,
});

export const taskFilterActions = taskFilterSlice.actions;
export const taskFilterSelectors = taskFilterSlice.selectors;
export default taskFilterSlice.reducer;
