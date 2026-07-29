import { useRef } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Controller } from 'react-hook-form';
import { useLocale } from '../../hooks/useLocale';

export const CustomFileUpload = ({
  name,
  control,
  label,
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
  required = false,
}) => {
  const { t } = useLocale();
  const inputRef = useRef(null);
  const displayLabel = label || t('clients.uploadDocument') || 'Dosya Yükle';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleFileChange = (e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > maxSizeMB * 1024 * 1024) {
              alert(`Dosya boyutu maksimum ${maxSizeMB}MB olabilir.`);
              return;
            }
            onChange(file);
          }
        };

        const handleRemove = () => {
          onChange(null);
          if (inputRef.current) inputRef.current.value = '';
        };

        const fileName = value instanceof File ? value.name : typeof value === 'string' ? value.split('/').pop() : '';

        return (
          <Box sx={{ width: '100%' }}>
            {displayLabel && (
              <Typography
                variant="body2"
                sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}
              >
                {displayLabel}
                {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
              </Typography>
            )}

            <input
              type="file"
              ref={inputRef}
              accept={accept}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id={`file-input-${name}`}
            />

            {!value ? (
              <Button
                component="label"
                htmlFor={`file-input-${name}`}
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{
                  height: '44px',
                  borderRadius: '10px',
                  textTransform: 'none',
                  borderColor: error ? 'error.main' : 'divider',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                {displayLabel}
              </Button>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  px: 1.5,
                  height: '44px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: 'primary.main',
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(21, 101, 192, 0.08)' : '#f0f7ff',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                  <InsertDriveFileIcon color="primary" fontSize="small" />
                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                    {fileName || t('clients.passportDocument') || 'Yüklü Dosya'}
                  </Typography>
                </Box>
                <IconButton size="small" color="error" onClick={handleRemove}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {error.message}
              </Typography>
            )}
          </Box>
        );
      }}
    />
  );
};

export default CustomFileUpload;
