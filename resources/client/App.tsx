import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import 'regenerator-runtime/runtime.js';
import { createTheme, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import enLocale from 'date-fns/locale/en-GB';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from 'react-query';
import { auth0 } from './auth0';
import Layout from './Layout';

export const queryClient = new QueryClient();

export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#6489E8',
      },
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} locale={enLocale}>
        <QueryClientProvider client={queryClient}>
          <Auth0Provider
            domain={auth0.domain}
            clientId={auth0.clientId}
            authorizationParams={{
              redirect_uri: window.location.origin,
            }}
          >
            <Layout />
          </Auth0Provider>
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
