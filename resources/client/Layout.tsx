import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import 'regenerator-runtime/runtime.js';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import {
  AppBar,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import CategoryIcon from '@mui/icons-material/Category';
import PaymentsIcon from '@mui/icons-material/Euro';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import AuthPage from './components/pages/AuthPage';
import LoggedInUser from './components/molecules/LoggedInUser';

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link(itemProps, ref) {
  return <RouterLink ref={ref} {...itemProps} role={undefined} />;
});

interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
}

function ListItemLink(props: ListItemLinkProps) {
  const { icon, primary, to } = props;

  return (
    <li>
      <ListItemButton component={Link} to={to}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItemButton>
    </li>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { isAuthenticated } = useAuth0();

  return (
    <div>
      <CssBaseline />

      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <>
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed">
              <Toolbar>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                  onClick={() => setDrawerOpen(!drawerOpen)}
                >
                  <MenuIcon />

                  <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <List>
                      <ListItemLink to="/" icon={<InboxIcon />} primary="Dashboard" />
                      <ListItemLink to="/payments" icon={<PaymentsIcon />} primary="Payments" />
                      <ListItemLink to="/categories" icon={<CategoryIcon />} primary="Categories" />
                    </List>
                  </Drawer>
                </IconButton>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ flexGrow: 1, cursor: 'pointer' }}
                  onClick={() => navigate('/')}
                >
                  bookkeeping
                </Typography>
                <LoggedInUser />
              </Toolbar>
            </AppBar>
          </Box>

          <Container sx={{ marginTop: '70px' }} maxWidth={false}>
            <Outlet />
          </Container>
        </>
      )}
    </div>
  );
}
