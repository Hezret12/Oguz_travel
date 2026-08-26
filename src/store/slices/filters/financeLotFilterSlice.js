import { createFilterSlice } from './createFilterSlice';

export const financeLotFilterSlice = createFilterSlice({
  name: 'financeLotFilters',
  defaultFilters: {
    search: '',
    service_type: '',
    supplier_guid: '',
    status: '',
    start_date: '',
    end_date: '',
  },
  defaultPageSize: 40,
});

export const financeLotFilterActions = financeLotFilterSlice.actions;
export const financeLotFilterSelectors = financeLotFilterSlice.selectors;
export default financeLotFilterSlice.reducer;
