"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, Phone, Settings, Megaphone, BookOpen } from "lucide-react";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: <Home size={32} /> },
    { name: "Posts", href: "/announcements", icon: <Megaphone size={32} /> },
    { name: "Quran", href: "/quran", icon: <BookOpen size={32} /> },
    { name: "Times", href: "/prayer-times", icon: <Clock size={32} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={32} /> },
  ];

  if (pathname.startsWith("/studio")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-[#fbf9f1]/95 dark:bg-gray-950/90 backdrop-blur-2xl border-t border-champagne dark:border-gray-800 shadow-[0_-10px_40px_-15px_rgba(197,160,89,0.15)] 
                      rounded-t-[2.5rem] px-6 py-4 flex justify-between items-center max-w-md mx-auto h-[100px] transition-colors duration-300">
        {navItems.map((item) => {
          const currentPath = pathname || "/";
          const isActive = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300",
                isActive ? "text-gold bg-gold/10 dark:bg-gold/10 shadow-sm" : "text-gray-400 hover:text-gold"
              )}
            >
              <div className={clsx("transition-transform duration-300", isActive && "scale-110")}>
                {item.icon}
              </div>
              <span className={clsx("text-[12px] font-black mt-1.5 uppercase tracking-tighter font-serif", isActive ? "text-[#8E6D2F]" : "text-gray-400")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
