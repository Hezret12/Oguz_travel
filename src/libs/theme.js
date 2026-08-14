import { createTheme } from "@mui/material/styles";

export const themeConfig = createTheme({
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#0E8584',
          light: '#14B8A6',
          dark: '#095B5B',
          contrastText: '#ffffff',
        },
        background: {
          default: '#F4F6F8',
          paper: '#ffffff',
          secondary: '#F0F4F8',
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        },
        divider: 'rgba(0, 0, 0, 0.08)',
        subtable: { header: '#F8FAFC' },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#14B8A6',
          light: '#2DD4BF',
          dark: '#0D9488',
          contrastText: '#021415',
        },
        background: {
          default: '#090D16',
          paper: '#11192A',
          secondary: '#162238',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
        action: {
          hover: 'rgba(255, 255, 255, 0.04)',
          selected: 'rgba(20, 184, 166, 0.12)',
        },
        subtable: { header: '#152033' },
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          borderRadius: 14,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
              borderWidth: 1.5,
            },
          },
        }),
        icon: ({ theme }) => ({
          color: theme.palette.text.secondary,
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease',
          '&.MuiSelect-iconOpen': {
            transform: 'rotate(180deg)',
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
              borderWidth: 1.5,
            },
          },
        }),
        popupIndicator: ({ theme }) => ({
          color: theme.palette.text.secondary,
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease',
          '&.MuiAutocomplete-popupIndicatorOpen': {
            transform: 'rotate(180deg)',
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          margin: '2px 6px',
          padding: '8px 12px',
          fontSize: '0.875rem',
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          '&.Mui-selected': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(20, 184, 166, 0.16)'
                : 'rgba(14, 133, 132, 0.08)',
            color: theme.palette.primary.main,
            fontWeight: 600,
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(20, 184, 166, 0.22)'
                  : 'rgba(14, 133, 132, 0.12)',
            },
          },
        }),
      },
    },
  },
});
