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
  },
});
