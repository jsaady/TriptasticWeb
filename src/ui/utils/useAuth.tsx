import React, { ComponentType, createContext, useCallback, useContext, useState } from 'react';

export interface AuthState {
  loggedIn: boolean;
  me: any;
  setLoggedIn: (loggedIn?: boolean) => void;
  setMe: (me: any) => void;
}

const AuthorizationContext = createContext<AuthState>(null as unknown as AuthState);

export const withAuthorization = <T,>(Comp: ComponentType<T>) => (props: T & JSX.IntrinsicAttributes) => {
  const [state, setState] = useState({
    loggedIn: false,
    me: undefined
  });

  const setLoggedIn = useCallback((loggedIn?: boolean) => {
    setState(v => ({
      ...v,
      loggedIn: loggedIn ?? !v.loggedIn
    }))
  }, [setState]);

  const setMe = useCallback((me: any) => {
    setState(v => ({
      ...v,
      me
    }));
  }, [setState]);

  return <AuthorizationContext.Provider value={{
    ...state,
    setLoggedIn,
    setMe,
  }}>
    <Comp {...props} />
  </AuthorizationContext.Provider>
};

export const useAuthorization = () => useContext(AuthorizationContext);
