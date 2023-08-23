
export async function subscribe () {
  if ('PushManager' in window) {
    const vapidKeyRes = await fetch('/api/notifications/vapid'); // From server
    const res = await vapidKeyRes.json();

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error();
    }
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: res.publicKey,
    });
    await fetch('/api/notifications/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
  }
}

export async function setupSW () {
  if ('serviceWorker' in navigator) {
    await navigator.serviceWorker
      .register(new URL('./worker.ts', import.meta.url), { scope: '.', type: 'module' })
      .catch(err => {
        console.log('ServiceWorker registration falled: ', err);
      });
  }
}

