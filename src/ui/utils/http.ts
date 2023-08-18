import { useCallback } from 'react';
import { useAuthorization } from './useAuth.js';

class FetchError extends Error { }

const getHeaders = () => {
  const h = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  });

  return h;
}


export interface HTTPClient {
  get: (path: string, signal: AbortSignal) => Promise<unknown>;
  post: (path: string, body: unknown, signal: AbortSignal) => Promise<unknown>;
}

export const useHttp = (): HTTPClient => {
  const { setLoggedIn } = useAuthorization();

  const makeRequest = useCallback(async (path: string, method: 'get'|'post'|'patch'|'put'|'delete', signal: AbortSignal, body?: unknown) => {
    const r = await fetch(path, {
      body: JSON.stringify(body),
      headers: getHeaders(),
      method,
      signal
    });
  
    if (r.status >= 400) {
      if (r.status === 401) {
        setLoggedIn(false);
      }

      console.error(r);
      throw new FetchError(`Error status ${r.status}`);
    }
 
    if (r.headers.get('Content-Type') === 'application/json' && +r.headers.get('Content-Length')! > 0) {
      const parsed = await r.json();

      return parsed;
    }

    return '';
  }, [setLoggedIn]);
  
  const get = useCallback(async (path: string, signal: AbortSignal) => {
    return makeRequest(path, 'get', signal);
  }, [makeRequest]);
  
  const post = useCallback(async (path: string, payload: unknown, signal: AbortSignal) => {
    return makeRequest(path, 'post', signal, payload);
  }, [makeRequest]);

  return {
    get,
    post
  }
}


