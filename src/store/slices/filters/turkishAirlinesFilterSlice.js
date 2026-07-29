import { createFilterSlice } from './createFilterSlice';

export const turkishAirlinesFilterSlice = createFilterSlice({
  name: 'turkishAirlinesFilters',
  defaultFilters: {
    search: '',
    datetime: '',
    assignment_opr_guid: '',
    receiver_opr_guid: '',
    status_guid: '',
    flight_date: '',
    is_paid: '',
    office_guid: '',
  },
  defaultPageSize: 10,
});

export const turkishAirlinesFilterActions = turkishAirlinesFilterSlice.actions;
export const turkishAirlinesFilterSelectors = turkishAirlinesFilterSlice.selectors;
export default turkishAirlinesFilterSlice.reducer;
