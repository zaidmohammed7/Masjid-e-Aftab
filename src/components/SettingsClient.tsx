"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Lock, Globe, Type, Info, ChevronRight, Share2, Star, ShieldCheck } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";
import clsx from "clsx";

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

export default function SettingsClient() {
  const { theme, toggleTheme } = useTheme();
  const [prayerAlerts, setPrayerAlerts] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      alert("To install: Tap the browser menu (3 dots or share icon) and select 'Add to Home Screen'.");
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
                theme === "dark" ? "bg-emerald-500 justify-end" : "bg-gray-300 justify-start"
              )}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md" />
            </button>
          )
        },
        {
          id: "prayer-alerts",
          label: "Prayer Alerts",
          icon: <ShieldCheck size={24} className="text-purple-500" />,
          action: (
            <button 
              onClick={() => setPrayerAlerts(!prayerAlerts)}
              className={clsx(
                "w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center",
                prayerAlerts ? "bg-emerald-500 justify-end" : "bg-gray-300 justify-start"
              )}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md" />
            </button>
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
          icon: <ShieldCheck size={24} className="text-emerald-500" />,
          action: (
            <button 
              onClick={handleInstall}
              className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50"
            >
              Get App
            </button>
          )
        },
        {
          id: "share",
          label: "Share App",
          icon: <Share2 size={24} className="text-indigo-500" />,
          action: (
            <button 
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText("https://masjid-e-aftab.vercel.app/");
                alert("App link copied to clipboard!");
              }}
              className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50"
            >
              Copy Link
            </button>
          )
        },
        {
          id: "about",
          label: "About Mosque App",
          icon: <Info size={24} className="text-blue-500" />,
          action: <ChevronRight className="text-gray-400" />
        }
      ]
    },
    {
      title: "Access",
      items: [
        {
          id: "admin",
          label: "Administration",
          icon: <Lock size={24} className="text-red-500" />,
          href: "/admin/login",
          action: <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-100 dark:border-red-900/50">Restricted</div>
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-transparent pb-32">
      {/* Premium Header - Vibrantly Emerald Green */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white pt-16 pb-24 px-8 rounded-b-[3.5rem] shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border border-white rounded-full blur-2xl opacity-50" />
        </div>
        <h1 className="text-4xl font-black relative z-10 tracking-tight leading-tight drop-shadow-lg">
          Settings
        </h1>
        <p className="text-emerald-50/90 text-lg font-medium mt-2 relative z-10 tracking-wide">
          Customize your experience
        </p>
      </div>

      <div className="p-6 pt-12 relative z-20 space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="px-5 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em]">{section.title}</h2>
            <div className="bg-[var(--card-bg)] rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-[var(--card-border)] overflow-hidden divide-y divide-[var(--card-border)]">
              {section.items.map((item: SettingItem) => {
                const content = (
                  <div key={item.id} className="flex items-center justify-between p-6 hover:bg-[var(--card-hover)] transition-colors active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl">
                        {item.icon}
                      </div>
                      <span className="font-bold text-[var(--card-text)] text-lg">{item.label}</span>
                    </div>
                    {item.action}
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
        
        {/* Footer Info */}
        <div className="text-center pt-8 pb-4">
          <div className="flex items-center justify-center gap-2 text-emerald-500 mb-2">
            <ShieldCheck size={20} />
            <span className="font-black tracking-widest text-xs uppercase">Secure & Private</span>
          </div>
          <p className="text-gray-400 text-sm font-bold">Masjid App v1.2.0</p>
          <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">Made with ❤️ for the Community</p>
        </div>
      </div>
    </div>
  );
}
