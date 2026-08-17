import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/useAuth';
import { getRoleHomePath } from '../../utils/auth';

import { handleError, hdlErrResMsg, hdlSuccessResMsg } from '../../functions/generalHelpers';
import { loginApi } from '../../api/queries/post';
import { useValidShema } from '../../functions/useValidShema';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
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

  useDocumentTitle(`${t('login.title')} | Oguz Travel`);

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
          navigate(getRoleHomePath(authenticatedUser?.role), { replace: true });
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
    ? 'linear-gradient(180deg, rgba(2, 16, 22, 0.45) 0%, rgba(1, 24, 32, 0.60) 100%)'
    : 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.04) 100%)';

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
        backgroundPosition: { xs: 'center 62%', sm: 'center 64%', md: 'center 66%' },
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 5, sm: 6 },
        transition: 'background 0.4s ease',
      }}
    >

      {/* Decorative sweep lines */}
      {[20, 50, 80].map((top, i) => (
        <Box
          key={top}
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            width: 360,
            height: 2,
            borderRadius: '9999px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.22)',
            top: `${top}vh`,
            left: 0,
            pointerEvents: 'none',
            animation: `sweepRight 14s linear infinite ${i * 4.5}s`,
            '@keyframes sweepRight': {
              '0%':   { transform: 'translateX(-400px)', opacity: 0 },
              '10%':  { opacity: 0.8 },
              '90%':  { opacity: 0.8 },
              '100%': { transform: 'translateX(100vw)',  opacity: 0 },
            },
          }}
        />
      ))}

      {/* Top-right controls with glass backdrop */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 28 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.25 },
          zIndex: 10,
        }}
      >
        <LanguageSwitcher variant="login" />
        <ThemeToggle variant="login" />
      </Box>

      {/* Glassmorphic Login Card */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 490, md: 530, lg: 550 },
          height: 'auto',
          borderRadius: { xs: '24px', sm: '28px', md: '32px' },
          background: isDark
            ? 'rgba(0, 15, 20, 0.28)'
            : 'rgba(255, 255, 255, 0.04)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.16)'
            : '1px solid rgba(255, 255, 255, 0.25)',
          backdropFilter: isDark ? 'blur(10px)' : 'blur(4px)',
          WebkitBackdropFilter: isDark ? 'blur(10px)' : 'blur(4px)',
          boxShadow: isDark
            ? '0 20px 45px rgba(0, 0, 0, 0.45)'
            : '0 15px 35px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: '32px', sm: '40px', md: '44px' },
          pb: { xs: '32px', sm: '42px', md: '48px' },
          px: { xs: '24px', sm: '40px', md: '48px' },
          gap: { xs: '36px', sm: '48px', md: '56px' },
          animation: 'cardAppear 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
          '@keyframes cardAppear': {
            '0%': {
              opacity: 0,
              transform: 'translateY(24px) scale(0.97)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0) scale(1)',
            },
          },
          transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        }}
      >
        {/* Logo & Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: { xs: '4px', sm: '8px' },
            width: '100%',
          }}
        >
          <OguzLogo
            sx={{
              width: { xs: 180, sm: 220, md: 240 },
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.20))',
              '& path': { fill: '#FFFFFF !important' },
            }}
          />
        </Box>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 3.5 } }}>

          {/* Phone number field */}
          <Box sx={{ width: '100%' }}>
            <PhoneNumberField
              control={control}
              name="phone"
              error={errors.phone}
              variant="login"
              disabled={loginMutation.isPending}
            />
          </Box>

          {/* Password field */}
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.25,
                    borderRadius: '6px',
                    backgroundColor: 'rgba(250, 204, 21, 0.15)',
                    border: '1px solid rgba(250, 204, 21, 0.35)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#facc15',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    ⇪ Caps Lock ON
                  </Typography>
                </Box>
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
                              color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.65)',
                              padding: 1,
                              transition: 'color 0.2s ease, transform 0.15s ease',
                              '&:hover': {
                                color: '#ffffff',
                                transform: 'scale(1.08)',
                              },
                            }}
                          >
                            {passwordVisibility ? (
                              <Box
                                component="img"
                                src={closeEyeIcon}
                                alt="Hide password"
                                sx={{ width: 32, height: 'auto', display: 'block', opacity: 0.85 }}
                              />
                            ) : (
                              <Box
                                component="img"
                                src={eyeIcon}
                                alt="Show password"
                                sx={{ width: 32, height: 'auto', display: 'block', opacity: 0.85 }}
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
                      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.08)',
                      borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
                      fontSize: '1rem',
                      color: textColor,
                      height: { xs: 48, sm: 52 },
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      gap: '10px',
                      transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                      '& fieldset': {
                        borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
                        transition: 'border-color 0.3s ease',
                      },
                      '&:hover fieldset': { borderColor: '#15C3C2' },
                      '&.Mui-focused': {
                        backgroundColor: isDark ? 'rgba(14, 133, 132, 0.22)' : 'rgba(14, 133, 132, 0.18)',
                        boxShadow: '0 0 0 3px rgba(21, 195, 194, 0.25)',
                      },
                      '&.Mui-focused fieldset': { borderColor: '#15C3C2', borderWidth: 1.5 },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '10px 0px',
                      color: `${textColor} !important`,
                      WebkitTextFillColor: `${textColor} !important`,
                    },
                    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
                      WebkitTextFillColor: `${textColor} !important`,
                      WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                      transition: 'background-color 5000s ease-in-out 0s',
                    },
                    '& .MuiFormHelperText-root': {
                      position: 'absolute',
                      bottom: '-20px',
                      left: 4,
                      margin: 0,
                      color: '#f87171',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      lineHeight: 1.2,
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
              mt: { xs: 1.5, sm: 2 },
              width: '100%',
              height: { xs: 50, sm: 54 },
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
              padding: '10px 20px',
              cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              boxShadow: '0 4px 20px rgba(43,181,160,0.35)',
              transition: 'opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
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
              <CircularProgress size={22} sx={{ color: '#fff' }} />
            ) : (
              t('login.title')
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


