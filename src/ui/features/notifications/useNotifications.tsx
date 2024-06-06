import { UserRole } from '@api/features/users/userRole.enum.js';
import { useAsync, useAsyncHttp } from '@ui/utils/useAsync.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { ComponentType, createContext, useCallback, useContext, useEffect, useMemo } from 'react';

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
  const { me } = useAuthorization();

  const supported = useMemo(() => 'PushManager' in window && 'serviceWorker' in navigator, []);

  const [fetchCurrentPreferences, { result: currentPreferences }] = useAsyncHttp(({ get }) => get('/api/notifications/preferences'), []);
  const [fetchCurrentDevices, { result: currentDevices }] = useAsyncHttp(({ get }) => get<any[]>('/api/notifications/devices'), []);

  const [subscribeToAll] = useAsyncHttp(async ({ post }) => {
    if (supported) {
      await post('/api/notifications/preferences/all', {});
      fetchCurrentPreferences();
    }
  }, []);

  const [checkBrowserStatus, { result }] = useAsync(async () => {
    const reg = await navigator.serviceWorker.ready;
    let [permission, subscription] = await Promise.all([reg.pushManager.permissionState({ userVisibleOnly: true }), reg.pushManager.getSubscription()]);
    let enabled = !!subscription && permission === 'granted';

    if (subscription && currentDevices) {
      const dupe = currentDevices?.find((d: any) => d.endpoint === subscription?.endpoint);

      console.log(dupe, subscription, currentDevices)

      if (!dupe && subscription) {
        // assume it was deleted from the db or that it failed, let the user re-subscribe
        subscription?.unsubscribe();
        enabled = false;
        subscription = null;
      }
    }

    return [enabled, subscription, permission] as const;
  }, [currentDevices]);

  const [enabled, subscription] = result || [false, null, 'denied'] as const;

  const [saveDevice] = useAsyncHttp(async ({ post, get }) => {
    const [{ publicKey }, reg] = await Promise.all([
      get<{ publicKey: string }>('/api/notifications/devices/vapid'),
      navigator.serviceWorker.ready
    ]);

    if (!subscription) {
      const newSubscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      await post('/api/notifications/devices/subscribe', newSubscription);
    }

    fetchCurrentDevices();
  }, [enabled, subscription, fetchCurrentDevices]);

  const subscribe = useCallback(() => Notification.requestPermission().then(async (permission) => {
    if (permission === "denied") {
      alert("Notifications blocked. Please enable them in your browser.");
    }

    if (permission !== 'granted') return;

    saveDevice();
    subscribeToAll();
  }), [saveDevice]);


  const [removeAllDevices] = useAsyncHttp(async ({ post }) => {
    if (enabled) {
      const reg = await navigator.serviceWorker.ready;

      const subscription = await reg.pushManager.getSubscription();

      await subscription?.unsubscribe();
      
      await post('api/notifications/devices/unsubscribe', {});
      
      checkBrowserStatus();
    }
  }, [enabled]);

  useEffect(() => {me && me?.role !== UserRole.GUEST && fetchCurrentPreferences()}, [me]);
  useEffect(() => {me && me?.role !== UserRole.GUEST && fetchCurrentDevices()}, [me]);
  useEffect(() => {checkBrowserStatus()}, [currentDevices]);

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
