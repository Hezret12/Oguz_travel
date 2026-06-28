import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

const GlobalSearchInput = ({
  value,
  onChange,
  placeholder = 'Ara...',
  disabled = false,
}) => {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      size="small"
      variant="outlined"
      sx={{
        minWidth: 260,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          fontSize: '0.875rem',
          mt: 0.5,
          ml: 1,
          p: 1
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => onChange('')}
                edge="end"
                aria-label="Aramayı temizle"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
};

export default GlobalSearchInput;
