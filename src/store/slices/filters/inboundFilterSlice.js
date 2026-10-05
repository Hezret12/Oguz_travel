import { createFilterSlice } from './createFilterSlice';

export const inboundFilterSlice = createFilterSlice({
  name: 'inboundFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
  },
  defaultPageSize: 40,
});

export const inboundFilterActions = inboundFilterSlice.actions;
export const inboundFilterSelectors = inboundFilterSlice.selectors;
export default inboundFilterSlice.reducer;
