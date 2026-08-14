import { Box, CircularProgress, Fade } from '@mui/material';
import OguzLogo from '../assets/icons/OguzLogo';

const LoadingScreen = () => {
  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          backgroundColor: (theme) => theme.palette.background.default,
          transition: 'background-color 0.3s ease',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3.5,
          }}
        >
          {/* Branded Logo with smooth breathing animation */}
          <Box
            sx={{
              animation: 'logoBreathe 2.4s infinite ease-in-out',
              '@keyframes logoBreathe': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  opacity: 0.88,
                  filter: 'drop-shadow(0 4px 12px rgba(14,133,132,0.15))',
                },
                '50%': {
                  transform: 'scale(1.03)',
                  opacity: 1,
                  filter: 'drop-shadow(0 8px 24px rgba(14,133,132,0.30))',
                },
              },
            }}
          >
            <OguzLogo
              sx={{
                width: { xs: 180, sm: 220 },
                height: 'auto',
                display: 'block',
              }}
            />
          </Box>

          {/* Minimalist, branded spinner */}
          <CircularProgress
            size={28}
            thickness={3.5}
            sx={{
              color: 'primary.main',
              opacity: 0.9,
            }}
          />
        </Box>
      </Box>
    </Fade>
  );
};

export default LoadingScreen;
