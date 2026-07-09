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
                    default: '#000000',
                    paper: '#121213',
                    secondary: '#212224'
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#bbbbbb',
                },
                subtable: { header: '#242424', }
            },
        },
    },
});
