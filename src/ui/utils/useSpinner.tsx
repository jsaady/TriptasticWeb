import { ComponentType, createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';

const SpinnerContext = createContext<[boolean, Dispatch<boolean>, number, Dispatch<SetStateAction<number>>]>(null as any);

export const withSpinner = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => {
    const [loadingCount, setLoadingCount] = useState(0);
    const [progress, setProgress] = useState(0);

    const loading = loadingCount > 0;

    const setLoading = useCallback((value: boolean) => {
      setLoadingCount((prev) => (prev || value) ? prev + (value ? 1 : -1) : 0);
    }, []);


    return (
      <SpinnerContext.Provider value={[loading, setLoading, progress, setProgress]}>
        <Component {...props} />
      </SpinnerContext.Provider>
    );
  };
};

export const useSpinner = () => {
  const [spinning, setSpinning] = useContext(SpinnerContext);

  return [spinning, setSpinning] as const;
};

export const useSpinnerProgress = () => {
  const [,,progress, setProgress] = useContext(SpinnerContext);

  return [progress, setProgress] as const;
};
