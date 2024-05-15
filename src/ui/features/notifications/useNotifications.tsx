import { ComponentType, createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useAsync, useAsyncHttp } from '@ui/utils/useAsync.js';

interface NotificationState {
  supported: boolean;
  enabled: boolean;
  currentPreferences: any;
}

interface NotificationContextState extends NotificationState {
  checkStatus: () => void;
  subscribe: () => void;
  unsubscribe: () => void;
}
const NotificationContext = createContext<NotificationContextState>(null as any)

export const withNotifications = <T extends React.JSX.IntrinsicAttributes>(Comp: ComponentType) => (props: T) => {
  const supported = useMemo(() => 'PushManager' in window && 'serviceWorker' in navigator, []);

  const [fetchCurrentPreferences, { result: currentPreferences }] = useAsyncHttp(({ get }) => get('/api/notifications/preferences'), []);

  const [subscribeToAll] = useAsyncHttp(async ({ post }) => {
    if (supported) {
      await post('/api/notifications/preferences/all', {});
      fetchCurrentPreferences();
    }
  }, []);

  const [checkBrowserStatus, { result: enabled }] = useAsync(async () => {
    const reg = await navigator.serviceWorker.ready;
    const [permission, subscription] = await Promise.all([reg.pushManager.permissionState({ userVisibleOnly: true }), reg.pushManager.getSubscription()]);
    const enabled = !!subscription && permission === 'granted';

    return enabled;
  }, []);

  const [saveDevice] = useAsyncHttp(async ({ post, get }) => {
    if (!enabled) {
      const [{ publicKey }, permission, reg] = await Promise.all([
        get<{ publicKey: string }>('/api/notifications/devices/vapid'),
        Notification.requestPermission(),
        navigator.serviceWorker.ready
      ]);

      if (permission === "denied") {
        alert("Notifications blocked. Please enable them in your browser.");
      }

      if (permission !== 'granted') return;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      await post('/api/notifications/devices/subscribe', subscription);

      checkBrowserStatus();
    }
  }, [enabled]);

  const [removeAllDevices] = useAsyncHttp(async ({ post }) => {
    if (enabled) {
      const reg = await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.getSubscription();
      
      await subscription?.unsubscribe();
      
      await post('api/notifications/devices/unsubscribe', {});
      
      checkBrowserStatus();
    }
  }, [enabled]);

  useEffect(checkBrowserStatus, []);
  useEffect(fetchCurrentPreferences, []);

  const subscribe = useCallback(() => {
    saveDevice();
    subscribeToAll();
  }, []);

  const unsubscribe = useCallback(() => {
    removeAllDevices();
  }, [removeAllDevices]);

  return <NotificationContext.Provider value={{
    supported,
    enabled,
    currentPreferences,
    checkStatus: checkBrowserStatus,
    subscribe,
    unsubscribe,
  }}>
    <Comp {...props} />
  </NotificationContext.Provider>
};

export const useNotifications = () => useContext(NotificationContext);
