import { createFilterSlice } from './createFilterSlice';

export const clientFilterSlice = createFilterSlice({
  name: 'clientFilters',
  defaultFilters: {
    search: '',
    dateOfBirth: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    gender: '',
  },
  defaultPageSize: 40,
});

export const clientFilterActions = clientFilterSlice.actions;
export const clientFilterSelectors = clientFilterSlice.selectors;
export default clientFilterSlice.reducer;
