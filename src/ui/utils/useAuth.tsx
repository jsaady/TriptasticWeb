import { ComponentType, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LoginResponse } from '../features/auth/types.js';
import { useAsyncHttp } from './useAsync.js';
import { useLoggedInContext, withLoggedInContext } from './useLoggedIn.js';

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
  setLoggedIn: (loggedIn: boolean) => void;
  handleLoginResponse: (res: LoginResponse) => void;
  logout: () => void;
}

const AuthorizationContext = createContext<AuthState>(null as unknown as AuthState);

const withAuthorizationProvider = <T,>(Comp: ComponentType<T>) => (props: T & JSX.IntrinsicAttributes) => {
  const {loggedIn, setLoggedIn} = useLoggedInContext();

  const clientIdentifier = useMemo(() => {
    let storedClientIdentifier = localStorage.getItem('clientIdentifier');

    if (!storedClientIdentifier) {
      storedClientIdentifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('clientIdentifier', storedClientIdentifier);
    }

    return storedClientIdentifier;
  }, []);

  const [state, setState] = useState({
    me: undefined,
    loginState: LoginState.login
  });

  const [check, { loading }] = useAsyncHttp(async ({ get }) => {
    const response = await get<LoginResponse>('/api/auth/check');

    return handleLoginResponse(response);
  }, []);

  const handleLoginResponse = useCallback(({ code, success }: LoginResponse) => {
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
      loginState: newState
    }));

    setLoggedIn(success);
  }, [setLoggedIn, setState]);


  const [logout] = useAsyncHttp(async ({ post }) => {    
    await post('/api/auth/logout', {});

    setLoggedIn(false);
    setState(s => ({
      ...s,
      loginState: LoginState.login,
    }));
  }, [setLoggedIn]);

  useEffect(check, []);

  return <AuthorizationContext.Provider value={{
    ...state,
    clientIdentifier,
    loading,
    loggedIn,
    setLoggedIn,
    logout,
    handleLoginResponse
  }}>
    <Comp {...props} />
  </AuthorizationContext.Provider>
};

export const withAuthorization = <T extends JSX.IntrinsicAttributes>(comp: ComponentType<T>) => withLoggedInContext(withAuthorizationProvider(comp));

export const useAuthorization = () => useContext(AuthorizationContext);
