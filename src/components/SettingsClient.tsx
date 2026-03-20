"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Lock, Info, ChevronRight, Share2, Star, ShieldCheck, X, MapPin, Phone, Settings, Sunrise, Sunset, CloudSun, Bell, Download } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";
import clsx from "clsx";
import { get, set } from "idb-keyval";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push";

interface SettingItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: React.ReactNode;
  href?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export default function SettingsClient() {
  const { theme, toggleTheme } = useTheme();
  const [prayerAlerts, setPrayerAlerts] = useState(false);
  const [individualAlerts, setIndividualAlerts] = useState<Record<PrayerKey, boolean>>({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  });

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      const enabled = await get("prayer_alerts_enabled");
      setPrayerAlerts(!!enabled);
      
      const pKeys: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
      const newIdxAlerts = { ...individualAlerts };
      for (const k of pKeys) {
        const val = await get(`prayer_alert_${k}`);
        if (val !== undefined) newIdxAlerts[k] = !!val;
      }
      setIndividualAlerts(newIdxAlerts);
    }
    loadPrefs();

    // Check if currently in standalone mode and persist it
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      localStorage.setItem('msjd_pwa_installed', 'true');
    }

    const handler = (e: any) => {
      e.preventDefault();
      // If we got an install prompt, it means the app is NOT currently installed (at least for Chrome)
      localStorage.removeItem('msjd_pwa_installed');
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleTogglePrayerAlerts = async () => {
    const newVal = !prayerAlerts;
    setPrayerAlerts(newVal);
    await set("prayer_alerts_enabled", newVal);

    if (newVal) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          await subscribeToPush();
        } else {
          setPrayerAlerts(false);
          await set("prayer_alerts_enabled", false);
          alert("Permission denied. Please enable notifications in your browser settings.");
        }
      } catch (e: any) {
        console.error("Subscription Error:", e);
        alert("Subscription Failed: " + (e.message || "Unknown Error"));
        setPrayerAlerts(false);
        await set("prayer_alerts_enabled", false);
      }
    } else {
      await unsubscribeFromPush();
    }
  };

  const handleToggleIndividual = async (key: PrayerKey) => {
    const newVal = !individualAlerts[key];
    setIndividualAlerts(prev => ({ ...prev, [key]: newVal }));
    await set(`prayer_alert_${key}`, newVal);
  };

  const handleInstall = async () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isStoredAsInstalled = localStorage.getItem('msjd_pwa_installed') === 'true';

    // If we are currently IN the app
    if (isStandalone) {
      localStorage.setItem('msjd_pwa_installed', 'true');
      alert("Masjid App is already installed on your device.");
      return;
    }

    if (deferredPrompt) {
      // Chrome/Android knows it's not installed
      localStorage.removeItem('msjd_pwa_installed');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem('msjd_pwa_installed', 'true');
        setDeferredPrompt(null);
      }
    } else if (isStoredAsInstalled) {
      // We previously detected it was installed (shared localStorage across browser/standalone)
      alert("Masjid App seems to be already installed! Please check your home screen or apps list.");
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert("To Install: Tap the 3 dots (...) beside the URL, then select the 'Share' icon, and finally 'Add to Home Screen'.");
      } else {
        alert("To Install: Tap the browser menu (usually 3 dots in the top-right) and select 'Install app' or 'Add to home screen'.");
      }
    }
  };

  const sections: SettingSection[] = [
    {
      title: "Preferences",
      items: [
        {
          id: "dark-mode",
          label: "Dark Mode",
          icon: theme === "dark" ? <Moon size={24} className="text-blue-400" /> : <Sun size={24} className="text-amber-500" />,
          action: (
            <button 
              onClick={toggleTheme}
              className={clsx(
                "w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center",
                theme === "dark" ? "bg-gold justify-end" : "bg-gray-300 justify-start"
              )}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md" />
            </button>
          )
        },
        {
          id: "prayer-alerts",
          label: "Prayer Alerts",
          icon: <Bell size={24} className="text-gold" />,
          action: (
            <div className="flex flex-col items-end gap-3">
              <button 
                onClick={handleTogglePrayerAlerts}
                className={clsx(
                  "w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center",
                  prayerAlerts ? "bg-gold justify-end" : "bg-gray-300 justify-start"
                )}
              >
                <div className="w-6 h-6 bg-white rounded-full shadow-md" />
              </button>
            </div>
          )
        }
      ]
    },
    {
      title: "Application",
      items: [
        {
          id: "install",
          label: "Install on Phone",
          icon: <Download size={24} className="text-gold" />,
          action: (
            <button 
              onClick={handleInstall}
              className="bg-gold/10 text-gold dark:text-gold px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-champagne dark:border-gray-800"
            >
              Get App
            </button>
          )
        },
        {
          id: "share",
          label: "Share App",
          icon: <Share2 size={24} className="text-gold" />,
          action: (
            <button 
              onClick={async (e) => {
                e.preventDefault();
                const shareData = {
                  title: 'Masjid-e-Aftab',
                  text: 'Follow local prayer times and announcements at Masjid-e-Aftab.',
                  url: 'https://masjid-e-aftab.vercel.app/'
                };
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                  try {
                    await navigator.share(shareData);
                  } catch (err) { }
                } else {
                  navigator.clipboard.writeText(shareData.url);
                  alert("App link copied to clipboard!");
                }
              }}
              className="bg-gold/10 text-gold dark:text-gold px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-champagne dark:border-gray-800"
            >
              Share
            </button>
          )
        },
        {
          id: "about",
          label: "About",
          icon: <Info size={24} className="text-gold" />,
          action: (
            <button onClick={() => setIsAboutOpen(true)}>
              <ChevronRight className="text-gray-400" />
            </button>
          )
        }
      ]
    },
    {
      title: "Access",
      items: [
        {
          id: "admin",
          label: "Administration",
          icon: <Lock size={24} className="text-gold" />,
          href: "/admin",
          action: <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-100 dark:border-red-900/50">Restricted</div>
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pb-32 font-sans selection:bg-gold/30">
      <div className="sticky top-0 z-40 bg-gradient-to-br from-[#C5A059] via-[#D5B06A] to-[#8E6D2F] text-white pt-6 pb-8 px-8 rounded-b-[3.5rem] shadow-[0_20px_40px_-15px_rgba(197,160,89,0.4)] relative overflow-hidden text-center">
        <div className="absolute top-10 right-10 opacity-10 mix-blend-overlay rotate-12">
          <Settings size={160} />
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-champagne rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border border-champagne rounded-full blur-2xl opacity-50" />
        </div>
        <h1 className="text-4xl font-serif font-black relative z-10 tracking-tight leading-tight drop-shadow-lg uppercase">
          Settings
        </h1>
        <p className="text-white/90 text-lg font-medium mt-2 relative z-10 tracking-wide drop-shadow-md">
          Preferences & Info
        </p>
      </div>

      <div className="p-6 pt-12 relative z-20 space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="px-5 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">{section.title}</h2>
            <div className="bg-[var(--card-bg)] rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-[var(--card-border)] overflow-hidden divide-y divide-[var(--card-border)]">
              {section.items.map((item: SettingItem) => {
                const content = (
                  <div key={item.id} className="flex flex-col">
                    <div className="flex items-center justify-between p-6 hover:bg-[var(--card-hover)] transition-colors active:scale-[0.98]">
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-[#242628] p-3 rounded-2xl">
                          {item.icon}
                        </div>
                        <span className="font-bold text-[var(--card-text)] text-lg">{item.label}</span>
                      </div>
                      {item.action}
                    </div>
                    
                    {/* Inline Prayer Sub-Toggles */}
                    {item.id === "prayer-alerts" && prayerAlerts && (
                      <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col gap-1">
                          <button 
                            onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
                            className="flex items-center justify-between w-full p-2 mb-1 text-gold dark:text-gold font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-80 transition-all border-b border-champagne dark:border-gray-800 pb-2"
                          >
                            {isAlertsExpanded ? "Hide Settings" : "Adjust Individual Alerts"}
                            <ChevronRight className={clsx("transition-transform duration-300", isAlertsExpanded ? "rotate-90" : "rotate-0")} size={14} />
                          </button>
                          
                          {isAlertsExpanded && (
                            <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-300">
                              {[
                                { key: "fajr", label: "Fajr", script: "فجر", icon: <Sunrise size={18} className="text-amber-500" /> },
                                { key: "dhuhr", label: "Dhuhr", script: "ظہر", icon: <Sun size={18} className="text-gold" /> },
                                { key: "asr", label: "Asr", script: "عصر", icon: <CloudSun size={18} className="text-gold" /> },
                                { key: "maghrib", label: "Maghrib", script: "مغرب", icon: <Sunset size={18} className="text-gold" /> },
                                { key: "isha", label: "Isha", script: "عشاء", icon: <Moon size={18} className="text-gold" /> },
                              ].map((p) => (
                                <div key={p.key} className="flex items-center justify-between p-2 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                                      {p.icon}
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <span className="text-sm font-bold text-[var(--card-text)]">{p.label}</span>
                                      <span className="text-[10px] font-medium text-gray-400 text-left">{p.script}</span>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => handleToggleIndividual(p.key as PrayerKey)}
                                    className={clsx(
                                      "w-10 h-5 rounded-full p-0.5 transition-colors flex items-center",
                                      individualAlerts[p.key as PrayerKey] ? "bg-gold justify-end" : "bg-gray-300 justify-start"
                                    )}
                                  >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );

                if (item.href) {
                  return (
                    <Link key={item.id} href={item.href}>
                      {content}
                    </Link>
                  );
                }
                return content;
              })}
            </div>
          </div>
        ))}
        
        <div className="text-center pt-8 pb-4">
          <div className="flex items-center justify-center gap-2 text-gold mb-2">
            <ShieldCheck size={20} />
            <span className="font-black tracking-widest text-xs uppercase font-serif">Secure & Private</span>
          </div>
          <p className="text-gray-400 text-sm font-bold font-serif">Masjid-e-Aftab v1.7.0</p>
          <p className="text-gray-300 dark:text-gray-600 text-[10px] sm:text-xs mt-1 font-black uppercase tracking-widest">Gold Edition • Official PWA</p>
        </div>
      </div>

      {isAboutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-6 sm:p-8 shadow-2xl dark:shadow-none relative animate-in zoom-in-95 border border-champagne dark:border-gold/20 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gold z-10" />
            
            <button
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full active:scale-90 z-20"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mt-2 shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gold/10 dark:bg-gold/20 rounded-2xl flex items-center justify-center text-gold mb-3 shadow-inner">
                 <Info size={28} className="sm:size-32" />
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#2d2d2d] dark:text-gray-100 tracking-tight">Masjid-e-Aftab</h3>
            </div>

            <div className="mt-6 space-y-4">
               <div className="flex gap-3">
                  <div className="bg-gold/10 dark:bg-gold/20 p-2.5 rounded-xl text-gold flex-shrink-0">
                     <MapPin size={20} />
                  </div>
                  <div className="text-left">
                     <p className="font-black text-[10px] uppercase tracking-widest text-gold mb-0.5">Location</p>
                     <p className="font-bold text-gray-700 dark:text-gray-300 text-[13px] leading-tight">123 Mosque Street, Community City</p>
                  </div>
               </div>

               <div className="flex gap-3">
                  <div className="bg-gold/10 dark:bg-gold/20 p-2.5 rounded-xl text-gold flex-shrink-0">
                     <Phone size={20} />
                  </div>
                  <div className="text-left">
                     <p className="font-black text-[10px] uppercase tracking-widest text-gold mb-0.5">Contact</p>
                     <p className="font-bold text-gray-700 dark:text-gray-300 text-[13px] leading-tight">+91 999 888 7777</p>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-gold/5 to-champagne/10 dark:from-gold/20 dark:to-gold/10 p-4 rounded-[1.5rem] border border-champagne dark:border-gold/20 shadow-inner overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                     <Star size={16} className="text-gold fill-gold" />
                     <p className="font-black text-[10px] uppercase tracking-widest text-[#8E6D2F] dark:text-gold">Support Us</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-[12px] sm:text-[13px] mb-3 leading-tight">Your contributions help us maintain the mosque.</p>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-champagne dark:border-gold/30 shadow-sm dark:shadow-none">
                     <p className="text-[10px] font-black uppercase text-gold mb-0.5">GPay / Paytm</p>
                     <p className="text-base sm:text-lg font-black text-[#2d2d2d] dark:text-white tracking-tight leading-none">+91 999 888 7777</p>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => setIsAboutOpen(false)}
              className="w-full mt-6 py-4 bg-[#2d2d2d] dark:bg-gold text-white rounded-xl font-black tracking-widest uppercase text-xs shadow-lg active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
