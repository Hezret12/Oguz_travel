import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { useLocale } from '../../hooks/useLocale';
import { useValidShema } from '../../functions/useValidShema';
import { CustomDialog } from '../../components/Dialog/CustomDialog';
import { CustomDialogHeader } from '../../components/Dialog/CustomDialogHeader';
import { CustomForm } from '../../components/Dialog/CustomForm';
import CustomTextField from '../../components/CustomTextField';
import CustomSelect from '../../components/CustomSelect';
import PhoneNumberField from '../../components/inputs/PhoneNumber';
import FooterButton from '../../components/Dialog/FooterButton';
import GlobalClientAutocomplete from '../../components/global/GlobalClientAutocomplete/GlobalClientAutocomplete';

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

const AddReferralLetterModal = ({ open, onClose, onSave }) => {
  const { t } = useLocale();
  const { addReferralLetter } = useValidShema();
  const [loading, setLoading] = useState(false);

  const defaultValues = useMemo(
    () => ({
      clientId: '',
      arzaNo: '',
      operator: '',
      ofis: '',
      agent: '',
      agentTel: '',
      name: '',
      surname: '',
      yolagcyTel: '',
      gender: '',
      dateOfBirth: '',
      passportNumber: '',
      destinationCountry: '',
      tranzit: '',
      syhNo: '',
      departureDate: '',
      returnDate: '',
      price: '',
      contractNo: '',
      contractDate: '',
      note: '',
      syhHighlighted: false,
    }),
    [],
  );

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues,
    resolver: yupResolver(addReferralLetter),
    mode: 'onSubmit',
  });

  const applyClientToForm = (client) => {
    const [firstName = '', ...lastNameParts] = String(client?.fullName ?? '').trim().split(' ');
    setValue('clientId', client?.id ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('name', firstName, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('surname', lastNameParts.join(' '), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('yolagcyTel', client?.phoneNumber ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('dateOfBirth', client?.dateOfBirth ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('passportNumber', client?.passportNumber ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  const closeDialog = () => {
    onClose?.();
    reset(defaultValues);
  };

  const submitHandler = async (values) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 250));
      onSave?.({
        ...values,
        price: Number(values.price || 0),
      });
      toast.success(t('pages.referralLetter.addSuccess', 'Referral added successfully!'));
      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error(t('pages.referralLetter.addError', 'An error occurred while saving referral.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog widthX={860} open={open} close={closeDialog}>
      <CustomDialogHeader
        variant="h5"
        title={t('pages.referralLetter.add', 'Add Referral')}
      />
      <CustomForm handleSubmit={handleSubmit(submitHandler)}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ width: '100%' }}>
            <GlobalClientAutocomplete
              control={control}
              name="clientId"
              label={t('columns.client') ?? 'Client'}
              placeholder={t('pages.clients.autocomplete.clientPlaceholder') ?? 'Search client...'}
              onClientChange={applyClientToForm}
            />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="arzaNo" control={control} label={t('pages.referralLetter.arzaNo', 'Referral No')} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="operator" control={control} label={t('columns.operator', 'Operator')} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="ofis" control={control} label={t('columns.office', 'Office')} />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="agent" control={control} label={t('columns.agent', 'Agent')} />
          </Box>
          <Box sx={{  }}>
            <PhoneNumberField control={control} name="agentTel" label={t('pages.referralLetter.agentTel', 'Agent Phone')} />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="name" control={control} label={t('columns.fullName', 'Name')} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="surname" control={control} label={t('pages.referralLetter.surname', 'Surname')} required />
          </Box>
          <Box sx={{  }}>
            <PhoneNumberField control={control} name="yolagcyTel" label={t('columns.phoneNumber', 'Passenger Phone')} />
          </Box>
          <Box sx={{  }}>
            <CustomSelect name="gender" control={control} label={t('columns.gender', 'Gender')} options={genderOptions} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="dateOfBirth" control={control} type="date" label={t('columns.dateOfBirth', 'Date of Birth')} InputLabelProps={{ shrink: true }} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="passportNumber" control={control} label={t('columns.passportNumber', 'Passport Number')} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="destinationCountry" control={control} label={t('columns.destinationCountry', 'Destination Country')} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="tranzit" control={control} label={t('columns.transit', 'Transit')} />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="syhNo" control={control} label={t('columns.syhNo', 'S-ÝH №')} />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="departureDate" control={control} type="date" label={t('columns.departureDate', 'Departure Date')} InputLabelProps={{ shrink: true }} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="returnDate" control={control} type="date" label={t('columns.returnDate', 'Return Date')} InputLabelProps={{ shrink: true }} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="price" control={control} label={t('price', 'Price')} required />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="contractNo" control={control} label={t('pages.referralLetter.contractNo', 'Contract No')} />
          </Box>
          <Box sx={{  }}>
            <CustomTextField name="contractDate" control={control} type="date" label={t('columns.contractDate', 'Contract Date')} InputLabelProps={{ shrink: true }} required />
          </Box>
          <Box sx={{ width: '100%' }}>
            <CustomTextField name="note" control={control} label={t('columns.note', 'Note')} multiline rows={2} />
          </Box>
        </Box>

        <FooterButton loading={loading} onCancel={closeDialog} type="submit" />
      </CustomForm>
    </CustomDialog>
  );
};

export default AddReferralLetterModal;
