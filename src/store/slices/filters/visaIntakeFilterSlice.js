import { createFilterSlice } from './createFilterSlice';

export const visaIntakeFilterSlice = createFilterSlice({
  name: 'visaIntakeFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
    operator_guid: '',
    status: '',
    visa_category: '',
  },
  defaultPageSize: 40,
});

export const visaIntakeFilterActions = visaIntakeFilterSlice.actions;
export const visaIntakeFilterSelectors = visaIntakeFilterSlice.selectors;
export default visaIntakeFilterSlice.reducer;
