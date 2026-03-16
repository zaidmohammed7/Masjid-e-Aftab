import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { Clock } from "lucide-react";

const client = createClient({ projectId, dataset, apiVersion, useCdn: false });

export const revalidate = 0; // Opt out of caching so updates reflect instantly

export default async function PrayerTimesPage() {
  const prayerTimes = await client.fetch(`*[_type == "prayerTimes"][0]`);

  function formatTime(timeStr: string) {
    if (!timeStr || timeStr === "--:--") return "--:--";
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
    { name: "Fajr", arabic: "فجر", time: formatTime(prayerTimes?.fajr), text: "text-emerald-800 dark:text-emerald-100" },
    { name: "Dhuhr", arabic: "ظہر", time: formatTime(prayerTimes?.dhuhr), text: "text-emerald-800 dark:text-emerald-100" },
    { name: "Asr", arabic: "عصر", time: formatTime(prayerTimes?.asr), text: "text-emerald-800 dark:text-emerald-100" },
    { name: "Maghrib", arabic: "مغرب", time: formatTime(prayerTimes?.maghrib), text: "text-emerald-800 dark:text-emerald-100" },
    { name: "Isha", arabic: "عشاء", time: formatTime(prayerTimes?.isha), text: "text-emerald-800 dark:text-emerald-100" },
    { name: "1st Jummah", arabic: "جمعہ 1", time: formatTime(prayerTimes?.jummah1), text: "text-emerald-800 dark:text-emerald-100", extra: true },
    { name: "2nd Jummah", arabic: "جمعہ 2", time: formatTime(prayerTimes?.jummah2), text: "text-emerald-800 dark:text-emerald-100", extra: true },
    { name: "3rd Jummah", arabic: "جمعہ 3", time: formatTime(prayerTimes?.jummah3), text: "text-emerald-800 dark:text-emerald-100", extra: true },
  ];

  return (
    <main className="min-h-screen pb-40 bg-gray-50 dark:bg-gray-950 font-sans selection:bg-emerald-200 transition-colors duration-300">
      {/* Premium Header - Centered & Sync Height */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white pt-12 pb-14 px-8 rounded-b-[3.5rem] shadow-[0_20px_40px_-15px_rgba(4,120,87,0.5)] relative overflow-hidden text-center">
        <div className="absolute top-10 right-10 opacity-10 mix-blend-overlay">
          <Clock size={160} />
        </div>
        <div className="absolute bottom-[-10%] -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-screen opacity-20 blur-2xl"></div>
        <h1 className="text-4xl font-black relative z-10 tracking-tight leading-tight drop-shadow-lg">
          Prayer Times
        </h1>
        <p className="text-emerald-50/90 text-lg font-medium mt-2 relative z-10 tracking-wide drop-shadow-md">Daily Prayer Timings</p>
      </div>

      <div className="px-6 pt-10 flex flex-col gap-5 max-w-md mx-auto relative z-20">
        {times.map((pt, idx) => {
          if (!pt.time) return null; // hide if unset
          return (
            <div key={idx} className={`rounded-[2rem] p-6 bg-white dark:bg-gray-900 ${pt.text} shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-emerald-50 dark:border-gray-800 relative overflow-hidden flex flex-col justify-center animate-in fade-in slide-in-from-bottom-5 duration-700 fill-mode-both`} style={{animationDelay: `${idx * 100}ms`}}>
               {pt.extra && (
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full blur-2xl opacity-50"></div>
               )}
               <div className="flex justify-between items-center relative z-10 w-full">
                <div className="flex flex-col">
                   {pt.extra && <span className="bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-800/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block w-max mb-1 shadow-sm border border-emerald-100/50 dark:border-emerald-900/50">Friday</span>}
                   <div className="flex items-baseline gap-3">
                     <h2 className="text-xl font-black tracking-tight drop-shadow-sm">{pt.name}</h2>
                     <span className="text-emerald-600/60 dark:text-emerald-400/60 font-medium text-lg" dir="rtl">{pt.arabic}</span>
                   </div>
                 </div>
                 <p className="text-3xl font-black tabular-nums tracking-tighter">{pt.time}</p>
               </div>
            </div>
          );
        })}

        {!prayerTimes && (
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl flex flex-col items-center mt-6 text-center border border-gray-100 dark:border-gray-800">
             <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-full mb-6">
                <Clock size={48} className="text-gray-300 dark:text-gray-700" />
             </div>
             <p className="text-gray-500 font-bold text-xl uppercase tracking-widest leading-relaxed">Times not configured</p>
          </div>
        )}
      </div>
    </main>
  );
}
