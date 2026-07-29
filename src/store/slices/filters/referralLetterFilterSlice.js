import { createFilterSlice } from './createFilterSlice';

export const referralLetterFilterSlice = createFilterSlice({
  name: 'referralLetterFilters',
  defaultFilters: {
    search: '',
    received_opr_guid: '',
    departure_date: '',
    return_date: '',
    contract_date: '',
  },
  defaultPageSize: 10,
});

export const referralLetterFilterActions = referralLetterFilterSlice.actions;
export const referralLetterFilterSelectors = referralLetterFilterSlice.selectors;
export default referralLetterFilterSlice.reducer;
