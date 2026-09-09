import { createFilterSlice } from './createFilterSlice';

export const referralLetterFilterSlice = createFilterSlice({
  name: 'referralLetterFilters',
  defaultFilters: {
    search: '',
    start_date: '',
    end_date: '',
    received_opr_guid: '',
    departure_date: '',
    return_date: '',
    contract_date: '',
    status: '',
    date_time: '',
    datetime: '',
  },
  defaultPageSize: 40,
});

export const referralLetterFilterActions = referralLetterFilterSlice.actions;
export const referralLetterFilterSelectors = referralLetterFilterSlice.selectors;
export default referralLetterFilterSlice.reducer;
