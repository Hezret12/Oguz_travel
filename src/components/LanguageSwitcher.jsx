import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  useColorScheme,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';


const langLabel = { tk: 'Türkmen', ru: 'Русский', en: 'English' };

const LanguageSwitcher = ({ variant = 'header' }) => {
  const { t, i18n } = useTranslation();
  const { mode } = useColorScheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const isDark = mode === 'dark';

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setAnchorEl(null);
  };

  /* ── Login variant styles ── */
  const loginTopBtnBg    = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const loginTopBtnBorder= isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
  const loginTopBtnText  = '#ffffff';
  const loginTextColor   = isDark ? '#ffffff' : '#1a1a2e';

  const loginButtonSx = {
    height: 36,
    px: 1.8,
    borderRadius: '10px',
    backgroundColor: loginTopBtnBg,
    border: `1px solid ${loginTopBtnBorder}`,
    color: loginTopBtnText,
    fontSize: '0.80rem',
    fontWeight: 600,
    textTransform: 'none',
    backdropFilter: 'blur(8px)',
    letterSpacing: '0.01em',
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
    minWidth: 140,
  };

  const headerButtonSx = {
    textTransform: 'uppercase',
    fontWeight: 600,
    borderRadius: '10px',
    height: 38,
    px: 1.5,
    color: (theme) =>
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#334155',
    '&:hover': {
      backgroundColor: (theme) =>
        theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(0,0,0,0.06)',
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
    p: 0.5,
  };

  const isLogin = variant === 'login';

  return (
    <>
      <Tooltip title={t('header.languageTooltip')}>
        <Button
          color={isLogin ? undefined : 'inherit'}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          startIcon={<LanguageIcon sx={isLogin ? { fontSize: 18 } : {}} />}
          sx={isLogin ? loginButtonSx : headerButtonSx}
        >
          {isLogin
            ? (langLabel[i18n.language] ?? 'Türkmen')
            : (i18n.language || 'tk')}
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: isLogin ? loginMenuPaperSx : headerMenuPaperSx } }}
      >
        <MenuItem
          onClick={() => changeLanguage('tk')}
          sx={isLogin ? { color: loginTextColor, fontSize: '0.875rem' } : {}}
        >
          {isLogin ? '🇹🇲 \u00a0 Türkmençe' : 'Türkmençe (TK)'}
        </MenuItem>
        <MenuItem
          onClick={() => changeLanguage('ru')}
          sx={isLogin ? { color: loginTextColor, fontSize: '0.875rem' } : {}}
        >
          {isLogin ? '🇷🇺 \u00a0 Русский' : 'Русский (RU)'}
        </MenuItem>
        <MenuItem
          onClick={() => changeLanguage('en')}
          sx={isLogin ? { color: loginTextColor, fontSize: '0.875rem' } : {}}
        >
          {isLogin ? '🇬🇧 \u00a0 English' : 'English (EN)'}
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
