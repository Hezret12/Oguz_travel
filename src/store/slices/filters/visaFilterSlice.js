import { createFilterSlice } from './createFilterSlice';

export const visaFilterSlice = createFilterSlice({
  name: 'visaFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
    package_guid: '',
    service_guid: '',
    received_opr_guid: '',
  },
  defaultPageSize: 20,
});

export const visaFilterActions = visaFilterSlice.actions;
export const visaFilterSelectors = visaFilterSlice.selectors;
export default visaFilterSlice.reducer;
