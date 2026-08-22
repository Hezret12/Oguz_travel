import { useState, useCallback, memo } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import { ChevronDown } from 'lucide-react';
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
  const [anchorEl, setAnchorEl] = useState(null);

  const isLogin = variant === 'login';

  // Normalize language code (e.g. 'tk-TM' -> 'tk')
  const normalizedLang = (currentLanguage || 'tk').slice(0, 2).toLowerCase();
  const activeLangObj = LANGUAGES.find((l) => l.code === normalizedLang) || LANGUAGES[0];

  const handleOpen = useCallback((e) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSelectLanguage = useCallback((lng) => {
    changeLang(lng);
    setAnchorEl(null);
  }, [changeLang]);

  return (
    <>
      <Tooltip title={t('header.languageTooltip') || 'Language'}>
        <Button
          id="language-switcher-button"
          aria-controls={anchorEl ? 'language-switcher-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={anchorEl ? 'true' : undefined}
          onClick={handleOpen}
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
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: anchorEl ? 'rotate(180deg)' : 'none',
                opacity: 0.8,
              }}
            >
              <ChevronDown size={15} />
            </Box>
          }
          sx={{
            width: 142,
            minWidth: 142,
            maxWidth: 142,
            height: isLogin ? 36 : 38,
            px: 1.2,
            borderRadius: '10px',
            textTransform: 'none',
            justifyContent: 'space-between',
            border: '1px solid',
            borderColor: isLogin
              ? 'rgba(255,255,255,0.18)'
              : (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(0,0,0,0.12)',
            backgroundColor: isLogin
              ? 'rgba(255,255,255,0.10)'
              : (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.03)',
            color: isLogin
              ? '#ffffff'
              : (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.85)'
                    : 'text.primary',
            backdropFilter: 'blur(8px)',
            '&:hover': {
              backgroundColor: isLogin
                ? 'rgba(255,255,255,0.18)'
                : (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(0,0,0,0.07)',
            },
            transition: 'all 0.2s ease',
          }}
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
              color: 'inherit',
            }}
          >
            {activeLangObj.label}
          </Typography>
        </Button>
      </Tooltip>

      <Menu
        id="language-switcher-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'language-switcher-button',
          },
          paper: {
            sx: {
              mt: 1,
              borderRadius: '12px',
              width: 142,
              p: 0.5,
              backdropFilter: isLogin ? 'blur(12px)' : undefined,
              backgroundColor: isLogin
                ? (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(20,40,60,0.95)'
                      : 'rgba(255,255,255,0.97)'
                : undefined,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0px 10px 30px rgba(0,0,0,0.4), 0px 0px 0px 1px rgba(255,255,255,0.08)'
                  : '0px 10px 30px rgba(0,0,0,0.1), 0px 0px 0px 1px rgba(0,0,0,0.05)',
            },
          },
        }}
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
                px: 1.2,
                borderRadius: '8px',
                my: 0.25,
                fontSize: '0.85rem',
                fontWeight: isSelected ? 700 : 500,
              }}
            >
              <Box
                component="img"
                src={lang.flag}
                alt={lang.label}
                sx={{
                  width: 20,
                  height: 14,
                  borderRadius: '3px',
                  objectFit: 'cover',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  display: 'block',
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.85rem' }}
              >
                {lang.label}
              </Typography>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default memo(LanguageSwitcher);


