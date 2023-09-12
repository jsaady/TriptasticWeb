import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { LoginResponse } from '../features/auth/types.js';
import { useAsyncHttp } from './useAsync.js';
import { useLoggedIn, withLoggedIn } from './useLoggedIn.js';

export enum LoginState {
  login,
  resetPassword,
  verifyEmail,
  registerMfa,
  loginMfa
}

export interface AuthState {
  loggedIn: boolean;
  clientIdentifier: string;
  loginState: LoginState;
  loading: boolean;
  me?: { sub: number; email: string; };
  setLoggedIn: (loggedIn: boolean) => void;
  handleLoginResponse: (res: LoginResponse) => boolean;
  logout: () => void;
}

const authorizationContext = createContext<AuthState>(null as any);

const withAuthorizationContext = <P extends React.JSX.IntrinsicAttributes>(Component: React.FC<P>) => (props: P) => {
  const { loggedIn, setLoggedIn } = useLoggedIn();

  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const clientIdentifier = useMemo(() => {
    let storedClientIdentifier = localStorage.getItem('clientIdentifier');

    if (!storedClientIdentifier) {
      storedClientIdentifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('clientIdentifier', storedClientIdentifier);
    }

    return storedClientIdentifier;
  }, []);

  const [state, setState] = useState({
    loginState: search.get('rpt') ? LoginState.resetPassword : LoginState.login
  });

  const handleLoginResponse = useCallback(({ code, success, data }: LoginResponse) => {
    let newState: LoginState;
    switch (code) {
      case 'password_reset':
        newState = LoginState.resetPassword;
        break;
      case 'verify_email':
        newState = LoginState.verifyEmail;
        break;
      case 'mfa_registration_required':
        newState = LoginState.registerMfa;
        break;
      case 'mfa_login_required':
        newState = LoginState.loginMfa;
        break;
      default:
        newState = LoginState.login;
        break;
    }
    
    setState(s => ({
      ...s,
      loginState: newState,
      me: data
    }));

    setLoggedIn(success);

    return success;
  }, [setLoggedIn, setState]);

  const [check, { loading }] = useAsyncHttp(async ({ get }) => {
    const response = await get<LoginResponse>('/api/auth/check');

    return handleLoginResponse(response);
  }, []);

  const [logout] = useAsyncHttp(async ({ post }) => {
    search.delete('rpt');

    location.search = search.toString();

    await post('/api/auth/logout', {});

    setLoggedIn(false);
    setState(s => ({
      ...s,
      loginState: LoginState.login,
    }));
  }, [setLoggedIn]);

  useEffect(() => {
    check();
  }, []);

  return <authorizationContext.Provider value={{
      ...state,
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
