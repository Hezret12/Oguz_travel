import { InputAdornment, TextField, Tooltip, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import IconButton from '@mui/material/IconButton';

const GlobalSearchInput = ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  onRefetch,
  isFetching = false,
}) => {
  return (
    <>
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
                mt: 0.5,
                width: 36,
                height: 36,
                borderRadius: '8px',
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
    </>
  );
};

export default GlobalSearchInput;
