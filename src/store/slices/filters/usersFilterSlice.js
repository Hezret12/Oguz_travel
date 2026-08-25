import { createFilterSlice } from './createFilterSlice';

export const usersFilterSlice = createFilterSlice({
  name: 'usersFilters',
  defaultFilters: {
    search: '',
  },
  defaultPageSize: 30,
});

export const usersFilterActions = usersFilterSlice.actions;
export const usersFilterSelectors = usersFilterSlice.selectors;
export default usersFilterSlice.reducer;
