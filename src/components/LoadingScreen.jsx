import { Box, CircularProgress, Typography, Fade } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Fade in={true} timeout={400}>
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
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {/* Outer glow container for spinner */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: 80,
            }}
          >
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'dark' ? '#38BDF8' : '#2563EB',
              }}
            />
            {/* Subtle inner pulse decoration */}
            <Box
              sx={{
                position: 'absolute',
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#38BDF8' : '#2563EB',
                opacity: 0.15,
                animation: 'pulse 1.5s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(0.8)', opacity: 0.2 },
                  '50%': { transform: 'scale(1.2)', opacity: 0.5 },
                  '100%': { transform: 'scale(0.8)', opacity: 0.2 },
                },
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#F1F5F9' : '#1E293B',
              fontFamily: 'Outfit, Inter, sans-serif',
              animation: 'shimmer 2s infinite ease-in-out',
              '@keyframes shimmer': {
                '0%, 100%': { opacity: 0.6 },
                '50%': { opacity: 1 },
              },
            }}
          >
            OGUZ TRAVEL
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default LoadingScreen;
