import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  useColorScheme,
  TextField,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getRoleHomePath } from '../../utils/auth';

import { Helmet } from 'react-helmet-async';
import { handleError, hdlErrResMsg, hdlSuccessResMsg } from '../../functions/generalHelpers';
import { loginApi } from '../../api/queries/post';
import { useValidShema } from '../../functions/useValidShema';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ThemeToggle from '../../components/ThemeToggle';

import eyeIcon from '../../assets/icons/eye.svg';
import closeEyeIcon from '../../assets/icons/closeEye.svg';
import PhoneNumberField from '../../components/inputs/PhoneNumber';
import OguzLogo from '../../assets/icons/OguzLogo';


export default function Login() {
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();
  const { loginValidSchema } = useValidShema();
  const { mode } = useColorScheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { phone: '', password: '' },
    resolver: yupResolver(loginValidSchema),
    mode: 'onSubmit',
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      if (response?.status === 200) {
        const payload = response?.data?.data;
        if (payload?.user?.user_is_login || payload?.access_token) {
          const authenticatedUser = login({
            ...payload,
            accessToken: payload?.accessToken || payload?.access_token,
            refreshToken: payload?.refreshToken || payload?.refresh_token,
            user: payload?.user || null,
            tableNames: payload?.tableNames || null,
          });
          hdlSuccessResMsg(response);
          navigate(getRoleHomePath(authenticatedUser.role), { replace: true });
        } else {
          hdlErrResMsg(response);
        }
      }
    },
    onError: (error) => {
      handleError('Failed to login: ', error);
    },
  });

  const onSubmit = (values) => {
    if (loginMutation.isPending) return;
    loginMutation.mutate({
      password: values.password?.trim(),
      phone_number: values.phone?.trim(),
    });
  };

  const isDark = mode === 'dark';
  const textColor = isDark ? '#DDDDDD' : '#ffffff';

  const pageBg = isDark
    ? 'linear-gradient(135deg, rgba(2, 24, 25, 0.64) 0%, rgba(2, 44, 69, 0.48) 100%)'
    : 'linear-gradient(135deg, rgba(11, 79, 74, 0.64) 0%, rgba(0, 95, 120, 0.56) 50%, rgba(0, 150, 137, 0.48) 100%)';

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `${pageBg}, url('/loginBanner.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        px: { xs: 2, sm: 3 },
        py: { xs: 7, sm: 4 },
        transition: 'background 0.4s ease',
      }}
    >
      <Helmet>
        <title>{t('pages.login.welcomeTitle')} | Oguz Travel</title>
        <link rel="preload" as="image" href="/loginBanner.jpg" />
      </Helmet>

      {/* Glow circles */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 280, sm: 500 },
          height: { xs: 280, sm: 500 },
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(43,181,160,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(43,181,160,0.15) 0%, transparent 70%)',
          top: '-100px',
          right: '-80px',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 240, sm: 400 },
          height: { xs: 240, sm: 400 },
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
          bottom: '-60px',
          left: '-60px',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative sweep lines */}
      {[25, 50, 75].map((top, i) => (
        <Box
          key={top}
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            width: 340,
            height: 2,
            borderRadius: '9999px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.20)' : '#FFFFFF33',
            top: `${top}vh`,
            left: 0,
            pointerEvents: 'none',
            animation: `sweepRight 12s linear infinite ${i * 4}s`,
            '@keyframes sweepRight': {
              '0%':   { transform: 'translateX(-380px)', opacity: 0 },
              '10%':  { opacity: 0.8 },
              '90%':  { opacity: 0.8 },
              '100%': { transform: 'translateX(100vw)',  opacity: 0 },
            },
          }}
        />
      ))}

      {/* Top-right controls */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 12, sm: 20 },
          right: { xs: 12, sm: 24 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.75, sm: 1 },
          zIndex: 10,
        }}
      >
        <LanguageSwitcher variant="login" />
        <ThemeToggle variant="login" />
      </Box>

      {/* Card */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: '100%',
          maxWidth: { xs: 390, sm: 460, md: 480 },
          height: 'auto',
          borderRadius: { xs: '20px', sm: '24px' },
          background: isDark
            ? 'linear-gradient(135deg, rgba(2, 24, 25, 0.64) 0%, rgba(2, 44, 69, 0.48) 100%), var(--Button-main-10, #04070B1A)'
            : 'var(--Button-main-10, #7676761A)',
          border: isDark
            ? '1px solid var(--Button-main-20, #5B626833)'
            : '1px solid var(--Button-main-20, #FFFFFF33)',
          backdropFilter: 'blur(10px)',
          boxShadow: isDark
            ? '0px 25px 50px 0px rgba(0, 0, 0, 0.25)'
            : '0px 25px 50px 0px #00000040',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: '28px', sm: '36px' },
          pb: { xs: '28px', sm: '36px' },
          px: { xs: '20px', sm: '36px' },
          gap: { xs: '24px', sm: '36px', md: '44px' },
          transition: 'background 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: { xs: '4px', sm: '12px' },
          }}
        >
          <OguzLogo
            sx={{
              width: { xs: 165, sm: 220 },
              height: 'auto',
              display: 'block',
              '& path': { fill: '#FFFFFF !important' },
            }}
          />
        </Box>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: { xs: 2.5, sm: 2.8 } }}>

          <Box sx={{ width: '100%' }}>
            <PhoneNumberField
              control={control}
              name="phone"
              error={errors.phone}
              variant="login"
              disabled={loginMutation.isPending}
            />
          </Box>

          {/* Password */}
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography
                sx={{
                  color: 'var(--Text-btn, #FFFFFF)',
                  fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 510,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('columns.password')}
              </Typography>
              {isCapsLockOn && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#facc15',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                >
                  ⇪ Caps Lock ON
                </Typography>
              )}
            </Box>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  disabled={loginMutation.isPending}
                  type={passwordVisibility ? 'text' : 'password'}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  onKeyDown={(e) => setIsCapsLockOn(Boolean(e.getModifierState && e.getModifierState('CapsLock')))}
                  onKeyUp={(e) => setIsCapsLockOn(Boolean(e.getModifierState && e.getModifierState('CapsLock')))}
                  onBlur={() => setIsCapsLockOn(false)}
                  slotProps={{
                    htmlInput: {
                      autoComplete: 'current-password',
                    },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setPasswordVisibility((v) => !v)}
                            edge="end"
                            disabled={loginMutation.isPending}
                            sx={{
                              color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)',
                              padding: 1,
                            }}
                          >
                            {passwordVisibility ? (
                              <Box
                                component="img"
                                src={closeEyeIcon}
                                alt="Hide password"
                                sx={{ width: 32, height: 'auto', display: 'block', opacity: isDark ? 0.7 : 0.55 }}
                              />
                            ) : (
                              <Box
                                component="img"
                                src={eyeIcon}
                                alt="Show password"
                                sx={{ width: 32, height: 'auto', display: 'block', opacity: isDark ? 0.7 : 0.55 }}
                              />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    position: 'relative',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      backgroundColor: 'transparent',
                      borderColor: isDark ? '#8A8A8A' : '#BEBEBE',
                      fontSize: '1rem',
                      color: textColor,
                      height: { xs: 48, sm: 50 },
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      gap: '10px',
                      transition: 'background-color 0.3s ease, border-color 0.3s ease',
                      '& fieldset': {
                        borderColor: isDark ? '#8A8A8A' : '#BEBEBE',
                        transition: 'border-color 0.3s ease',
                      },
                      '&:hover fieldset': { borderColor: '#15C3C2' },
                      '&.Mui-focused': { backgroundColor: '#0E858433' },
                      '&.Mui-focused fieldset': { borderColor: '#15C3C2', borderWidth: 1 },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '10px 0px',
                      color: textColor,
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#f87171',
                      fontSize: '0.75rem',
                      ml: 0.5,
                      mt: 0.5,
                    },
                  }}
                />
              )}
            />
          </Box>

          {/* Submit button */}
          <Box
            component="button"
            type="submit"
            disabled={loginMutation.isPending}
            sx={{
              mt: { xs: 1, sm: 1.5 },
              width: '100%',
              height: { xs: 48, sm: 52 },
              border: 'none',
              borderRadius: '16px',
              background: loginMutation.isPending
                ? 'rgba(43,181,160,0.6)'
                : isDark
                  ? 'linear-gradient(90deg, #0D9488 0%, #228EA1 100%)'
                  : 'linear-gradient(90deg, #10A396 0%, #29B2C5 100%)',
              color: '#ffffff',
              fontFamily: "'Inter', sans-serif",
              fontSize: { xs: '1rem', sm: '1.05rem' },
              fontWeight: 700,
              letterSpacing: '0.04em',
              padding: '10px',
              cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              boxShadow: '0 4px 20px rgba(43,181,160,0.35)',
              transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
              '&:hover:not(:disabled)': {
                opacity: 0.92,
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 28px rgba(43,181,160,0.50)',
              },
              '&:active:not(:disabled)': {
                transform: 'translateY(0)',
              },
            }}
          >
            {loginMutation.isPending ? (
              <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : (
              t('login.loginButton')
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


