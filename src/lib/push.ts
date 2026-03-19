/**
 * Utility to convert VAPID public key to Uint8Array for push subscription
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers Service Worker and Subscribes to Push Notifications
 */
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported on this browser.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  
  // Wait for SW to be ready
  const sw = await navigator.serviceWorker.ready;

  const subscription = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
  });

  // Send to server (deviceId no longer used for Set-based storage)
  const response = await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription })
  });

  if (!response.ok) {
    throw new Error('Failed to save subscription on server.');
  }

  return true;
}

/**
 * Unsubscribes from Push Notifications
 */
export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      // 1. Notify server first to remove from Redis
      try {
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        });
      } catch (e) {
        console.error("Failed to unsubscribe on server", e);
      }

      // 2. Unsubscribe locally
      await subscription.unsubscribe();
    }
  }
}
