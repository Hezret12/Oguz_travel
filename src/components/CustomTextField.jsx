import { Box, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';

const CustomTextField = ({
  name,
  control,
  rules,
  label,
  type = 'text',
  disabled = false,
  required = false,
  multiline = false,
  rows,
  placeholder,
  fullWidth = true,
  size = 'medium',
  startIcon,
  endIcon,
  sx = {},
  InputProps = {},
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const hasError = Boolean(error);

        return (
          <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
            {label && (
              <Typography
                variant="body2"
                sx={{
                  mb: 0.75,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                }}
              >
                {label}
                {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
              </Typography>
            )}
            <TextField
              {...field}
              inputRef={field.ref}
              value={field.value ?? ''}
              type={type}
              size={size}
              disabled={disabled}
              multiline={multiline}
              rows={rows}
              placeholder={placeholder}
              error={hasError}
              helperText={error?.message}
              fullWidth={fullWidth}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  minHeight: multiline ? 'auto' : '44px',
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
                    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  py: multiline ? undefined : '10px',
                },
                '& .MuiFormHelperText-root': {
                  mx: 1,
                  mt: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                },
                ...sx,
              }}
              slotProps={{
                input: {
                  startAdornment: startIcon ? (
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: '8px', color: 'gray' }}>
                      {startIcon}
                    </span>
                  ) : undefined,
                  endAdornment: endIcon ? (
                    <span style={{ display: 'flex', alignItems: 'center', marginLeft: '8px', color: 'gray' }}>
                      {endIcon}
                    </span>
                  ) : undefined,
                  ...InputProps,
                },
              }}
              {...props}
            />
          </Box>
        );
      }}
    />
  );
};

export default CustomTextField;
