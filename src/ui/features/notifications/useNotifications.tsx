import { ComponentType, createContext, useContext, useEffect, useMemo } from 'react';
import { useAsync, useAsyncHttp } from '../../utils/useAsync.js';

interface NotificationState {
  supported: boolean;
  enabled: boolean;
}

interface NotificationContextState extends NotificationState {
  checkStatus: () => void;
  subscribe: () => void;
  unsubscribe: () => void;
}
const NotificationContext = createContext<NotificationContextState>(null as any)

export const withNotifications = <T extends React.JSX.IntrinsicAttributes>(Comp: ComponentType) => (props: T) => {
  const supported = useMemo(() => 'PushManager' in window && 'serviceWorker' in navigator, []);

  const [checkStatus, { result: enabled }] = useAsync(async () => {
    const reg = await navigator.serviceWorker.ready;
    const [permission, subscription] = await Promise.all([reg.pushManager.permissionState(), reg.pushManager.getSubscription()]);
    const enabled = !!subscription && permission === 'granted';
    console.log(permission, enabled);
    return enabled;
  }, []);

  const [subscribe] = useAsyncHttp(async ({ post, get }) => {
    if (!enabled) {
      const [{ publicKey }, permission, reg] = await Promise.all([
        get<{ publicKey: string }>('/api/notifications/vapid'),
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

      await post('/api/notifications/subscribe', subscription);

      checkStatus();
    }
  }, [enabled]);

  const [unsubscribe] = useAsyncHttp(async ({ post }) => {
    if (enabled) {
      const reg = await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.getSubscription();

      console.log(subscription);
      
      await subscription?.unsubscribe();
      
      await post('api/notifications/unsubscribe', {});
      
      checkStatus();
    }
  }, [enabled]);

  useEffect(checkStatus, []);

  return <NotificationContext.Provider value={{
    supported,
    enabled,
    checkStatus,
    subscribe,
    unsubscribe,
  }}>
    <Comp {...props} />
  </NotificationContext.Provider>
};

export const useNotifications = () => useContext(NotificationContext);
