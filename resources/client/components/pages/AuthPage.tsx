import { Button, Container, Stack, Typography } from '@mui/material';
import React from 'react';
import PageRoot from '../atoms/PageRoot';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button variant="contained" onClick={() => loginWithRedirect()}>
      Sign in
    </Button>
  );
};

export default function AuthPage() {
  return (
    <PageRoot>
      <Container maxWidth="sm">
        <Typography component="h1" variant="h2" align="center" color="primary.main" gutterBottom>
          bookkeeping
        </Typography>

        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          A place to bring order in the chaos that is personal finances.
        </Typography>

        <Typography align="center" color="text.secondary" paragraph sx={{ marginTop: '50px' }}>
          Please sign in with your favorite auth provider below:
        </Typography>

        <Stack sx={{ pt: 4 }} direction="row" spacing={2} justifyContent="center">
          <LoginButton />
        </Stack>
      </Container>
    </PageRoot>
  );
}
