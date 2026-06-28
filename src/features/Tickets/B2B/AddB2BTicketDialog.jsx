import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { CustomDialog } from '../../../components/Dialog/CustomDialog';
import { CustomDialogHeader } from '../../../components/Dialog/CustomDialogHeader';
import { CustomForm } from '../../../components/Dialog/CustomForm';
import { FooterButton } from '../../../components/Dialog/FooterButton';
import CustomTextField from '../../../components/CustomTextField';
import CustomSelect from '../../../components/CustomSelect';
import GlobalClientAutocomplete from '../../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete';
import { useLocale } from '../../../hooks/useLocale';
import { useValidSchema } from '../../../functions/useValidShema';

const STATUS_OPTIONS = [
  { label: 'Sale', value: 'SALE' },
  { label: 'Reissue', value: 'REISSUE' },
  { label: 'Refund', value: 'REFUND' },
];

const TRIP_TYPE_OPTIONS = [
  { label: 'One Way', value: 'ONE WAY' },
  { label: 'Round Trip', value: 'ROUND TRIP' },
];

const CABIN_OPTIONS = [
  { label: 'ECO', value: 'ECO' },
  { label: 'ECO/Q', value: 'ECO/Q' },
  { label: 'BUSINESS', value: 'BUSINESS' },
  { label: 'EXTRA', value: 'EXTRA' },
];

const AddB2BTicketDialog = ({ open, onClose, onSave, ticket }) => {
  const { t } = useLocale();
  const { addB2BTicket } = useValidSchema();
  const [loading, setLoading] = useState(false);

  const defaultValues = useMemo(
    () => ({
      clientId: '',
      issueDate: '',
      operator: '',
      office: '',
      operatorTwo: '',
      agent: '',
      pnr: '',
      status: 'SALE',
      airline: '',
      route: '',
      cabinClass: '',
      tripType: '',
      flightDate: '',
      netFare: '',
      saleFare: '',
      card: '',
      note: '',
      ...ticket,
    }),
    [ticket],
  );

  const { control, handleSubmit, reset } = useForm({
    defaultValues,
    resolver: yupResolver(addB2BTicket),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const closeDialog = () => {
    onClose?.();
    reset(defaultValues);
  };

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave?.(data);
      toast.success(t('ticket.b2b.saveSuccess') ?? 'Ticket saved successfully!');
      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error(t('ticket.b2b.saveError') ?? 'An error occurred while saving the ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog widthX={960} open={open} close={closeDialog}>
      <Box
        sx={{
          height: 'min(860px, calc(100vh - 48px))',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <CustomDialogHeader
          variant="h5"
          title={ticket ? (t('ticket.b2b.editTicket') ?? 'Edit B2B Ticket') : (t('ticket.b2b.addTicket') ?? 'Add B2B Ticket')}
        />

        <CustomForm
          handleSubmit={handleSubmit(submitHandler)}
          sx={{
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              pr: 1,
              mr: -1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2.5,
            }}
          >
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <GlobalClientAutocomplete
                control={control}
                name="clientId"
                label={t('ticket.b2b.client') ?? 'Client'}
                placeholder={t('ticket.b2b.clientPlaceholder') ?? 'Search client...'}
              />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="issueDate" control={control} type="date" label={t('ticket.b2b.issueDate') ?? 'Issue Date'} InputLabelProps={{ shrink: true }} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="operator" control={control} label={t('ticket.b2b.operator') ?? 'Operator'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="office" control={control} label={t('ticket.b2b.office') ?? 'Office'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="operatorTwo" control={control} label={t('ticket.b2b.operatorTwo') ?? 'Operator 2'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="agent" control={control} label={t('ticket.b2b.agent') ?? 'Agent'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="pnr" control={control} label={t('ticket.b2b.pnr') ?? 'PNR'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomSelect name="status" control={control} label={t('ticket.b2b.status') ?? 'Status'} options={STATUS_OPTIONS} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="airline" control={control} label={t('ticket.b2b.airline') ?? 'Airline'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="route" control={control} label={t('ticket.b2b.route') ?? 'Route'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomSelect name="cabinClass" control={control} label={t('ticket.b2b.cabinClass') ?? 'Class'} options={CABIN_OPTIONS} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomSelect name="tripType" control={control} label={t('ticket.b2b.tripType') ?? 'Trip Type'} options={TRIP_TYPE_OPTIONS} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="flightDate" control={control} type="date" label={t('ticket.b2b.flightDate') ?? 'Flight Date'} InputLabelProps={{ shrink: true }} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="netFare" control={control} type="number" label={t('ticket.b2b.netFare') ?? 'Net Fare'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="saleFare" control={control} type="number" label={t('ticket.b2b.saleFare') ?? 'Sale Fare'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
              <CustomTextField name="card" control={control} label={t('ticket.b2b.card') ?? 'Card'} />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%' } }}>
              <CustomTextField name="note" control={control} multiline rows={3} label={t('ticket.b2b.note') ?? 'Note'} />
            </Box>
          </Box>

          <FooterButton loading={loading} onCancel={closeDialog} type="submit" sx={{ mt: 3, flexShrink: 0 }} />
        </CustomForm>
      </Box>
    </CustomDialog>
  );
};

export default AddB2BTicketDialog;
