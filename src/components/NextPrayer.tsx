"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { format, addDays } from "date-fns";
import { utcToIst } from "@/lib/time";

const IST_TZ = "Asia/Kolkata";

function getNextOccurrence(timeStr: string) {
  if (!timeStr || timeStr === "--:--") return null;
  
  const nowUtc = new Date();
  const istNow = toZonedTime(nowUtc, IST_TZ);
  
  let hh: number, mm: number;

  if (timeStr.includes("T") && timeStr.endsWith("Z")) {
    const d = new Date(timeStr);
    const z = toZonedTime(d, IST_TZ);
    hh = z.getHours();
    mm = z.getMinutes();
  } else {
    // Legacy format e.g. "05:00 AM"
    const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    hh = parseInt(match[1], 10);
    mm = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hh !== 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;
  }

  // Build target date for TODAY in IST using string composition
  const dateStr = format(istNow, "yyyy-MM-dd");
  const timeStrCalculated = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
  
  let targetUtc = fromZonedTime(`${dateStr} ${timeStrCalculated}`, IST_TZ);

  // If target is in the past, move to TOMORROW
  let isTomorrow = false;
  if (targetUtc.getTime() <= nowUtc.getTime()) {
    const tomorrow = addDays(istNow, 1);
    const tomorrowDateStr = format(tomorrow, "yyyy-MM-dd");
    targetUtc = fromZonedTime(`${tomorrowDateStr} ${timeStrCalculated}`, IST_TZ);
    isTomorrow = true;
  }

  return { utc: targetUtc, isTomorrow, displayTime: timeStr.includes("T") ? utcToIst(timeStr) : timeStr };
}

export default function NextPrayer({ prayerTimes }: { prayerTimes: any }) {
  const [nowUtc, setNowUtc] = useState<Date | null>(null);
  
  useEffect(() => {
    setNowUtc(new Date());
    const t = setInterval(() => setNowUtc(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!nowUtc || !prayerTimes) return (
     <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-800 min-h-[160px] animate-pulse flex flex-col items-center justify-center">
        <Clock className="text-gray-300 dark:text-gray-700 mb-2 rotate-180 transition-transform" />
        <p className="text-gray-400 dark:text-gray-500 font-bold">Syncing Timings...</p>
     </div>
  );

  const isFriday = toZonedTime(nowUtc, IST_TZ).getDay() === 5;
  
  const schedule = (function buildSchedule() {
    const list = [
      { name: "Fajr", time: prayerTimes.fajr },
    ];
    
    if (isFriday) {
      if (prayerTimes.jummah1) list.push({ name: "1st Jummah", time: prayerTimes.jummah1 });
      if (prayerTimes.jummah2) list.push({ name: "2nd Jummah", time: prayerTimes.jummah2 });
      if (prayerTimes.jummah3) list.push({ name: "3rd Jummah", time: prayerTimes.jummah3 });
    } else {
      if (prayerTimes.dhuhr) list.push({ name: "Dhuhr", time: prayerTimes.dhuhr });
    }

    list.push({ name: "Asr", time: prayerTimes.asr });
    list.push({ name: "Maghrib", time: prayerTimes.maghrib });
    list.push({ name: "Isha", time: prayerTimes.isha });
    
    return list;
  })();

  let bestNext = null;
  let minDiff = Infinity;

  for (const p of schedule) {
    const occurrence = getNextOccurrence(p.time);
    if (occurrence) {
      const diffMs = occurrence.utc.getTime() - nowUtc.getTime();
      if (diffMs > 0 && diffMs < minDiff) {
        minDiff = diffMs;
        const h = Math.floor(diffMs / 3600000);
        const m = Math.floor((diffMs % 3600000) / 60000);
        
        bestNext = {
          name: p.name,
          time: occurrence.displayTime,
          timeString: h > 0 ? `${h}h ${m}m` : `${m}m`
        };
      }
    }
  }

  const currentTimeStr = nowUtc.toLocaleTimeString("en-US", { 
    timeZone: IST_TZ, 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  return (
    <div className="bg-[var(--card-bg)] rounded-[3rem] p-8 shadow-[0_20px_40px_-12px_rgba(197,160,89,0.15)] dark:shadow-none border border-[var(--card-border)] flex flex-col pt-8 relative overflow-hidden transition-colors duration-300">
       {/* Background decorative blob */}
       <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 dark:bg-gold/10 rounded-full blur-2xl"></div>

       <div className="flex justify-between items-start z-10 mt-2">
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] mb-1">Current Time</p>
            <h2 className="text-4xl font-serif font-black text-[var(--card-text)] tracking-tight">{currentTimeStr}</h2>
          </div>
          <Link href="/prayer-times" className="text-gold dark:text-gold font-black hover:bg-gold/10 px-4 py-2 bg-gold/5 rounded-[1.2rem] transition-colors text-xs flex items-center gap-1 shadow-sm border border-champagne dark:border-gray-800 uppercase tracking-widest">
             All Times
          </Link>
       </div>
       
       <hr className="my-6 border-champagne/30 dark:border-gray-800 relative z-10" />

       {bestNext ? (
         <div className="flex justify-between items-end z-10">
           <div>
             <p className="text-gold dark:text-gold font-black uppercase tracking-widest text-xs mb-1 flex items-center gap-1">
               <Clock size={14} /> Next: {bestNext.name}
             </p>
             <p className="text-4xl font-serif font-black text-[#8E6D2F] dark:text-gold tracking-tight tabular-nums">{bestNext.time}</p>
           </div>
            <div className="text-right bg-gold/5 dark:bg-[#1a1c1e] text-gold dark:text-gold px-3 py-2 rounded-[1.2rem] border border-champagne/50 dark:border-[var(--card-border)] shadow-sm dark:shadow-none min-w-[80px]">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">Time Left</p>
              <p className="font-black text-xl tabular-nums leading-none">{bestNext.timeString}</p>
            </div>
         </div>
       ) : (
         <div className="text-center py-4 z-10">
            <p className="text-gray-500 font-medium font-serif italic text-lg opacity-60">Revelations are unfolding...</p>
         </div>
       )}
    </div>
  );
}
