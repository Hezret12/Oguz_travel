import { createFilterSlice } from './createFilterSlice';

export const cafeteriaFilterSlice = createFilterSlice({
  name: 'cafeteriaFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
    type: '',
  },
  defaultPageSize: 20,
});

export const cafeteriaFilterActions = cafeteriaFilterSlice.actions;
export const cafeteriaFilterSelectors = cafeteriaFilterSlice.selectors;
export default cafeteriaFilterSlice.reducer;
