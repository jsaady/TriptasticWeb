import { useCallback } from 'react';
import { useAuthorization } from './useAuth.js';
import { useLoggedInContext } from './useLoggedIn.js';

class FetchError extends Error {
  constructor (public response: Response, public responseText: string) {
    super(`Error status ${response.status}`);
  }
}

const getHeaders = () => {
  const h = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  });

  return h;
}

export interface HTTPClient {
  get: <T = unknown>(path: string, signal: AbortSignal) => Promise<T>;
  del: <T = unknown>(path: string, signal: AbortSignal) => Promise<T>;
  post: <T = unknown>(path: string, body: unknown, signal: AbortSignal) => Promise<T>;
}

export const useHttp = (): HTTPClient => {
  const { setLoggedIn } = useLoggedInContext();

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
      throw new FetchError(r, await r.text());
    }

    if (r.headers.get('Content-Type')?.startsWith('application/json')) {
      const parsed = await r.json();

      return parsed;
    }

    return '';
  }, [setLoggedIn]);
  
  const get = useCallback(async (path: string, signal: AbortSignal) => {
    return makeRequest(path, 'get', signal);
  }, [makeRequest]);

  const del = useCallback(async (path: string, signal: AbortSignal) => {
    return makeRequest(path, 'delete', signal);
  }, [makeRequest]);
  
  const post = useCallback(async (path: string, payload: unknown, signal: AbortSignal) => {
    return makeRequest(path, 'post', signal, payload);
  }, [makeRequest]);

  return {
    get,
    del,
    post
  }
}


