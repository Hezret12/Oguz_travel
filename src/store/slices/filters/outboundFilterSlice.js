import { createFilterSlice } from './createFilterSlice';

export const outboundFilterSlice = createFilterSlice({
  name: 'outboundFilters',
  defaultFilters: {
    search: '',
    application_date: null,
    opr_guid: null,
    prepared_opr_guid: null,
    is_paid: null,
    system: null,
    meal_plan: null,
    ticket_type: null,
    train_type: null,
    transfer_type: null,
    machine_type: null,
    partner: null,
  },
  defaultPageSize: 40,
});

export const outboundFilterActions = outboundFilterSlice.actions;
export const outboundFilterSelectors = outboundFilterSlice.selectors;
export default outboundFilterSlice.reducer;
