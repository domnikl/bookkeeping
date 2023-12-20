import { Button, Stack, Typography } from "@mui/material";
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
      <Stack direction="row" alignItems="center">
        <img
          src={user?.picture}
          alt={user?.given_name}
          style={{ maxHeight: '48px', marginRight: '5px', borderRadius: '50%' }}
        />

        <Typography sx={{ fontSize: 12, marginRight: '5px' }} component="div">
          {user?.given_name}
        </Typography>

        <LogoutButton />
      </Stack>
    </>
  );
}
