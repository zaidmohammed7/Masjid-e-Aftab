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
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-1 border border-emerald-100 dark:border-emerald-800/50">
            <Image src="/icon.png" alt="Logo" width={48} height={48} className="rounded-xl shadow-sm" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 leading-tight">Install App</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Better experience</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isIOS ? (
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                Tap <MoreHorizontal size={14} className="inline" /> then <Share size={14} className="inline" /> Share
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                Then <PlusSquare size={14} className="inline" /> Add to Home Screen
              </div>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Download size={14} />
              Install
            </button>
          )}
          
          <button 
            onClick={handleDismiss}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
