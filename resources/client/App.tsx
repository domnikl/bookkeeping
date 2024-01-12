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
import { createHashRouter, RouterProvider } from 'react-router-dom';
import PaymentsPage, { loader as paymentsLoader } from './components/pages/PaymentsPage';
import DashboardPage from './components/pages/DashboardPage';
import CategoriesPage from './components/pages/CategoriesPage';
import EditCategoryPage, {
  loader as categoryLoader,
  createLoader as categoryCreateLoader,
} from './components/pages/EditCategoryPage';
import ApplyTransactionPage, {
  loader as applyTransactionLoader,
} from './components/pages/ApplyTransactionPage';

export const queryClient = new QueryClient();
const router = createHashRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { path: '/categories/edit/:categoryId', Component: EditCategoryPage, loader: categoryLoader },
      { path: '/categories/:categoryId/payments', Component: PaymentsPage, loader: paymentsLoader },
      { path: '/categories/create', Component: EditCategoryPage, loader: categoryCreateLoader },
      { path: '/categories', Component: CategoriesPage },
      {
        path: '/transactions/apply/:transactionId',
        Component: ApplyTransactionPage,
        loader: applyTransactionLoader,
      },
      { path: '/payments', Component: PaymentsPage },
      { path: '/', Component: DashboardPage },
    ],
  },
]);

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
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enLocale}>
        <QueryClientProvider client={queryClient}>
          <Auth0Provider
            domain={auth0.domain}
            clientId={auth0.clientId}
            authorizationParams={{
              redirect_uri: window.location.origin,
            }}
          >
            <RouterProvider router={router} />
          </Auth0Provider>
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
