import { Box, InputAdornment, TextField, Typography, useColorScheme } from '@mui/material';
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
      borderRadius: '4px',
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
      '&.Mui-focused': {
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 0 0 3px rgba(59, 130, 246, 0.16)'
            : '0 0 0 3px rgba(37, 99, 235, 0.12)',
      },
    },
    '& .MuiOutlinedInput-input': {
      py: '10px',
      color: 'text.primary',
    },
    '& .MuiFormHelperText-root': {
      mx: 1,
      mt: 0.5,
      fontSize: '0.75rem',
      fontWeight: 500,
    },
  },
  login: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '18px',
      backgroundColor: 'transparent',
      fontSize: '1.05rem',
      color: 'inherit',
      height: 50,
      paddingLeft: '14px',
      paddingRight: '16px',
      gap: 0,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
      '& fieldset': {
        borderColor: (theme) => (theme.palette.mode === 'dark' ? '#8A8A8A' : '#BEBEBE'),
        transition: 'border-color 0.3s ease',
      },
      '&:hover fieldset': { borderColor: '#15C3C2' },
      '&.Mui-focused': {
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.12)' : '#0E858433',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 0 0 3px rgba(59, 130, 246, 0.16)'
            : '0 0 0 3px rgba(37, 99, 235, 0.12)',
      },
      '&.Mui-focused fieldset': { borderColor: '#15C3C2', borderWidth: 1 },
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 0px',
    },
    '& .MuiFormHelperText-root': {
      color: '#f87171',
      fontSize: '0.75rem',
      ml: 0,
      mt: 0.4,
      position: 'absolute',
      bottom: '-20px',
    },
  },
};

const baseLabelStyles = {
  form: {
    color: 'text.primary',
    fontFamily: 'inherit',
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    mb: 0.75,
  },
  login: {
    color: 'var(--Text-btn, #FFFFFF)',
    fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: 510,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '-0.01em',
    mb: 0.8,
  },
};

const PhoneNumberField = ({
  control,
  name = 'phone',
  error,
  label,
  required = false,
  disabled = false,
  placeholder = '________',
  prefix = '+993',
  maxLength = 8,
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
  const variantLabelStyles = baseLabelStyles[variant] ?? baseLabelStyles.form;
  const resolvedLabel = label === false ? null : (label ?? t('columns.phoneNumber'));

  // Gelen değer +993 ile başlıyorsa temizler, yoksa olduğu gibi bırakır (input'ta hep rakamlar gösterilir)
  const stripPrefix = (value) => {
    if (typeof value !== 'string') return '';
    return value.startsWith(prefix) ? value.slice(prefix.length) : value;
  };

  return (
    <Box sx={{ width: '100%', position: 'relative', ...sx }}>
      {resolvedLabel && (
        <Typography sx={variantLabelStyles}>
          {resolvedLabel}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </Typography>
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
                          fontSize: '1.05rem',
                          fontWeight: 500,
                          color: textColor,
                          lineHeight: '1.6',
                          mr: '6px',
                          userSelect: 'none',
                          pointerEvents: 'none',
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
                  style: { paddingLeft: 0 },
                },
              }}
              sx={mergeSx(
                {
                  position: 'relative',
                  '& .MuiOutlinedInput-input::placeholder': {
                    color:
                      variant === 'login'
                        ? 'rgba(255,255,255,0.35)'
                        : 'text.disabled',
                    opacity: 1,
                    letterSpacing: variant === 'login' ? '0.12em' : '0.02em',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: variant === 'login' ? textColor : 'text.primary',
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

