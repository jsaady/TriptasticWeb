import { useCallback } from 'react';
import { useLoggedIn } from './useLoggedIn.js';

export class FetchError extends Error {
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
  const { setLoggedIn } = useLoggedIn();

  const makeRequest = useCallback(async (path: string, method: 'get'|'post'|'patch'|'put'|'delete', signal: AbortSignal, body?: unknown) => {
    const originalResponse = await fetch(path, {
      body: JSON.stringify(body),
      headers: getHeaders(),
      method,
      signal
    });

    const response = originalResponse.clone();
  
    if (response.status >= 400) {
      if (response.status === 401) {
        setLoggedIn(false);
      }

      console.error(response);
      throw new FetchError(originalResponse, await response.text());
    }

    if (response.headers.get('Content-Type')?.startsWith('application/json')) {
      const parsed = await response.json();

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


