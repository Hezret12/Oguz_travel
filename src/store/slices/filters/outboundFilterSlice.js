import { createFilterSlice } from './createFilterSlice';

export const outboundFilterSlice = createFilterSlice({
  name: 'outboundFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
    office_guid: '',
    opr_guid: '',
  },
  defaultPageSize: 20,
});

export const outboundFilterActions = outboundFilterSlice.actions;
export const outboundFilterSelectors = outboundFilterSlice.selectors;
export default outboundFilterSlice.reducer;
