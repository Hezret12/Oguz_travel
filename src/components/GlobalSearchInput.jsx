import { Box, InputAdornment, TextField, Tooltip, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import IconButton from '@mui/material/IconButton';
import { useState, useEffect } from 'react';

const GlobalSearchInput = ({
  value = '',
  onChange,
  placeholder = '',
  disabled = false,
  onRefetch,
  isFetching = false,
  debounceMs = 350,
  sx,
}) => {
  const [localValue, setLocalValue] = useState(value ?? '');

  // React 19 State Synchronization: sync localValue when external prop changes (e.g. on reset)
  const [prevPropValue, setPrevPropValue] = useState(value ?? '');
  if (value !== prevPropValue) {
    setPrevPropValue(value ?? '');
    setLocalValue(value ?? '');
  }

  useEffect(() => {
    if (localValue === value) return;

    const handler = setTimeout(() => {
      onChange?.(localValue);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, value, onChange, debounceMs]);

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ...sx }}>
      <TextField
        value={localValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        size="small"
        variant="outlined"
        sx={{
          minWidth: 260,
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            height: 40,
            fontSize: '0.875rem',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: localValue ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  aria-label="Clear all"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      {onRefetch && (
        <Tooltip title="Täzele" placement="top">
          <span>
            <IconButton
              onClick={onRefetch}
              disabled={isFetching}
              size="small"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(0,0,0,0.23)'
                  }`,
                color: 'primary.main',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: '#fff',
                  borderColor: 'primary.main',
                },
                '&.Mui-disabled': {
                  borderColor: 'divider',
                },
              }}
            >
              {isFetching ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
};

export default GlobalSearchInput;
