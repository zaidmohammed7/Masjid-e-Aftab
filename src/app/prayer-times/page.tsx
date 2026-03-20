import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { Clock } from "lucide-react";

const client = createClient({ projectId, dataset, apiVersion, useCdn: true });

export const revalidate = 60; // Cache for 1 minute (ISR)

import { utcToIst } from "@/lib/time";

export default async function PrayerTimesPage() {
  const prayerTimes = await client.fetch(`*[_type == "prayerTimes"][0]`);

  function formatTime(timeStr: string) {
    if (!timeStr || timeStr === "--:--") return "--:--";
    
    // Check if it's an ISO String (UTC)
    if (timeStr.includes("T") && timeStr.endsWith("Z")) {
      return utcToIst(timeStr);
    }

    if (timeStr.toLowerCase().includes("m")) return timeStr;
    const parts = timeStr.split(":");
    if (parts.length !== 2) return timeStr;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    if (isNaN(h)) return timeStr;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  }

  const times = [
    { name: "Fajr", arabic: "فجر", time: formatTime(prayerTimes?.fajr), text: "text-gold dark:text-gold" },
    { name: "Dhuhr", arabic: "ظہر", time: formatTime(prayerTimes?.dhuhr), text: "text-gold dark:text-gold" },
    { name: "Asr", arabic: "عصر", time: formatTime(prayerTimes?.asr), text: "text-gold dark:text-gold" },
    { name: "Maghrib", arabic: "مغرب", time: formatTime(prayerTimes?.maghrib), text: "text-gold dark:text-gold" },
    { name: "Isha", arabic: "عشاء", time: formatTime(prayerTimes?.isha), text: "text-gold dark:text-gold" },
    { name: "1st Jummah", arabic: "جمعہ 1", time: formatTime(prayerTimes?.jummah1), text: "text-gold dark:text-gold", extra: true },
    { name: "2nd Jummah", arabic: "جمعہ 2", time: formatTime(prayerTimes?.jummah2), text: "text-gold dark:text-gold", extra: true },
    { name: "3rd Jummah", arabic: "جمعہ 3", time: formatTime(prayerTimes?.jummah3), text: "text-gold dark:text-gold", extra: true },
  ];

  return (
    <main className="min-h-screen pb-40 bg-transparent font-sans selection:bg-gold/30 transition-colors duration-300">
      {/* Premium Header - Centered & Sticky */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-[#C5A059] via-[#D5B06A] to-[#8E6D2F] text-white pt-6 pb-8 px-8 rounded-b-[3.5rem] shadow-[0_20px_40px_-15px_rgba(197,160,89,0.4)] relative overflow-hidden text-center mb-6">
        <div className="absolute top-10 right-10 opacity-10 mix-blend-overlay">
          <Clock size={160} />
        </div>
        <div className="absolute bottom-[-10%] -left-10 w-40 h-40 bg-gold/20 rounded-full mix-blend-screen opacity-20 blur-2xl"></div>
        <h1 className="text-4xl font-serif font-black relative z-10 tracking-tight leading-tight drop-shadow-lg uppercase">
          Prayer Times
        </h1>
        <p className="text-white/90 text-lg font-medium mt-2 relative z-10 tracking-wide drop-shadow-md">Daily prayer timings</p>
      </div>

      <div className="px-6 pt-10 flex flex-col gap-5 max-w-md mx-auto relative z-20">
        {times.map((pt, idx) => {
          if (!pt.time) return null; // hide if unset
          return (
            <div key={idx} className={`rounded-[2.5rem] p-6 bg-[var(--card-bg)] shadow-[0_15px_30px_-10px_rgba(197,160,89,0.1)] dark:shadow-none border border-[var(--card-border)] relative overflow-hidden flex flex-col justify-center animate-in fade-in slide-in-from-bottom-5 duration-700 fill-mode-both`} style={{animationDelay: `${idx * 100}ms`}}>
               {pt.extra && (
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold/5 dark:bg-gold/10 rounded-full blur-2xl opacity-50"></div>
               )}
               <div className="flex justify-between items-center relative z-10 w-full gap-4">
                 <div className="flex flex-col min-w-0 pr-2 items-center flex-1">
                    {pt.extra && <span className="bg-gradient-to-r from-gold/10 to-champagne/10 dark:from-gold/20 dark:to-gold/10 text-[#8E6D2F] dark:text-gold px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block w-max mb-2 shadow-sm border border-champagne dark:border-gray-800 text-center">Friday</span>}
                    <h2 className="text-2xl font-serif font-black tracking-tight drop-shadow-sm text-[var(--card-text)] leading-none text-center">{pt.name}</h2>
                    <span className="text-gold/60 dark:text-gold/60 font-medium text-xl mt-2 tracking-tight text-center">{pt.arabic}</span>
                 </div>
                 <p className="text-2xl font-black tabular-nums tracking-tighter text-[var(--card-text)] flex-shrink-0 bg-white dark:bg-[#1a1c1e] px-5 py-3 rounded-2xl border border-champagne dark:border-gray-800 shadow-inner dark:shadow-none">{pt.time}</p>
               </div>
            </div>
          );
        })}

        {!prayerTimes && (
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl flex flex-col items-center mt-6 text-center border border-champagne dark:border-gray-800">
             <div className="bg-gold/5 dark:bg-gray-800 p-6 rounded-full mb-6">
                <Clock size={48} className="text-gold/30 dark:text-gold/20" />
             </div>
             <p className="text-gray-500 font-serif italic text-xl uppercase tracking-widest leading-relaxed">Times not configured</p>
          </div>
        )}
      </div>
    </main>
  );
}
