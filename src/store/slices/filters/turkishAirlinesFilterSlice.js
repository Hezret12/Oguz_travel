import { createFilterSlice } from './createFilterSlice';

export const turkishAirlinesFilterSlice = createFilterSlice({
  name: 'turkishAirlinesFilters',
  defaultFilters: {
    search: '',
    status_guid: '',
  },
  defaultPageSize: 5,
});

export const turkishAirlinesFilterActions = turkishAirlinesFilterSlice.actions;
export const turkishAirlinesFilterSelectors = turkishAirlinesFilterSlice.selectors;
export default turkishAirlinesFilterSlice.reducer;
