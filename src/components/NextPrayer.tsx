"use client";

import { useState, useEffect } from "react";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

function parseNamaz(timeStr: string, isTomorrow = false) {
  if (!timeStr || timeStr.includes("-")) return null;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (isTomorrow) d.setDate(d.getDate() + 1);
  return d;
}

export default function NextPrayer({ prayerTimes }: { prayerTimes: any }) {
  const [now, setNow] = useState<Date | null>(null);
  
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  if (!now || !prayerTimes) return (
     <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 min-h-[160px] animate-pulse flex flex-col items-center justify-center">
        <Clock className="text-gray-300 mb-2 rotate-180 transition-transform" />
        <p className="text-gray-400 font-bold">Syncing Timings...</p>
     </div>
  );

  const isFriday = now.getDay() === 5;
  
  const schedule = (function buildSchedule() {
    const list = [
      { name: "Fajr", time: prayerTimes.fajr, parsed: parseNamaz(prayerTimes.fajr) },
    ];
    
    if (isFriday) {
      if (prayerTimes.jummah1) list.push({ name: "1st Jummah", time: prayerTimes.jummah1, parsed: parseNamaz(prayerTimes.jummah1) });
      if (prayerTimes.jummah2) list.push({ name: "2nd Jummah", time: prayerTimes.jummah2, parsed: parseNamaz(prayerTimes.jummah2) });
      if (prayerTimes.jummah3) list.push({ name: "3rd Jummah", time: prayerTimes.jummah3, parsed: parseNamaz(prayerTimes.jummah3) });
    } else {
      if (prayerTimes.dhuhr) list.push({ name: "Dhuhr", time: prayerTimes.dhuhr, parsed: parseNamaz(prayerTimes.dhuhr) });
    }

    list.push({ name: "Asr", time: prayerTimes.asr, parsed: parseNamaz(prayerTimes.asr) });
    list.push({ name: "Maghrib", time: prayerTimes.maghrib, parsed: parseNamaz(prayerTimes.maghrib) });
    list.push({ name: "Isha", time: prayerTimes.isha, parsed: parseNamaz(prayerTimes.isha) });
    
    return list.filter(p => p.parsed !== null);
  })();

  let next = schedule.find(p => p.parsed!.getTime() > now.getTime());
  
  // If all are past, next is Fajr tomorrow
  if (!next && schedule.length > 0) {
    const fajr = schedule[0];
    next = { ...fajr, parsed: parseNamaz(fajr.time, true) };
  }

  let timeString = "--";
  if (next && next.parsed) {
    const diffMs = next.parsed!.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHrs > 0) {
      timeString = `${diffHrs}h ${diffMins}m`;
    } else {
      timeString = `${diffMins}m`;
    }
  }

  const currentTimeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 flex flex-col pt-6 relative overflow-hidden">
       {/* Background decorative blob */}
       <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl"></div>

       <div className="flex justify-between items-start z-10 mt-2">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">Current Time</p>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">{currentTimeStr}</h2>
          </div>
          <Link href="/prayer-times" className="text-emerald-700 font-extrabold hover:bg-emerald-100 px-4 py-2 bg-emerald-50 rounded-[1rem] transition-colors text-sm flex items-center gap-1 shadow-sm border border-emerald-100">
             All Times
          </Link>
       </div>
       
       <hr className="my-5 border-gray-100 relative z-10" />

       {next ? (
         <div className="flex justify-between items-end z-10">
           <div>
             <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-1 flex items-center gap-1">
               <Clock size={14} /> Next: {next.name}
             </p>
             <p className="text-4xl font-extrabold text-emerald-800 tracking-tight tabular-nums">{next.time}</p>
           </div>
           <div className="text-right bg-orange-50 text-orange-700 px-4 py-2 rounded-[1rem] border border-orange-100">
             <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Time Left</p>
             <p className="font-extrabold text-xl line-clamp-1">{timeString}</p>
           </div>
         </div>
       ) : (
         <div className="text-center py-4 z-10">
            <p className="text-gray-500 font-medium">Prayer times not configured.</p>
         </div>
       )}
    </div>
  );
}
