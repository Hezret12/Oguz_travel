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
          contrastText: '#011718',
        },
        background: {
          default: '#030F16',
          paper: '#081A24',
          secondary: '#0C2331',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
        action: {
          hover: 'rgba(255, 255, 255, 0.045)',
          selected: 'rgba(20, 184, 166, 0.14)',
        },
        subtable: { header: '#0B202D' },
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.35)' : 'none',
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'dark' ? '#0C2331' : '#ffffff',
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(45, 212, 191, 0.20)' : theme.palette.divider}`,
          borderRadius: 8,
          fontSize: '0.78rem',
          fontWeight: 500,
          padding: '6px 10px',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(0, 0, 0, 0.55)'
              : '0 8px 24px rgba(0, 0, 0, 0.08)',
        }),
        arrow: ({ theme }) => ({
          color: theme.palette.mode === 'dark' ? '#0C2331' : '#ffffff',
          '&::before': {
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(45, 212, 191, 0.20)' : theme.palette.divider}`,
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
        head: ({ theme }) => ({
          fontWeight: 650,
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 12,
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 14,
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
          boxShadow: theme.palette.mode === 'dark' ? '0 24px 60px rgba(0, 0, 0, 0.70)' : '0 20px 40px rgba(0, 0, 0, 0.10)',
        }),
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
