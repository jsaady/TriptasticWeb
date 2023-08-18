import React, { ComponentType, createContext, useCallback, useContext, useState } from 'react';

export interface AuthState {
  loggedIn: boolean;
  setLoggedIn: (loggedIn?: boolean) => void;
}

const AuthorizationContext = createContext<AuthState>(null as unknown as AuthState);

export const withAuthorization = <T,>(Comp: ComponentType<T>) => (props: T & JSX.IntrinsicAttributes) => {
  const [state, setState] = useState({
    loggedIn: false
  });

  const setLoggedIn = useCallback((loggedIn?: boolean) => {
    setState(v => ({
      ...v,
      loggedIn: loggedIn ?? !v.loggedIn
    }))
  }, [setState]);

  return <AuthorizationContext.Provider value={{
    ...state,
    setLoggedIn
  }}>
    <Comp {...props} />
  </AuthorizationContext.Provider>
};

export const useAuthorization = () => useContext(AuthorizationContext);
