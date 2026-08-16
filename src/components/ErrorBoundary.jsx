import { useState } from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import toast from 'react-hot-toast';
import { useLocale } from '../hooks/useLocale';

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  console.error('Captured Route Error:', error);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
    window.location.reload();
  };

  const isChunkError =
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.name === 'ChunkLoadError';

  const errorText =
    error?.stack ||
    error?.message ||
    error?.statusText ||
    (typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error || ''));

  const handleCopyError = async () => {
    const fullErrorPayload = [
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`,
      `Error: ${errorText}`,
    ].join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullErrorPayload);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullErrorPayload;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success(t('errorBoundary.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error:', err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
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
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
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
              color: 'text.primary',
              fontFamily: 'Outfit, Inter, sans-serif',
            }}
          >
            {isChunkError
              ? t('errorBoundary.networkErrorTitle')
              : t('errorBoundary.genericErrorTitle')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: 'text.secondary',
            }}
          >
            {isChunkError
              ? t('errorBoundary.networkErrorDesc')
              : t('errorBoundary.genericErrorDesc')}
          </Typography>

          {/* Technical error display with copy button */}
          {error && (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                p: 2,
                pr: 6,
                mb: 4,
                borderRadius: 2,
                backgroundColor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'left',
              }}
            >
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  m: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'error.main',
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '160px',
                  overflow: 'auto',
                }}
              >
                {errorText}
              </Typography>
              <Tooltip
                title={
                  copied
                    ? t('errorBoundary.copied')
                    : t('errorBoundary.copyError')
                }
              >
                <IconButton
                  size="small"
                  onClick={handleCopyError}
                  aria-label={t('errorBoundary.copyError')}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: copied ? 'success.main' : 'text.secondary',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      color: 'primary.main',
                    },
                  }}
                >
                  {copied ? (
                    <CheckIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <ContentCopyIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
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
              {t('errorBoundary.retry')}
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
                color: 'text.primary',
                borderColor: 'divider',
              }}
            >
              {t('errorBoundary.goHome')}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ErrorBoundary;
