import React, { useCallback, useEffect, useState } from 'react';

const useAsync = <T,>(cb: () => Promise<T>) => {
  const [state, setState] = useState({
    loading: false,
    result: null as T,
    error: null as any
  });

  const trigger = useCallback(async () => {
    if (state.loading) return;

    setState(s => ({
      ...s,
      loading: true
    }));

    try {
      const result = await cb();

      setState(s => ({
        loading: false,
        result,
        error: null
      }));
    } catch (e) {
      setState(s => ({
        ...s,
        loading: false,
        error: e
      }));
    }
  }, [cb, state]);

  return [trigger, state] as const;
}

export const App = () => {
  
  const callApi = useCallback(async () => {
    return fetch('/api/', { headers: { Accept: 'application/json', 'Content-Type': 'application/json' }})
      .then(r => r.json())
      .then(d => JSON.stringify(d));
  }, []);
  const [doFetch, { result, loading, error }] = useAsync(callApi);

  useEffect(() => {
    doFetch();
  }, []);

  if (loading) return 'Loading...';

  console.log(result, error);

  return <h1>App {result}</h1>
}