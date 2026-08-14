import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  useColorScheme,
  Box,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useLocale } from '../hooks/useLocale';

import tkmFlag from '../assets/language/tkm.png';
import rusFlag from '../assets/language/rus.png';
import usaFlag from '../assets/language/usa.png';

const LANGUAGES = [
  { code: 'tk', label: 'Türkmençe', shortLabel: 'TK', flag: tkmFlag },
  { code: 'ru', label: 'Русский', shortLabel: 'RU', flag: rusFlag },
  { code: 'en', label: 'English', shortLabel: 'EN', flag: usaFlag },
];

const LanguageSwitcher = ({ variant = 'header' }) => {
  const { t, currentLanguage, changeLang } = useLocale();
  const { mode } = useColorScheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const isDark = mode === 'dark';
  const isLogin = variant === 'login';

  const activeLangObj = LANGUAGES.find((l) => l.code === (currentLanguage || 'tk')) || LANGUAGES[0];

  const handleSelectLanguage = (lng) => {
    changeLang(lng);
    setAnchorEl(null);
  };

  /* ── Login variant styles ── */
  const loginTopBtnBg     = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const loginTopBtnBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
  const loginTopBtnText   = '#ffffff';
  const loginTextColor    = isDark ? '#ffffff' : '#1a1a2e';

  const loginButtonSx = {
    width: 142,
    minWidth: 142,
    maxWidth: 142,
    height: 36,
    px: 1.2,
    borderRadius: '10px',
    backgroundColor: loginTopBtnBg,
    border: `1px solid ${loginTopBtnBorder}`,
    color: loginTopBtnText,
    fontSize: '0.80rem',
    fontWeight: 600,
    textTransform: 'none',
    backdropFilter: 'blur(8px)',
    letterSpacing: '0.01em',
    justifyContent: 'space-between',
    '&:hover': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
    },
    transition: 'background 0.2s',
  };

  const loginMenuPaperSx = {
    mt: 1,
    borderRadius: '10px',
    backdropFilter: 'blur(12px)',
    backgroundColor: isDark ? 'rgba(20,40,60,0.95)' : 'rgba(255,255,255,0.97)',
    border: `1px solid ${loginTopBtnBorder}`,
    width: 142,
    p: 0.5,
  };

  const headerButtonSx = {
    width: 142,
    minWidth: 142,
    maxWidth: 142,
    borderRadius: '10px',
    height: 38,
    px: 1.2,
    backgroundColor: (theme) =>
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
    border: '1px solid',
    borderColor: (theme) =>
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
    color: (theme) =>
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.85)' : '#334155',
    textTransform: 'none',
    justifyContent: 'space-between',
    '&:hover': {
      backgroundColor: (theme) =>
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(0,0,0,0.07)',
      borderColor: (theme) =>
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.25)'
          : 'rgba(0,0,0,0.22)',
    },
    transition: 'all 0.2s ease',
  };

  const headerMenuPaperSx = {
    mt: 1.5,
    boxShadow: (theme) =>
      theme.palette.mode === 'dark'
        ? '0px 10px 30px rgba(0,0,0,0.4), 0px 0px 0px 1px rgba(255,255,255,0.08)'
        : '0px 10px 30px rgba(0,0,0,0.1), 0px 0px 0px 1px rgba(0,0,0,0.05)',
    borderRadius: '12px',
    width: 142,
    p: 0.5,
  };

  return (
    <>
      <Tooltip title={t('header.languageTooltip') || 'Language'}>
        <Button
          color={isLogin ? undefined : 'inherit'}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          startIcon={
            <Box
              component="img"
              src={activeLangObj.flag}
              alt={activeLangObj.label}
              sx={{
                width: 20,
                height: 14,
                borderRadius: '3px',
                objectFit: 'cover',
                boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
                display: 'block',
              }}
            />
          }
          endIcon={
            <KeyboardArrowDownIcon
              sx={{
                fontSize: 16,
                transition: 'transform 0.2s',
                transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'none',
                opacity: 0.8,
              }}
            />
          }
          sx={isLogin ? loginButtonSx : headerButtonSx}
        >
          <Typography
            variant="body2"
            noWrap
            sx={{
              flex: 1,
              textAlign: 'left',
              ml: 0.25,
              fontWeight: 600,
              fontSize: '0.85rem',
              color: isLogin ? loginTopBtnText : 'inherit',
            }}
          >
            {activeLangObj.label}
          </Typography>
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: isLogin ? loginMenuPaperSx : headerMenuPaperSx } }}
      >
        {LANGUAGES.map((lang) => {
          const isSelected = activeLangObj.code === lang.code;
          return (
            <MenuItem
              key={lang.code}
              selected={isSelected}
              onClick={() => handleSelectLanguage(lang.code)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                py: 0.8,
                px: 1.5,
                borderRadius: '8px',
                my: 0.25,
                color: isLogin ? loginTextColor : 'inherit',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected
                  ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(14,133,132,0.12)')
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(14,133,132,0.18)',
                },
              }}
            >
              <Box
                component="img"
                src={lang.flag}
                alt={lang.label}
                sx={{
                  width: 22,
                  height: 15,
                  borderRadius: '3px',
                  objectFit: 'cover',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  display: 'block',
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.85rem' }}>
                {lang.label}
              </Typography>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;


