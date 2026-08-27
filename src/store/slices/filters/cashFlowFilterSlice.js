import { createFilterSlice } from './createFilterSlice';

export const cashFlowFilterSlice = createFilterSlice({
  name: 'cashFlowFilters',
  defaultFilters: {
    search: '',
    category: '',
    datetime: '',
    receiver_opr_guid: '',
    office_guid: '',
    currency: '',
    is_manual: '',
  },
  defaultPageSize: 40,
});

export const cashFlowFilterActions = cashFlowFilterSlice.actions;
export const cashFlowFilterSelectors = cashFlowFilterSlice.selectors;
export default cashFlowFilterSlice.reducer;
