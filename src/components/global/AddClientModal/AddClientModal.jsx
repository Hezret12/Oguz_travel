import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useLocale } from '../../../hooks/useLocale';
import { useValidSchema } from '../../../functions/useValidShema';
import { CustomDialog } from '../../Dialog/CustomDialog';
import { CustomDialogHeader } from '../../Dialog/CustomDialogHeader';
import { CustomForm } from '../../Dialog/CustomForm';
import { FooterButton } from '../../Dialog/FooterButton';
import CustomTextField from '../../CustomTextField';
import CustomSelect from '../../CustomSelect';
import PhoneNumberField from '../../inputs/PhoneNumber';
import { closeAddClientModal, selectAddClientModal } from '../../../store/slices/modalSlice';
import { useCreateClientMutation } from '../../../features/Clients/hooks/useClientsQuery';

const AddClientModal = () => {
  const dispatch = useDispatch();
  const { t } = useLocale();
  const { addClient } = useValidSchema();
  const { open, initialValues, onCreated } = useSelector(selectAddClientModal);
  const [loading, setLoading] = useState(false);
  const createClientMutation = useCreateClientMutation();

  const defaultValues = useMemo(
    () => ({
      fullName: '',
      phoneNumber: '',
      dateOfBirth: '',
      passportNumber: '',
      passportExpiryDate: '',
      passportCountryOfIssue: '',
      gender: '',
      ...initialValues,
    }),
    [initialValues],
  );

  const { control, handleSubmit, reset } = useForm({
    defaultValues,
    resolver: yupResolver(addClient),
    mode: 'onSubmit',
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const closeModal = () => {
    dispatch(closeAddClientModal());
    reset(defaultValues);
  };

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const createdClient = await createClientMutation.mutateAsync(data);
      toast.success(t('clients.addSuccess', 'Client added successfully!'));
      onCreated?.(createdClient);
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(t('clients.addError', 'An error occurred while saving client.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog widthX={820} open={open} close={closeModal}>
      <CustomDialogHeader
        variant="h5"
        title={t('clients.add', 'Add Client')}
      />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2.5,
          }}
        >
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomTextField
              name="fullName"
              control={control}
              label={t('clients.columns.fullName', 'Full Name')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <PhoneNumberField
              control={control}
              name="phoneNumber"
              label={t('clients.columns.phoneNumber', 'Phone Number')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomTextField
              name="dateOfBirth"
              control={control}
              type="date"
              label={t('clients.columns.dateOfBirth', 'Date of Birth')}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomTextField
              name="passportNumber"
              control={control}
              label={t('clients.columns.passportNumber', 'Passport Number')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomTextField
              name="passportExpiryDate"
              control={control}
              type="date"
              label={t('clients.columns.passportExpiryDate', 'Passport Expiry Date')}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomTextField
              name="passportCountryOfIssue"
              control={control}
              label={t('clients.columns.passportCountryOfIssue', 'Passport Country of Issue')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomSelect
              name="gender"
              control={control}
              label={t('clients.columns.gender', 'Gender')}
              options={[
                { label: t('clients.genderWomen', 'Women'), value: 'Women' },
                { label: t('clients.genderMen', 'Men'), value: 'Men' },
              ]}
            />
          </Box>
        </Box>

        <FooterButton loading={loading} onCancel={closeModal} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddClientModal;
