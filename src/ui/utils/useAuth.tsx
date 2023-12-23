import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { LoginResponse } from '../features/auth/types.js';
import { useAsyncHttp } from './useAsync.js';
import { useLoggedIn, withLoggedIn } from './useLoggedIn.js';
import { useGlobalSocket } from './useSocket.js';

export interface AuthState {
  loggedIn: boolean;
  clientIdentifier: string;
  loading: boolean;
  me?: { sub: number; email: string; };
  setLoggedIn: (loggedIn: boolean) => void;
  handleLoginResponse: (res: LoginResponse) => boolean;
  logout: () => void;
}

const authorizationContext = createContext<AuthState>(null as any);

const withAuthorizationContext = <P extends React.JSX.IntrinsicAttributes>(Component: React.FC<P>) => (props: P) => {
  const { loggedIn, setLoggedIn } = useLoggedIn();
  let [searchParams, setSearchParams] = useSearchParams();
  const [me, setMe] = useState<{ sub: number; email: string; }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { reconnect: globalSocketReconnect } = useGlobalSocket() ?? { reconnect: () => {} };

  const clientIdentifier = useMemo(() => {
    let storedClientIdentifier = localStorage.getItem('clientIdentifier');

    if (!storedClientIdentifier) {
      storedClientIdentifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('clientIdentifier', storedClientIdentifier);
    }

    return storedClientIdentifier;
  }, []);

  const handleLoginResponse = useCallback(({ code, success, data }: LoginResponse) => {
    switch (code) {
      case 'password_reset':
        navigate('/login/update-password');
        break;
      case 'verify_email':
        navigate('/login/verify-email');
        break;
    }
    setMe(data);
    setLoggedIn(success);

    if (success && pathname.startsWith('/login')) {
      globalSocketReconnect();
      navigate('/');
    }

    return success;
  }, [setLoggedIn, setMe, pathname, globalSocketReconnect]);

  const [check, { loading }] = useAsyncHttp(async ({ get }) => {
    const response = await get<LoginResponse>('/api/auth/check');

    return handleLoginResponse(response);
  }, [handleLoginResponse]);

  const [logout] = useAsyncHttp(async ({ post }) => {
    searchParams.delete('rpt');
    setSearchParams(searchParams);

    await post('/api/auth/logout', {});
    globalSocketReconnect();

    setLoggedIn(false);
  }, [setLoggedIn, globalSocketReconnect]);

  useEffect(() => {
    check();
  }, []);

  return <authorizationContext.Provider value={{
      me,
      clientIdentifier,
      loading,
      loggedIn,
      setLoggedIn,
      logout,
      handleLoginResponse
    }}>
    <Component {...props} />
  </authorizationContext.Provider>
};

export const withAuthorization = <P extends React.JSX.IntrinsicAttributes>(Component: React.FC<P>) => withLoggedIn(withAuthorizationContext(Component));

export const useAuthorization = () => {
  return useContext(authorizationContext);
};
