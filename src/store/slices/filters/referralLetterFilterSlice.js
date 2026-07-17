import { createFilterSlice } from './createFilterSlice';

export const referralLetterFilterSlice = createFilterSlice({
  name: 'referralLetterFilters',
  defaultFilters: {
    search: '',
    currency: '',
    departure_date: '',
    returned_date: '',
  },
  defaultPageSize: 20,
});

export const referralLetterFilterActions = referralLetterFilterSlice.actions;
export const referralLetterFilterSelectors = referralLetterFilterSlice.selectors;
export default referralLetterFilterSlice.reducer;
