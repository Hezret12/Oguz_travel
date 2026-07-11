import { createFilterSlice } from './createFilterSlice';

export const b2bFilterSlice = createFilterSlice({
  name: 'b2bFilters',
  defaultFilters: {
    search: '',
    issueDate: '',
    flightDate: '',
    status_guid: '',
    payment_types: '',
  },
  defaultPageSize: 5,
});

export const b2bFilterActions = b2bFilterSlice.actions;
export const b2bFilterSelectors = b2bFilterSlice.selectors;
export default b2bFilterSlice.reducer;
