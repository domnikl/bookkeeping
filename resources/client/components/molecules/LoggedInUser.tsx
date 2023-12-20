import { Button, Typography } from '@mui/material';
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Button color="error" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      Log Out
    </Button>
  );
};

export default function LoggedInUser() {
  const { user } = useAuth0();

  return (
    <>
      <Typography sx={{ fontSize: 12 }} component="div">
        {user?.email}
      </Typography>
      <LogoutButton />
    </>
  );
}
