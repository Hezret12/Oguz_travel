import { createFilterSlice } from './createFilterSlice';

export const b2bFilterSlice = createFilterSlice({
  name: 'b2bFilters',
  defaultFilters: {
    search: '',
    datetime: '',
    assignment_opr_guid: '',
    receiver_opr_guid: '',
    status_guid: '',
    travel_type: '',
    flight_date: '',
    is_paid: '',
  },
  defaultPageSize: 40,
});

export const b2bFilterActions = b2bFilterSlice.actions;
export const b2bFilterSelectors = b2bFilterSlice.selectors;
export default b2bFilterSlice.reducer;
