import { createFilterSlice } from './createFilterSlice';

export const officeCashFilterSlice = createFilterSlice({
  name: 'officeCashFilters',
  defaultFilters: {
    search: '',
    office_guid: '',
    type: '',
    currency: '',
    date_from: '',
    date_to: '',
  },
  defaultPageSize: 40,
});

export const officeCashFilterActions = officeCashFilterSlice.actions;
export const officeCashFilterSelectors = officeCashFilterSlice.selectors;
export default officeCashFilterSlice.reducer;
