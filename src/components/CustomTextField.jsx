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
  size = 'medium',
  startIcon,
  endIcon,
  onChange,
  sx = {},
  InputProps = {},
  InputLabelProps = {},
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const hasError = Boolean(error);

        const handleChange = (event) => {
          const nextValue = event?.target?.value ?? event;
          field.onChange(nextValue);
          onChange?.(event);
        };

        return (
          <Box sx={{ width: '100%' }}>
            {label && (
              <Typography
                variant="body2"
                component="div"
                sx={{
                  mb: 0.75,
                  fontWeight: 600,
                  fontSize: '0.875rem',
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
              onChange={handleChange}
              size={size}
              disabled={disabled}
              multiline={multiline}
              rows={rows}
              placeholder={placeholder}
              error={hasError}
              helperText={error?.message}
              fullWidth
              slotProps={{
                input: {
                  ...InputProps,
                  startAdornment: startIcon ? (
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: '8px', color: 'inherit' }}>
                      {startIcon}
                    </span>
                  ) : InputProps.startAdornment,
                  endAdornment: endIcon ? (
                    <span style={{ display: 'flex', alignItems: 'center', marginLeft: '8px', color: 'inherit' }}>
                      {endIcon}
                    </span>
                  ) : InputProps.endAdornment,
                },
                inputLabel: InputLabelProps,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '7px',
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
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 0 0 3px rgba(59, 130, 246, 0.16)'
                        : '0 0 0 3px rgba(37, 99, 235, 0.12)',
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
              {...props}
            />
          </Box>
        );
      }}
    />
  );
};

export default CustomTextField;
