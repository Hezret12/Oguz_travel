import { createFilterSlice } from './createFilterSlice';


export const employeeFilterSlice = createFilterSlice({
  name: 'employeeFilters',
  defaultFilters: {
    search:     '',
    department_guid: '',
    position_guid:   '',
    office_guid:     '',
  },
  defaultPageSize: 40,
});

export const employeeFilterActions   = employeeFilterSlice.actions;
export const employeeFilterSelectors = employeeFilterSlice.selectors;
export default employeeFilterSlice.reducer;
