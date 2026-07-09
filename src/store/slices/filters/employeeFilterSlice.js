import { createFilterSlice } from './createFilterSlice';

/**
 * Employee module filter slice.
 *
 * To add a new module filter, copy this file, change `name` and `defaultFilters`,
 * then register the reducer in store/index.js.
 *
 * Filter fields:
 *  - search     → header search bar (debounced in usePageFilters)
 *  - department → FilterDrawer dropdown
 *  - position   → FilterDrawer dropdown
 *  - office     → FilterDrawer dropdown
 */
export const employeeFilterSlice = createFilterSlice({
  name: 'employeeFilters',
  defaultFilters: {
    search:     '',
    department: '',
    position:   '',
    office:     '',
  },
  defaultPageSize: 20,
});

export const employeeFilterActions   = employeeFilterSlice.actions;
export const employeeFilterSelectors = employeeFilterSlice.selectors;
export default employeeFilterSlice.reducer;
