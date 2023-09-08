import { useState, createContext, PropsWithChildren, useContext } from 'react';

const loggedInContext = createContext(null as unknown as { loggedIn: boolean, setLoggedIn: (loggedIn: boolean) => void });

export const withLoggedIn = <P extends React.JSX.IntrinsicAttributes>(Component: React.FC<P>): React.FC<P> => (props: P) => {
  const [loggedIn, setLoggedIn] = useState(null as unknown as boolean);

  return <loggedInContext.Provider value={{loggedIn, setLoggedIn}}>
    <Component {...props} />
  </loggedInContext.Provider>
};

export const useLoggedIn = () => useContext(loggedInContext);