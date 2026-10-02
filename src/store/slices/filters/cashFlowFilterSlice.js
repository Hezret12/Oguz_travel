import { createFilterSlice } from './createFilterSlice';

export const cashFlowFilterSlice = createFilterSlice({
  name: 'cashFlowFilters',
  defaultFilters: {
    search: '',
    source: '',
    type: '',
    date_from: '',
    date_to: '',
    receiver_opr_guid: '',
    office_guid: '',
    currency: '',
  },
  defaultPageSize: 40,
});

export const cashFlowFilterActions = cashFlowFilterSlice.actions;
export const cashFlowFilterSelectors = cashFlowFilterSlice.selectors;
export default cashFlowFilterSlice.reducer;
