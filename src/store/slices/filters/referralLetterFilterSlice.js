import { createFilterSlice } from './createFilterSlice';

export const referralLetterFilterSlice = createFilterSlice({
  name: 'referralLetterFilters',
  defaultFilters: {
    search: '',
    received_opr_guid: '',
    start_departure_date: '',
    end_departure_date: '',
    start_return_date: '',
    end_return_date: '',
    start_contract_date: '',
    end_contract_date: '',
    status: '',
  },
  defaultPageSize: 40,
});

export const referralLetterFilterActions = referralLetterFilterSlice.actions;
export const referralLetterFilterSelectors = referralLetterFilterSlice.selectors;
export default referralLetterFilterSlice.reducer;
