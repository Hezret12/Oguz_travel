import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLocale } from '../../../hooks/useLocale';
import { useValidShema } from '../../../functions/useValidShema';
import { CustomDialog } from '../../Dialog/CustomDialog';
import { CustomDialogHeader } from '../../Dialog/CustomDialogHeader';
import { CustomForm } from '../../Dialog/CustomForm';
import { FooterButton } from '../../Dialog/FooterButton';
import CustomTextField from '../../CustomTextField';
import CustomSelect from '../../CustomSelect';
import PhoneNumberField from '../../inputs/PhoneNumber';
import { closeAddClientModal, selectAddClientModal } from '../../../store/slices/modalSlice';
import { addClientsApi } from '../../../api/queries/post';
import CustomDatePicker from '../../CustomDatePicker';

const AddClientModal = () => {
  const dispatch = useDispatch();
  const { t } = useLocale();
  const { clientValidShema } = useValidShema();
  const { open, initialValues, onCreated } = useSelector(selectAddClientModal);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync: createClient } = useMutation({ mutationFn: addClientsApi });

  const defaultValues = useMemo(
    () => ({
      fullName: '',
      phone_number: '',
      dateOfBirth: '',
      passport_number: '',
      passportExpiryDate: '',
      passportCountryOfIssue: '',
      gender: '',
      ...initialValues,
    }),
    [initialValues],
  );

  const { control, handleSubmit, reset } = useForm({
    defaultValues,
    resolver: yupResolver(clientValidShema),
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
      const response = await createClient(data);
      const createdClient = response?.data?.data ?? response?.data;

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onCreated?.(createdClient);
      toast.success(t('pages.clients.addSuccess', 'Client added successfully!'));
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(t('pages.clients.addError', 'An error occurred while saving client.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog widthX={820} open={open} close={closeModal}>
      <CustomDialogHeader
        variant="h5"
        title={t('pages.clients.add')}
      />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2.5,
          }}
        >
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomTextField
              name="fullName"
              control={control}
              label={t('columns.fullName', 'Full Name')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <PhoneNumberField
              control={control}
              name="phone_number"
              label={t('columns.phoneNumber', 'Phone Number')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomDatePicker
              name="dateOfBirth"
              control={control}
              type="date"
              label={t('dateOfBirth')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomTextField
              name="passport_number"
              control={control}
              label={t('columns.passportNumber', 'Passport Number')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomDatePicker
              name="passportExpiryDate"
              control={control}
              label={t('columns.passportExpiryDate', 'Passport Expiry Date')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomTextField
              name="passportCountryOfIssue"
              control={control}
              label={t('columns.passportCountryOfIssue', 'Passport Country of Issue')}
            />
          </Box>

          <Box sx={{ width: "49%" }}>
            <CustomSelect
              name="gender"
              control={control}
              label={t('columns.gender', 'Gender')}
              options={[
                { label: t('pages.clients.genderWomen', 'Women'), value: 'Female' },
                { label: t('pages.clients.genderMen', 'Men'), value: 'Male' },
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


