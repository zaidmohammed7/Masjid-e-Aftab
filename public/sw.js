self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const prayerType = data.prayerType; // e.g., 'fajr'

    // Check preferences from IndexedDB
    event.waitUntil(
      checkPreference(prayerType).then(shouldShow => {
        if (shouldShow) {
          const options = {
            body: data.body || `It's time for ${prayerType} prayer.`,
            icon: '/notification-icon.png',
            badge: '/notification-icon.png',
            vibrate: [200, 100, 200, 100, 200], // Stronger physical alert
            tag: `prayer-alert-${prayerType}`,
            renotify: true,
            data: {
              dateOfArrival: Date.now(),
              primaryKey: '1'
            }
          };
          return self.registration.showNotification(data.title || 'Masjid-e-Aftab Alert', options);
        } else {
          console.log(`Notification for ${prayerType} suppressed by user preferences.`);
          return Promise.resolve();
        }
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Helper to check IndexedDB for prayer preferences
async function checkPreference(prayerType) {
  return new Promise((resolve) => {
    const request = indexedDB.open('keyval-store', 1);
    request.onerror = () => resolve(true); // Default to true if DB fails
    request.onsuccess = (event) => {
      const db = event.target.result;
      try {
        const transaction = db.transaction(['keyval'], 'readonly');
        const store = transaction.objectStore('keyval');
        const getReq = store.get(`prayer_alert_${prayerType.toLowerCase()}`);
        getReq.onsuccess = () => {
          // If the specifically saved key is false, suppress it.
          // If it's undefined (not set yet) or true, show it.
          resolve(getReq.result !== false);
        };
        getReq.onerror = () => resolve(true);
      } catch (e) {
        resolve(true); 
      }
    };
  });
}
