import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { Clock, Megaphone, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import NextPrayer from "@/components/NextPrayer";

const client = createClient({ projectId, dataset, apiVersion, useCdn: false });

export const revalidate = 0;

export default async function HomePage() {
  const prayerTimes = await client.fetch(`*[_type == "prayerTimes"][0]`);

  return (
    <main className="min-h-screen pb-40 bg-transparent font-sans selection:bg-emerald-200 transition-colors duration-300">
      {/* Premium Hero Header - Centered & Slightly Taller */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white pt-16 pb-20 px-8 rounded-b-[3.5rem] shadow-[0_20px_40px_-15px_rgba(4,120,87,0.5)] relative overflow-hidden text-center">
        {/* Abstract Background Elements */}
        <div className="absolute -top-16 -right-16 opacity-20 rotate-12 mix-blend-overlay">
          <div className="w-80 h-80 rounded-[4rem] border-[30px] border-white blur-sm"></div>
        </div>
        <div className="absolute bottom-[-10%] -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-screen opacity-20 blur-2xl"></div>
        
        <h1 className="text-5xl font-black relative z-10 tracking-tight leading-tight drop-shadow-lg">
          Masjid e Aftab
        </h1>
        <p className="text-emerald-50/90 text-[1.15rem] font-medium mt-3 relative z-10 tracking-wide drop-shadow-md">
          Welcome to your community hub
        </p>
      </div>

      <div className="px-6 pt-10 space-y-8 max-w-md mx-auto relative z-20">
        
        {/* Dynamic Prayer Times clock */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
           <NextPrayer prayerTimes={prayerTimes} />
        </div>

        {/* Announcements Big Button */}
        <Link href="/announcements" className="block relative bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-[2.5rem] p-8 shadow-[0_15px_35px_-10px_rgba(245,158,11,0.5)] text-white transform active:scale-[0.97] transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom-10 duration-700 delay-150 ease-out fill-mode-both">
           <div className="absolute top-0 right-0 opacity-[0.15] -m-6 group-hover:scale-110 transition-transform duration-500">
              <Megaphone size={160} />
           </div>
           
           <h2 className="text-4xl font-black mb-2 relative z-10 tracking-tight drop-shadow-md">Announcements</h2>
           <p className="text-amber-50/90 font-bold text-lg relative z-10 w-3/4 leading-snug drop-shadow-sm mb-6">
             Tap to check the latest news, events, and updates.
           </p>
           
           <div className="bg-white/20 px-8 py-4 rounded-full font-black tracking-wider text-sm inline-flex items-center gap-2 backdrop-blur-md relative z-10 shadow-inner group-hover:bg-white/30 transition-colors uppercase">
              Open Feed
              <div className="w-2 h-2 rounded-full bg-white animate-ping ml-2"></div>
           </div>
        </Link>
        
      </div>
    </main>
  );
}
