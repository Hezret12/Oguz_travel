import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  InputAdornment,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { openModal } from '../../store/slices/modalSlice';
import { Helmet } from 'react-helmet-async';

const UserDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const destinations = [
    { title: t('user.destinations.antalya.title'), desc: t('user.destinations.antalya.desc'), img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80', price: t('user.destinations.antalya.price') },
    { title: t('user.destinations.rome.title'), desc: t('user.destinations.rome.desc'), img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80', price: t('user.destinations.rome.price') },
    { title: t('user.destinations.tokyo.title'), desc: t('user.destinations.tokyo.desc'), img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80', price: t('user.destinations.tokyo.price') },
  ];

  return (
    <Box sx={{ py: 2 }}>
      <Helmet>
        <title>{t('user.title') || 'User Dashboard'} | Oguz Travel</title>
      </Helmet>
      {/* Welcome Hero Card */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          borderRadius: '16px',
          boxShadow: '0px 10px 30px rgba(59, 130, 246, 0.2)',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {t('user.welcome', { name: user?.name.split(' ')[0] })}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
          {t('user.readyToExplore')}
        </Typography>

        {/* Quick Search Widget */}
        <Grid container spacing={2} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', p: 2, borderRadius: '12px', backdropFilter: 'blur(5px)' }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              placeholder={t('user.search.from')}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&:hover fieldset': { borderColor: 'white' },
                },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightTakeoffIcon sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              placeholder={t('user.search.to')}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&:hover fieldset': { borderColor: 'white' },
                },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button variant="contained" color="secondary" fullWidth sx={{ height: '40px', fontWeight: 700, backgroundColor: 'white', color: '#1e3a8a', '&:hover': { backgroundColor: '#f1f5f9' } }}>
              {t('user.search.button')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Suggested Destinations */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        {t('user.popular')}
      </Typography>

      <Grid container spacing={3}>
        {destinations.map((dest, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card sx={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 20px rgba(0,0,0,0.03)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="160"
                image={dest.img}
                alt={dest.title}
              />
              <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {dest.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {dest.desc}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                    {dest.price}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ fontWeight: 600 }}
                    onClick={() => {
                      dispatch(
                        openModal({
                          modalType: 'INFO',
                          modalProps: {
                            title: dest.title,
                            content: `${dest.desc} ${t('user.readyToExplore')}`,
                          },
                        })
                      );
                    }}
                  >
                    {t('user.details')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserDashboard;
