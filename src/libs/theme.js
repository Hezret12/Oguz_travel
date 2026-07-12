import { createTheme } from "@mui/material/styles";

export const themeConfig = createTheme({
    colorSchemes: {
        light: {
            palette: {
                mode: 'light',
                primary: { main: '#0E8584' },
                background: {
                    default: '#ffffff',
                    paper: '#ffffff',
                    secondary: '#ffffff'
                },
                text: {
                    primary: '#333333',
                    secondary: '#555555',
                },
                subtable: { header: '#e7e6e1', }
            },
        },
        dark: {
            palette: {
                mode: 'dark',
                primary: { main: '#0E8584' },
                background: {
                    default: '#0B0F19',
                    paper: '#111827',
                    secondary: '#1F2937'
                },
                text: {
                    primary: '#F3F4F6',
                    secondary: '#9CA3AF',
                },
                divider: 'rgba(255, 255, 255, 0.08)',
                subtable: { header: '#1F2937', }
            },
        },
    },
});
