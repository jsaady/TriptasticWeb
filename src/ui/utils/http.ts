import { useCallback } from 'react';
import { useLoggedIn } from './useLoggedIn.js';
import { useGlobalSocket } from './useSocket.js';
import { getCurrentInviteCode, setCurrentInviteCode } from './inviteCodeStorage.js';

export class FetchError extends Error {
  constructor (public response: Response, public responseText: string) {
    super(`Error status ${response.status}`);
  }
}

const getHeaders = (socketId: string, body: any) => {
  const h = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Socket-Id': socketId
  });

  const inviteCode = getCurrentInviteCode();

  if (inviteCode) {
    h.set('X-Invite-Code', inviteCode);
  }

  if (body instanceof FormData) {
    h.delete('Content-Type');
  }

  return h;
}

export interface HTTPClient {
  get: <T = unknown>(path: string, signal: AbortSignal) => Promise<T>;
  del: <T = unknown>(path: string, signal: AbortSignal) => Promise<T>;
  post: <T = unknown>(path: string, body: unknown, signal: AbortSignal) => Promise<T>;
  patch: <T = unknown>(path: string, body: unknown, signal: AbortSignal) => Promise<T>;
  put: <T = unknown>(path: string, body: unknown, signal: AbortSignal) => Promise<T>;
}

export const useHttp = (): HTTPClient => {
  const { setLoggedIn } = useLoggedIn();
  const globalSocketState = useGlobalSocket();

  const makeRequest = useCallback(async (path: string, method: 'get'|'post'|'patch'|'put'|'delete', signal: AbortSignal, body?: any) => {
    const originalResponse = await fetch(path, {
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: getHeaders(globalSocketState.socket?.id ?? '', body),
      method,
      signal
    });

    const response = originalResponse.clone();
  
    if (response.status >= 400) {
      if (response.status === 401) {
        setLoggedIn(false);
        setCurrentInviteCode('');
      }

      console.error(response);
      throw new FetchError(originalResponse, await response.text());
    }

    if (response.headers.get('Content-Type')?.startsWith('application/json')) {
      const parsed = await response.json();

      return parsed;
    }

    return '';
  }, [setLoggedIn, globalSocketState]);
  
  const get = useCallback(async (path: string, signal: AbortSignal) => {
    return makeRequest(path, 'get', signal);
  }, [makeRequest]);

  const del = useCallback(async (path: string, signal: AbortSignal) => {
    return makeRequest(path, 'delete', signal);
  }, [makeRequest]);
  
  const post = useCallback(async (path: string, payload: unknown, signal: AbortSignal) => {
    return makeRequest(path, 'post', signal, payload);
  }, [makeRequest]);

  const put = useCallback(async (path: string, payload: unknown, signal: AbortSignal) => {
    return makeRequest(path, 'put', signal, payload);
  }, [makeRequest]);

  const patch = useCallback(async (path: string, payload: unknown, signal: AbortSignal) => {
    return makeRequest(path, 'patch', signal, payload);
  }, [makeRequest]);

  return {
    get,
    del,
    post,
    put,
    patch,
  }
}


