import { Box, InputAdornment, TextField, Typography, useColorScheme } from '@mui/material';
import OverflowTooltipLabel from '../OverflowTooltipLabel';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { normalizePhoneInput } from '../../utils/phone';

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const mergeSx = (...styles) =>
  styles.filter(Boolean).reduce((merged, style) => {
    Object.entries(style).forEach(([key, value]) => {
      if (isPlainObject(value) && isPlainObject(merged[key])) {
        merged[key] = mergeSx(merged[key], value);
      } else {
        merged[key] = value;
      }
    });

    return merged;
  }, {});

const baseFieldStyles = {
  form: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '7px',
      minHeight: '44px',
      backgroundColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'primary.main',
        },
      },
    },
    '& .MuiOutlinedInput-input': {
      py: '10px',
    },
    '& .MuiFormHelperText-root': {
      position: 'absolute',
      bottom: '-20px',
      left: 0,
      mx: 1,
      mt: 0,
      fontSize: '0.75rem',
      lineHeight: 1.2,
    },
  },
  login: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '16px',
      backgroundColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.08)',
      fontSize: '1rem',
      color: '#ffffff',
      height: { xs: 48, sm: 52 },
      paddingLeft: '14px',
      paddingRight: '16px',
      gap: 0,
      transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      '& fieldset': {
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
        transition: 'border-color 0.3s ease',
      },
      '&:hover fieldset': { borderColor: '#15C3C2' },
      '&.Mui-focused': {
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(14, 133, 132, 0.22)' : 'rgba(14, 133, 132, 0.18)',
        boxShadow: '0 0 0 3px rgba(21, 195, 194, 0.25)',
      },
      '&.Mui-focused fieldset': { borderColor: '#15C3C2', borderWidth: 1.5 },
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 0px',
      color: '#ffffff !important',
      WebkitTextFillColor: '#ffffff !important',
    },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
      WebkitTextFillColor: '#ffffff !important',
      WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
      transition: 'background-color 5000s ease-in-out 0s',
    },
    '& .MuiFormHelperText-root': {
      position: 'absolute',
      bottom: '-20px',
      left: 4,
      margin: 0,
      color: '#f87171',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
  },
};

const PhoneNumberField = ({
  control,
  name = 'phone',
  error,
  label,
  required = false,
  disabled = false,
  placeholder = '',
  prefix = '+993',
  maxLength = 24,
  variant = 'form',
  sx = {},
  inputSx = {},
}) => {
  const { t } = useTranslation();
  const { mode } = useColorScheme();

  const isDark = mode === 'dark';
  const textColor = variant === 'login'
    ? (isDark ? '#DDDDDD' : '#ffffff')
    : 'text.primary';
  const variantStyles = baseFieldStyles[variant] ?? baseFieldStyles.form;
  const resolvedLabel = label === false ? null : (label ?? t('columns.phoneNumber'));

  const stripPrefix = (value) => {
    if (typeof value !== 'string') return '';
    return value.startsWith(prefix) ? value.slice(prefix.length) : value;
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {resolvedLabel && (
        <OverflowTooltipLabel
          label={resolvedLabel}
          required={required}
          sx={
            variant === 'login'
              ? {
                  color: 'var(--Text-btn, #FFFFFF)',
                  fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 510,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.01em',
                  mb: 0.8,
                }
              : {}
          }
        />
      )}

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const resolvedError = error ?? fieldState.error;
          const digitsOnly = stripPrefix(field.value);

          return (
            <TextField
              {...field}
              value={digitsOnly}
              fullWidth
              disabled={disabled}
              placeholder={placeholder}
              error={Boolean(resolvedError)}
              size="medium"
              helperText={resolvedError?.message}
              onChange={(e) => {
                const normalized = normalizePhoneInput(e.target.value);
                field.onChange(normalized ? `${prefix}${normalized}` : '');
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{
                        marginRight: 0,
                        '& .MuiInputAdornment-root': { marginRight: 0 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 400,
                          color: textColor,
                          lineHeight: 1.5,
                          mr: '6px',
                          userSelect: 'none',
                          pointerEvents: 'none',
                          fontFamily: 'inherit',
                        }}
                      >
                        {prefix}
                      </Typography>
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  maxLength,
                  inputMode: 'numeric',
                  autoComplete: variant === 'login' ? 'tel' : undefined,
                  style: {
                    paddingLeft: 0,
                  },
                },
              }}
              sx={mergeSx(
                {
                  '& .MuiOutlinedInput-input::placeholder': {
                    color:
                      variant === 'login'
                        ? 'rgba(255,255,255,0.35)'
                        : 'text.disabled',
                    opacity: 1,
                    letterSpacing: variant === 'login' ? '0.12em' : '0.02em',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: variant === 'login' ? `${textColor} !important` : 'text.primary',
                    WebkitTextFillColor: variant === 'login' ? `${textColor} !important` : undefined,
                  },
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                    WebkitTextFillColor: variant === 'login' ? `${textColor} !important` : undefined,
                    WebkitBoxShadow: variant === 'login' ? '0 0 0 1000px transparent inset !important' : undefined,
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                },
                variantStyles,
                inputSx,
              )}
            />
          );
        }}
      />
    </Box>
  );
};

export default PhoneNumberField;
