import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc',
        p: 2,
      }}
    >
      <Helmet>
        <title>404 - Not found | Oguz Travel</title>
      </Helmet>
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
        <ErrorIcon color="primary" sx={{ fontSize: 72, mb: 2 }} />
        
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          404 - Not found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>

        <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ px: 4, py: 1.2, fontWeight: 600 }}>
          Go to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
