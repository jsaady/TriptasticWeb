import { ButtonHTMLAttributes, PropsWithChildren, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useNotifications, withNotifications } from './features/notifications/useNotifications.js';
import { useAuthorization } from './utils/useAuth.js';
import { Link } from 'react-router-dom';
import { Icon } from './components/Icon.js';

const AuthenticatedWrapper: React.FC<PropsWithChildren> = ({ children }) => <div>{children}</div>

const LogoutButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button className='' {...props}></button>
}

const DevicesButton = Link;

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
