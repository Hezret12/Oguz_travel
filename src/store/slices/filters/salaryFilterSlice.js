import dayjs from 'dayjs';
import { createFilterSlice } from './createFilterSlice';

export const salaryFilterSlice = createFilterSlice({
  name: 'salaryFilters',
  defaultFilters: {
    search: '',
    month: dayjs().format('YYYY-MM'),
    office_guid: '',
  },
  defaultPageSize: 50,
});

export const salaryFilterActions = salaryFilterSlice.actions;
export const salaryFilterSelectors = salaryFilterSlice.selectors;
export default salaryFilterSlice.reducer;
