import { useAuthorization } from '@ui/utils/useAuth.js';
import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';
import { LoginHeading, LogoutLink } from './LoginElements.js';

export interface LoginFormState {
  username: string;
  email: string;
  password: string;
}

export const Login = () => {
  const { loggedIn, logout, previousUsername } = useAuthorization();
  const { pathname } = useLocation();

  const heading = useMemo(() => {
    switch(pathname) {
      case '/login/reset-password':
        return 'Reset password';
      case '/login/update-password':
        return 'You must update your password to continue';
      case '/login':
      case '/login/':
        return previousUsername ? `Welcome back, ${previousUsername}!` : 'You must log in to continue';
      case '/login/forgot-password':
        return 'Forgot your password?';
      default:
        return '';
    }
  }, [pathname, previousUsername]);


  return <div className="max-w-lg mx-auto p-4 items-center bg-white top-10 relative dark:bg-inherit flex flex-col">
    {pathname !== '/login' && <LogoutLink className='w-full text-end' onClick={logout}>Back to login</LogoutLink>}
    {heading && <LoginHeading>{heading}</LoginHeading>}
    {loggedIn && <p data-testid="login-success">Log in succeeded</p>}

    <Outlet />
  </div>
};
