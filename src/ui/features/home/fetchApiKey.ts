import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { useEffect, useState } from 'react';

export const useFetchApiKey = () => {
  const [fetch, { result, loading, error }] = useAsyncHttp(({ get }) => {
    return get<{ key: string }>('/api/map/stadiaKey');
  }, []);

  useEffect(() => {
    fetch();
  }, []);

  return {
    loading,
    result: result?.key,
  };
};
