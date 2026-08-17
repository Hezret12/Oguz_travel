import { createFilterSlice } from './createFilterSlice';

export const referralLetterFilterSlice = createFilterSlice({
  name: 'referralLetterFilters',
  defaultFilters: {
    search: '',
    assignment_opr_guid: '',
    receiver_opr_guid: '',
    status: '',
    datetime: '',
  },
  defaultPageSize: 10,
});

export const referralLetterFilterActions = referralLetterFilterSlice.actions;
export const referralLetterFilterSelectors = referralLetterFilterSlice.selectors;
export default referralLetterFilterSlice.reducer;
