"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Download, Share, MoreHorizontal, PlusSquare } from "lucide-react";

export default function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // 2. Check persistence (dismissed for 7 days)
    const lastDismissed = localStorage.getItem("install_banner_dismissed");
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed);
      const now = new Date();
      const diffDays = Math.ceil((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) return;
    }

    // 3. Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 4. Handle Android/Chrome Install Prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // 5. Show for iOS automatically since they don't have the prompt event
    if (isIOSDevice) {
      setShowBanner(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowBanner(false);
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("install_banner_dismissed", new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-28 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] p-5 shadow-[0_25px_50px_-15px_rgba(197,160,89,0.25)] border border-champagne dark:border-gray-800 flex flex-col gap-5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 flex-shrink-0 bg-gold/5 dark:bg-gold/10 rounded-2xl p-1 border border-champagne dark:border-gray-800 shadow-sm">
              <Image src="/icon-192x192.png" alt="Logo" width={56} height={56} className="rounded-xl" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-serif font-black text-[#2d2d2d] dark:text-gray-100 leading-tight">Install Masjid App</h3>
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mt-0.5">Gold Edition • Official PWA</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-2 text-gray-300 hover:text-gold transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="w-full">
          {isIOS ? (
            <div className="bg-gold/5 dark:bg-gold/5 p-5 rounded-[2rem] border border-champagne/50 dark:border-gray-800">
              <p className="text-gold/60 text-[8px] font-black uppercase tracking-[0.3em] mb-4 text-center">One-time Manual Setup:</p>
              <div className="flex flex-col gap-4 px-2">
                <div className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-gold text-white rounded-full flex items-center justify-center text-[11px] font-black shadow-sm">1</span>
                  <p className="text-xs font-bold text-[#2d2d2d] dark:text-gray-300">
                    Tap <MoreHorizontal size={16} className="inline text-gold mx-1" /> beside browser URL
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-gold text-white rounded-full flex items-center justify-center text-[11px] font-black shadow-sm">2</span>
                  <p className="text-xs font-bold text-[#2d2d2d] dark:text-gray-300">
                    Tap <Share size={16} className="inline text-gold mx-1" /> Share icon
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-6 h-6 bg-gold text-white rounded-full flex items-center justify-center text-[11px] font-black shadow-sm">3</span>
                  <p className="text-xs font-bold text-[#2d2d2d] dark:text-gray-300">
                    Scroll and tap <PlusSquare size={16} className="inline text-gold mx-1" /> Add to Home Screen
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-3 bg-gold hover:bg-[#8E6D2F] text-white p-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gold/20 active:scale-95 transition-all"
            >
              <Download size={18} />
              Install Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
