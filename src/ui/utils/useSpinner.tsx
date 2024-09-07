import { ComponentType, createContext, Dispatch, useCallback, useContext, useState } from 'react';

const SpinnerContext = createContext<[boolean, Dispatch<boolean>]>(null as any);

export const withSpinner = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => {
    const [loadingCount, setLoadingCount] = useState(0);

    const loading = loadingCount > 0;

    const setLoading = useCallback((value: boolean) => {
      setLoadingCount((prev) => (prev || value) ? prev + (value ? 1 : -1) : 0);
    }, []);


    return (
      <SpinnerContext.Provider value={[loading, setLoading]}>
        <Component {...props} />
      </SpinnerContext.Provider>
    );
  };
};

export const useSpinner = () => {
  return useContext(SpinnerContext);
};
