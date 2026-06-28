import { useMemo, useState } from 'react';
import { Autocomplete, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AddIcon from '@mui/icons-material/Add';
import { Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useClientsQuery } from '../../../features/Clients/hooks/useClientsQuery';
import ClientOption from '../ClientOption/ClientOption';
import { openAddClientModal } from '../../../store/slices/modalSlice';

const normalize = (value) => String(value ?? '').toLowerCase().trim();

const matchesQuery = (client, query) => {
  if (!query) return true;
  const normalizedQuery = normalize(query);

  return [client.fullName, client.passportNumber, client.phoneNumber, client.clientId].some((value) =>
    normalize(value).includes(normalizedQuery),
  );
};

const GlobalClientAutocompleteField = ({
  field,
  fieldState,
  clients,
  isLoading,
  label,
  placeholder,
  required,
  disabled,
  onClientChange,
  onAddClient,
  sx,
  dispatch,
  t,
}) => {
  const [inputValue, setInputValue] = useState('');

  const selectedClient = clients.find((client) => client.id === field.value) ?? null;
  const filteredClients = useMemo(
    () => clients.filter((client) => matchesQuery(client, inputValue)),
    [clients, inputValue],
  );

  const handleAddClient = () => {
    if (onAddClient) {
      onAddClient(inputValue);
      return;
    }

    dispatch(
      openAddClientModal({
        initialValues: {
          fullName: inputValue,
        },
        onCreated: (createdClient) => {
          field.onChange(createdClient?.id ?? '');
          onClientChange?.(createdClient ?? null);
          setInputValue(createdClient?.fullName ?? '');
        },
      }),
    );
  };

  return (
    <Autocomplete
      key={field.value || 'empty'}
      value={selectedClient}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      options={filteredClients}
      loading={isLoading}
      disabled={disabled}
      clearOnBlur={false}
      autoHighlight
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.fullName ?? ''}
      filterOptions={(options) => options}
      noOptionsText={
        <Box sx={{ py: 1.5, px: 1 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
            {t('clients.autocomplete.noClientFound', 'No client found.')}
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddClient}
            size="small"
            sx={{ textTransform: 'none', px: 0, fontWeight: 700 }}
          >
            {t('clients.autocomplete.addClient', '+ Add Client')}
          </Button>
        </Box>
      }
      onChange={(_, newClient) => {
        field.onChange(newClient?.id ?? '');
        onClientChange?.(newClient ?? null);
        setInputValue(newClient?.fullName ?? '');
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <ClientOption client={option} dense />
        </li>
      )}
      renderInput={(params) => {
        const inputProps = params.InputProps ?? {};

        return (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
            InputProps={{
              ...inputProps,
              startAdornment: (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
                    <PersonSearchIcon sx={{ fontSize: 20 }} />
                  </Box>
                  {inputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={16} /> : null}
                  {inputProps.endAdornment}
                </>
              ),
            }}
          />
        );
      }}
      sx={{
        ...sx,
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          minHeight: '44px',
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'),
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          },
          '&.Mui-focused': {
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff'),
            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
          },
        },
        '& .MuiFormHelperText-root': {
          mx: 1,
          mt: 0.5,
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      }}
    />
  );
};

const GlobalClientAutocomplete = ({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  onClientChange,
  onAddClient,
  sx = {},
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: clients = [], isLoading } = useClientsQuery();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <GlobalClientAutocompleteField
          field={field}
          fieldState={fieldState}
          clients={clients}
          isLoading={isLoading}
          label={label}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onClientChange={onClientChange}
          onAddClient={onAddClient}
          sx={sx}
          dispatch={dispatch}
          t={t}
        />
      )}
    />
  );
};

export default GlobalClientAutocomplete;
