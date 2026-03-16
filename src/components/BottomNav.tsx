"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, Phone, Settings, Megaphone } from "lucide-react";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: <Home size={32} /> },
    { name: "Times", href: "/prayer-times", icon: <Clock size={32} /> },
    { name: "News", href: "/announcements", icon: <Megaphone size={32} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={32} /> },
  ];

  if (pathname.startsWith("/studio")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] 
                      rounded-t-[2.5rem] px-6 py-4 flex justify-between items-center max-w-md mx-auto h-[100px] transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300",
                isActive ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm" : "text-gray-400 hover:text-emerald-500"
              )}
            >
              <div className={clsx("transition-transform duration-300", isActive && "scale-110")}>
                {item.icon}
              </div>
              <span className={clsx("text-[12px] font-black mt-1.5 uppercase tracking-tighter", isActive ? "text-emerald-700" : "text-gray-400")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
