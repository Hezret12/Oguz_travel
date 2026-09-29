import { createTheme } from "@mui/material/styles";

export const themeConfig = createTheme({
  defaultColorScheme: 'light',
  // Mirrors the active scheme onto <html data-mui-color-scheme="…"> so plain CSS
  // (scrollbars, nprogress in index.css) can follow the theme.
  colorSchemeSelector: 'data-mui-color-scheme',
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
          default: '#090A0F',
          paper: '#12131A',
          secondary: '#181A24',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
        action: {
          hover: 'rgba(255, 255, 255, 0.045)',
          selected: 'rgba(20, 184, 166, 0.16)',
        },
        subtable: { header: '#151621' },
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    // Browser autofill forces its own (black) text color; keep the theme's text
    // color so autofilled values stay readable in dark mode.
    MuiInputBase: {
      styleOverrides: {
        input: ({ theme }) => ({
          '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
            WebkitTextFillColor: theme.palette.text.primary,
            caretColor: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          boxShadow: 'none',
          ...theme.applyStyles('dark', {
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.50)',
          }),
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: '#ffffff',
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 8,
          fontSize: '0.78rem',
          fontWeight: 500,
          padding: '6px 10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          ...theme.applyStyles('dark', {
            backgroundColor: '#181A24',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
          }),
        }),
        arrow: ({ theme }) => ({
          color: '#ffffff',
          '&::before': {
            border: `1px solid ${theme.palette.divider}`,
            ...theme.applyStyles('dark', {
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }),
          },
          ...theme.applyStyles('dark', {
            color: '#181A24',
          }),
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
          border: 'none',
          ...theme.applyStyles('dark', {
            border: `1px solid ${theme.palette.divider}`,
          }),
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 14,
          border: 'none',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.10)',
          ...theme.applyStyles('dark', {
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.70)',
          }),
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
            backgroundColor: 'rgba(14, 133, 132, 0.08)',
            color: theme.palette.primary.main,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(14, 133, 132, 0.12)',
            },
            ...theme.applyStyles('dark', {
              backgroundColor: 'rgba(20, 184, 166, 0.16)',
              '&:hover': {
                backgroundColor: 'rgba(20, 184, 166, 0.22)',
              },
            }),
          },
        }),
      },
    },
  },
});
