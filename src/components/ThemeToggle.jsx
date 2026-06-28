import { IconButton, Tooltip, useColorScheme } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTranslation } from 'react-i18next';

const ThemeToggle = ({ variant = 'header' }) => {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();

  const isDark = mode === 'dark';
  const toggleTheme = () => setMode(isDark ? 'light' : 'dark');

  const loginTopBtnBg     = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const loginTopBtnBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
  const loginTopBtnText   =  'rgba(255,255,255,0.90)';

  const loginSx = {
    width: 36,
    height: 36,
    borderRadius: '10px',
    backgroundColor: loginTopBtnBg,
    border: `1px solid ${loginTopBtnBorder}`,
    color: loginTopBtnText,
    backdropFilter: 'blur(8px)',
    '&:hover': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
    },
    transition: 'background 0.2s',
  };

  const isLogin = variant === 'login';

  return (
    <Tooltip title={isDark ? t('header.themeTooltipLight') : t('header.themeTooltipDark')}>
      <IconButton
        onClick={toggleTheme}
        color={isLogin ? undefined : 'inherit'}
        sx={isLogin ? loginSx : {}}
      >
        {isDark
          ? <LightModeIcon sx={isLogin ? { fontSize: 18 } : {}} />
          : <DarkModeIcon  sx={isLogin ? { fontSize: 18 } : {}} />
        }
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
