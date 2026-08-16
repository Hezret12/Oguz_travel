import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import GppBadIcon from '@mui/icons-material/GppBad';
import { useAuth } from '../../context/AuthContext';
import { getRoleHomePath } from '../../utils/auth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useDocumentTitle('Yetkisiz Erişim | Oguz Travel');

  const handleGoHome = () => {
    navigate(getRoleHomePath(user?.role), { replace: true });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
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
        }}
      >
        <GppBadIcon color="error" sx={{ fontSize: 72, mb: 2 }} />
        
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Yetkisiz Erişim
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Bu sayfayı görüntülemek için gerekli yetkilere sahip değilsiniz. Lütfen kendi rolünüze uygun kontrol panelini kullanın.
        </Typography>

        <Button variant="contained" size="large" onClick={handleGoHome} sx={{ px: 4, py: 1.2, fontWeight: 600 }}>
          Ana Sayfaya Dön
        </Button>
      </Paper>
    </Box>
  );
};

export default Unauthorized;
