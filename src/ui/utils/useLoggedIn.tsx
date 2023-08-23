import React, { ComponentType, createContext, useContext, useState } from 'react';

interface LoggedInContextProps {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
}

const LoggedInContext = createContext<LoggedInContextProps>(null as any);

export const withLoggedInContext = <T extends React.JSX.IntrinsicAttributes>(Component: ComponentType<T>) => (props: T) => {
  const [loggedIn, setLoggedIn] = useState(false);

  return <LoggedInContext.Provider value={{
    loggedIn,
    setLoggedIn
  }}>
    <Component {...props} />
  </LoggedInContext.Provider>
};

export const useLoggedInContext = () => useContext(LoggedInContext);
