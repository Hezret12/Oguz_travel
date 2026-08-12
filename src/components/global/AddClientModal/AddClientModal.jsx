import { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, FormControlLabel, Switch } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLocale } from '../../../hooks/useLocale';
import { useAuth } from '../../../context/AuthContext';
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
  const { user } = useAuth();
  const isAdmin = Boolean(user?.role === "admin" || user?.user_is_admin || user?.isAdmin);
  const { clientValidShema } = useValidShema();
  const { open, initialValues, onCreated } = useSelector(selectAddClientModal);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync: createClient } = useMutation({ mutationFn: addClientsApi });

  const defaultValues = useMemo(
    () => ({
      fullName: "",
      phone_number: null,
      dateOfBirth: null,
      passport_number: null,
      passportIssueDate: null,
      passportExpiryDate: null,
      passportCountryOfIssue: null,
      gender: null,
      vip: false,
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
      const payload = {
        ...data,
        vip: isAdmin ? Boolean(data.vip) : false,
      };
      const response = await createClient(payload);
      const createdClient = response?.data?.data ?? response?.data;

      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onCreated?.(createdClient);
      toast.success(t('clients.addSuccess'));
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(t('clients.addError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog widthX={820} open={open} close={closeModal}>
      <CustomDialogHeader
        variant="h5"
        title={t('autocomplete.addClient')}
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
              name="passportIssueDate"
              control={control}
              label={t('columns.passportIssueDate', 'Passport Issue Date')}
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
              label={t('columns.passportCountryOfIssue')}
            />
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)' } }}>
            <CustomSelect
              name="gender"
              control={control}
              label={t('columns.gender', 'Gender')}
              options={[
                { label: t('clients.genderWomen', 'Women'), value: 'Female' },
                { label: t('clients.genderMen', 'Men'), value: 'Male' },
              ]}
            />
          </Box>

          {isAdmin && (
            <Box sx={{ flex: '1 1 100%' }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  px: 2,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 215, 0, 0.05)"
                      : "#FFFDF0",
                  borderColor: "#FFD700",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StarRoundedIcon sx={{ color: "#D97706", fontSize: 24 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#D97706" }}>
                      VIP Müşteri Statusı
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bu müşderini VIP hökmünde bellemek üçin açary açyň (Diňe Admin üçin)
                    </Typography>
                  </Box>
                </Box>
                <Controller
                  name="vip"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(value)}
                          onChange={(e) => onChange(e.target.checked)}
                          color="warning"
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  )}
                />
              </Paper>
            </Box>
          )}
        </Box>

        <FooterButton loading={loading} onCancel={closeModal} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddClientModal;


