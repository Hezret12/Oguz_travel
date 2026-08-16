import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { useLocale } from '../../hooks/useLocale';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useLocale();

  useDocumentTitle(`${t('notFound.title')} | Oguz Travel`);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <ErrorIcon color="primary" sx={{ fontSize: 72, mb: 2 }} />

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          {t('notFound.title')}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t('notFound.desc')}
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{ px: 4, py: 1.2, fontWeight: 600, textTransform: 'none' }}
        >
          {t('notFound.goHome')}
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
