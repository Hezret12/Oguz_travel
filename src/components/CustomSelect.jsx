import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const CustomSelect = ({
  name,
  control,
  rules,
  label,
  options = [],
  fullWidth = true,
  size = 'medium',
  startAdornment,
  disabled = false,
  required = false,
  placeholder,
  sx = {},
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuProps = {
    slotProps: {
      paper: {
        sx: {
          borderRadius: '12px',
          marginTop: '6px',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0px 10px 30px rgba(0, 0, 0, 0.5)'
              : '0px 10px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid',
          borderColor: 'divider',
          maxHeight: 300,
          '& .MuiList-root': {
            padding: '6px 0',
          },
          '& .MuiMenuItem-root': {
            borderRadius: '8px',
            margin: '4px 8px',
            padding: '10px 14px',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(37, 99, 235, 0.04)',
              transform: 'translateX(4px)',
              color: 'primary.main',
            },
            '&.Mui-selected': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.08)',
              color: 'primary.main',
              fontWeight: 600,
            },
          },
        },
      },
    },
  };

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
            <FormControl
              fullWidth={fullWidth}
              error={hasError}
              size={size}
              disabled={disabled}
              required={required}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  minHeight: '44px',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                  transition: 'all 0.2s ease-in-out',
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
                '& .MuiSelect-select': {
                  py: '10px',
                  display: 'flex',
                  alignItems: 'center',
                },
                ...sx,
              }}
            >
              <Select
                {...field}
                inputRef={field.ref}
                id={`${name}-select`}
                value={field.value ?? ''}
                displayEmpty={Boolean(placeholder)}
                startAdornment={startAdornment}
                MenuProps={menuProps}
                open={isOpen}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
                IconComponent={isOpen ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
                renderValue={(selected) => {
                  if (!selected && placeholder) {
                    return (
                      <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>
                        {placeholder}
                      </Typography>
                    );
                  }
                  const selectedOption = options.find((opt) => opt.value === selected);
                  if (!selectedOption) return selected;
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      {selectedOption.icon && (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          {selectedOption.icon}
                        </Box>
                      )}
                      <Typography sx={{ fontSize: '0.875rem' }}>{selectedOption.label}</Typography>
                    </Box>
                  );
                }}
                {...props}
              >
                {options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.icon && (
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        {option.icon}
                      </Box>
                    )}
                    <span>{option.label}</span>
                  </MenuItem>
                ))}
              </Select>
              {hasError && (
                <FormHelperText sx={{ mx: 1, mt: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
                  {error?.message}
                </FormHelperText>
              )}
            </FormControl>
          </Box>
        );
      }}
    />
  );
};

export default CustomSelect;
