import { useRouteError, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Captured Route Error:', error);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
    window.location.reload(); // Force a clean refresh to clear memory errors
  };

  // Determine if it's a chunk loading failure (network error)
  const isChunkError =
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.name === 'ChunkLoadError';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? '#2F4B71' : '#ffffff',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.05)'
                : '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'error.light',
              color: 'error.main',
              mb: 3,
              animation: 'bounce 1s infinite alternate',
              '@keyframes bounce': {
                '0%': { transform: 'translateY(0)' },
                '100%': { transform: 'translateY(-6px)' },
              },
            }}
          >
            <ErrorIcon sx={{ fontSize: 48 }} />
          </Box>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: (theme) => (theme.palette.mode === 'dark' ? '#ffffff' : '#1E293B'),
              fontFamily: 'Outfit, Inter, sans-serif',
            }}
          >
            {isChunkError ? 'Bağlantı Hatası' : 'Bir Hata Oluştu'}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: (theme) => (theme.palette.mode === 'dark' ? '#bbbbbb' : '#555555'),
            }}
          >
            {isChunkError
              ? 'Sayfa bileşenleri yüklenirken bir ağ veya internet bağlantısı sorunu oluştu. Lütfen sayfayı yenilemeyi deneyin.'
              : 'Sayfa yüklenirken beklenmeyen bir hata meydana geldi. Sorun devam ederse lütfen yöneticinizle iletişime geçin.'}
          </Typography>

          {/* Technical details toggle (Optional/Compact) */}
          {error && (
            <Typography
              variant="caption"
              sx={{
                p: 2,
                mb: 4,
                borderRadius: 2,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(0,0,0,0.2)'
                    : 'rgba(0,0,0,0.03)',
                color: (theme) =>
                  theme.palette.mode === 'dark' ? '#ef9a9a' : '#c62828',
                wordBreak: 'break-all',
                maxWidth: '100%',
              }}
            >
              {error.statusText || error.message || String(error)}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 3,
              }}
            >
              Yeniden Dene
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: 'none',
                color: (theme) =>
                  theme.palette.mode === 'dark' ? '#ffffff' : '#333333',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
              }}
            >
              Ana Sayfaya Dön
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ErrorBoundary;
