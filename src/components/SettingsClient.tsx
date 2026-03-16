"use client";

import React, { useState } from "react";
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
  const [language, setLanguage] = useState("english");
  const [fontSize, setFontSize] = useState("medium");

  const sections: SettingSection[] = [
    {
      title: "Appearance",
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
          id: "font-size",
          label: "Font Size",
          icon: <Type size={24} className="text-purple-500" />,
          action: (
            <select 
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg font-bold text-sm outline-none border-none dark:text-white"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          )
        }
      ]
    },
    {
      title: "General",
      items: [
        {
          id: "language",
          label: "App Language",
          icon: <Globe size={24} className="text-blue-500" />,
          action: (
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
               <button 
                 onClick={() => setLanguage("english")}
                 className={clsx(
                   "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                   language === "english" ? "bg-white dark:bg-gray-700 shadow-sm text-emerald-600" : "text-gray-500"
                 )}
               >EN</button>
               <button 
                 onClick={() => setLanguage("urdu")}
                 className={clsx(
                   "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                   language === "urdu" ? "bg-white dark:bg-gray-700 shadow-sm text-emerald-600" : "text-gray-500"
                 )}
               >اردو</button>
            </div>
          )
        }
      ]
    },
    {
      title: "Support & About",
      items: [
        {
          id: "share",
          label: "Share App",
          icon: <Share2 size={24} className="text-indigo-500" />,
          action: <ChevronRight className="text-gray-400" />
        },
        {
          id: "rate",
          label: "Rate on Store",
          icon: <Star size={24} className="text-yellow-500" />,
          action: <ChevronRight className="text-gray-400" />
        },
        {
          id: "about",
          label: "About Mosque App",
          icon: <Info size={24} className="text-emerald-500" />,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-950 text-white pt-16 pb-20 px-8 rounded-b-[3.5rem] shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border border-white rounded-full blur-2xl opacity-50" />
        </div>
        <h1 className="text-4xl font-black relative z-10 tracking-tight leading-tight drop-shadow-lg">
          Settings
        </h1>
        <p className="text-gray-400 text-lg font-medium mt-2 relative z-10 tracking-wide">
          Customize your experience
        </p>
      </div>

      <div className="p-6 -mt-10 relative z-20 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="px-2 text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{section.title}</h2>
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {section.items.map((item: SettingItem) => {
                const content = (
                  <div key={item.id} className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl">
                        {item.icon}
                      </div>
                      <span className="font-bold text-gray-800 dark:text-gray-100 text-lg">{item.label}</span>
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
