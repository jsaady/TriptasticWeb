import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HTTPClient, useHttp } from './http.js';
import { AlertType, useAlert } from './alerts.js';

export const useAsync = <T, A extends any[]> (asyncCall: (...args: A) => Promise<T>, deps: any[]) => {
  const [state, setState] = useState({
    result: null as null | T,
    loading: false,
    error: null as any
  });

  const loadingRef = useRef(false);

  const cb = useCallback(asyncCall, deps);

  const trigger = useCallback((...args: A) => {
    (async () => {
      if (loadingRef.current) {
        return;
      }
  
      loadingRef.current = true;

      setState(s => ({
        ...s,
        loading: true
      }));
  
      try {
        const result = await cb(...args);
        setState(_ => ({
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
      } finally {
        loadingRef.current = false;
        setState(s => ({
          ...s,
          loading: false
        }));
      }
    })();
  }, [cb, ...deps]);

  return [trigger, state] as const;
};

type Pop<T, O extends any[] = []> = T extends [infer Head, ...infer Tail] ? Tail extends [any] ? [...O, Head] : Pop<Tail, [...O, Head]> : [];

type AsyncHTTPClient = {
  [x in keyof HTTPClient]: <T = unknown>(...args: Pop<Parameters<HTTPClient[x]>>) => Promise<T>;
};

export const useAsyncHttp = <T, A extends any[]>(call: (http: AsyncHTTPClient, ...rest: A) => Promise<T>, deps: any[]) => {
  const httpClient = useHttp();
  const controller = useMemo(() => new AbortController(), []);
  const cancel = useCallback(() => controller.abort(), [controller]);

  const http = useMemo<AsyncHTTPClient>(() => ({
    get: (path: string) => httpClient.get(path, controller.signal),
    post: (path: string, body: any) => {
      return httpClient.post(path, body, controller.signal)
    },
    put: (path: string, body: any) => httpClient.put(path, body, controller.signal),
    del: (path: string) => httpClient.del(path, controller.signal),
    patch: (path: string, body: any) => httpClient.patch(path, body, controller.signal),
  }), [httpClient, controller]);

  const asyncCb = useCallback((...args: A) => {
    return call(http, ...args);
  }, [http, call, ...deps]);

  const [trigger, state] = useAsync(asyncCb, [asyncCb]);

  const makeCall = useCallback((...args: A) => {
    trigger(...args);

    return cancel;
  }, [trigger]);

  return [makeCall, state, cancel] as const;
}

export const useAsyncHttpWithAlert = <T, A extends any[]>(call: (http: AsyncHTTPClient, ...rest: A) => Promise<T>, deps: any[], successMessage: string, failMessage: string) => {
  const alert = useAlert();

  return useAsyncHttp<T, A>(async (http, ...args) => {
    try {
      const r = await call(http, ...args);
  
      alert(successMessage, AlertType.Success, 3000);

      return r;
    } catch (e) {
      alert(failMessage, AlertType.Error, 3000);

      throw e;
    }
  }, [...deps, alert]);
};
