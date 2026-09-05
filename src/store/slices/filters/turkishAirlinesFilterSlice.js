import { createFilterSlice } from './createFilterSlice';

export const turkishAirlinesFilterSlice = createFilterSlice({
  name: 'turkishAirlinesFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
    assignment_opr_guid: '',
    receiver_opr_guid: '',
    status_guid: '',
    flight_date: '',
    is_paid: '',
    office_guid: '',
  },
  defaultPageSize: 40,
});

export const turkishAirlinesFilterActions = turkishAirlinesFilterSlice.actions;
export const turkishAirlinesFilterSelectors = turkishAirlinesFilterSlice.selectors;
export default turkishAirlinesFilterSlice.reducer;
