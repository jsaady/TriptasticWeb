import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router';
import { styled } from 'styled-components';
import { useNotifications, withNotifications } from './features/notifications/useNotifications.js';
import { useAuthorization } from './utils/useAuth.js';
import { Link } from 'react-router-dom';
import { Icon } from './components/Icon.js';
const AuthenticatedWrapper = styled.div``;

const LogoutButton = styled.button`
  height: 2rem;
  width: 10rem;
  margin: 1rem;
  background-color: darkgrey;
  border: none;
  font-size: 16px;
`;

const DevicesButton = styled(Link)`
  height: 2rem;
  width: 10rem;
  margin: 1rem;
  background-color: darkgrey;
  border: none;
  padding: .5rem 4rem;
  text-decoration: none;
  color: black;
  font-size: 16px;
`;

export const Authenticated = withNotifications(() => {
  const { logout, loggedIn, loading } = useAuthorization();
  const { enabled, supported, subscribe, unsubscribe } = useNotifications();

  const subscribeButtonText = useMemo(() => {
    return !enabled ? 'Subscribe' : 'Unsubscribe';
  }, [enabled]);

  
  if (loading) return 'Loading...';
  
  if (loggedIn === false) {
    return <Navigate to="/login" replace={true} />;
  }

  return <AuthenticatedWrapper>
    <Icon icon="person-circle" />
    <LogoutButton onClick={logout}>
      Log out
    </LogoutButton>

    <DevicesButton to="/devices">
      Devices
    </DevicesButton>

    <LogoutButton disabled={!supported} onClick={enabled ? unsubscribe : subscribe}>
      {subscribeButtonText}
    </LogoutButton>
    <Outlet />
  </AuthenticatedWrapper>
});
