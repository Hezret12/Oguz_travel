import { createFilterSlice } from './createFilterSlice';

export const cashFlowFilterSlice = createFilterSlice({
  name: 'cashFlowFilters',
  defaultFilters: {
    search: '',
    transaction_type: '',
    cash_box_guid: '',
    category: '',
    start_date: '',
    end_date: '',
  },
  defaultPageSize: 40,
});

export const cashFlowFilterActions = cashFlowFilterSlice.actions;
export const cashFlowFilterSelectors = cashFlowFilterSlice.selectors;
export default cashFlowFilterSlice.reducer;
