"use client";

import { useEffect } from "react";

export default function ClearBadge() {
  useEffect(() => {
    // Clear badge if supported
    if ("setAppBadge" in navigator) {
      (navigator as any).setAppBadge(0).catch(() => {});
    }

    // Clear notifications from status bar when app is opened/focused
    const clearNotifications = async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const notifications = await registration.getNotifications();
        notifications.forEach((notification) => notification.close());
      }
    };

    clearNotifications();

    // Also clear on focus events (e.g. when returning to app from background)
    window.addEventListener("focus", clearNotifications);
    return () => window.removeEventListener("focus", clearNotifications);
  }, []);

  return null;
}
