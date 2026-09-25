import { createFilterSlice } from './createFilterSlice';

export const cafeteriaFilterSlice = createFilterSlice({
  name: 'cafeteriaFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
    type: '',
    office_guid: '',
  },
  defaultPageSize: 40,
});

export const cafeteriaFilterActions = cafeteriaFilterSlice.actions;
export const cafeteriaFilterSelectors = cafeteriaFilterSlice.selectors;
export default cafeteriaFilterSlice.reducer;
