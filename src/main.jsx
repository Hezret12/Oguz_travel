import '@mui/material/styles';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import './libs/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './libs/i18n';
import { ThemeProvider } from '@mui/material/styles';
import { themeConfig } from './libs/theme';


import { StyledEngineProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';

import { HelmetProvider } from 'react-helmet-async';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 30 * 60 * 1000,
    },
  },
});

import { Provider } from 'react-redux';
import store from './store';
import { AuthProvider } from './context/AuthProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <HelmetProvider>
      {/* disableTransitionOnChange: no CSS transitions run while the colour
          scheme flips, so large tables don't animate every cell at once. */}
      <ThemeProvider
        theme={themeConfig}
        defaultMode="light"
        modeStorageKey="theme"
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <AuthProvider>
              <StyledEngineProvider enableCssLayer>
                <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
                <App />
              </StyledEngineProvider>
            </AuthProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  </Provider>
);
