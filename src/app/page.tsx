import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { Clock, Megaphone, MapPin, Phone, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import NextPrayer from "@/components/NextPrayer";

const client = createClient({ projectId, dataset, apiVersion, useCdn: false });

export const revalidate = 0;

export default async function HomePage() {
  const prayerTimes = await client.fetch(`*[_type == "prayerTimes"][0]`);

  return (
    <main className="min-h-screen pb-40 bg-zinc-50 dark:bg-gray-950 font-sans selection:bg-emerald-200 transition-colors duration-500 overflow-x-hidden">
      {/* Dynamic Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-teal-100/40 dark:bg-teal-900/10 rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
      </div>

      {/* Premium Hero Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white pt-8 pb-10 px-8 rounded-b-[3rem] shadow-[0_25px_50px_-12px_rgba(4,120,87,0.3)] relative overflow-hidden text-center z-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border border-white rounded-full blur-2xl opacity-50" />
        </div>
        
        {/* Background Watermark Logo */}
        <div className="absolute -right-6 -bottom-6 opacity-5 mix-blend-overlay rotate-12 pointer-events-none">
           <Image src="/icon.png" alt="" width={200} height={200} priority />
        </div>
        
        {/* Masjid Logo */}
        <div className="relative z-20 mb-4 flex justify-center animate-in zoom-in duration-1000">
           <div className="p-0.5 bg-white/10 backdrop-blur-md rounded-[1.8rem] border border-white/20 shadow-2xl">
              <div className="bg-white rounded-[1.6rem] p-0.5 overflow-hidden shadow-inner">
                 <Image src="/icon.png" alt="Masjid e Aftab Logo" width={60} height={60} className="rounded-[1.4rem]" priority />
              </div>
           </div>
        </div>

        <h1 className="text-3xl font-black relative z-10 tracking-tight leading-tight drop-shadow-lg text-white">
          Masjid e Aftab
        </h1>
        <p className="text-emerald-50/90 text-sm font-medium mt-1.5 relative z-10 tracking-wide drop-shadow-md">
          Heart of the Community
        </p>
      </div>

      <div className="px-6 pt-12 space-y-12 max-w-md mx-auto relative z-20">
        
        {/* Dynamic Prayer Times clock */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
           <NextPrayer prayerTimes={prayerTimes} />
        </div>

        {/* Imaams Corner Section */}
        {prayerTimes?.hadeethText && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200 fill-mode-both">
            <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] p-8 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-none border border-emerald-50 dark:border-gray-800/50 overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-[5rem] transition-transform group-hover:scale-110 duration-700" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                   <Star size={24} className="fill-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight leading-none uppercase text-[10px] tracking-[0.3em] font-black text-emerald-500 mb-1">Imaams Corner</h3>
                  <p className="font-black text-gray-800 dark:text-gray-100 tracking-tight text-lg">{prayerTimes?.hadeethTitle || "Daily Message"}</p>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -top-4 -left-2 text-6xl text-emerald-500/10 font-serif leading-none">&ldquo;</span>
                <p className="text-gray-700 dark:text-gray-300 text-xl font-bold italic leading-relaxed pl-4 pr-2">
                  {prayerTimes.hadeethText}
                </p>
                <span className="absolute -bottom-8 -right-2 text-6xl text-emerald-500/10 font-serif leading-none">&rdquo;</span>
              </div>
            </div>
          </div>
        )}

        {/* News & Announcements Big Button */}
        <Link href="/announcements" className="block relative bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-[3rem] p-10 shadow-[0_20px_45px_-12px_rgba(245,158,11,0.4)] text-white transform active:scale-[0.97] transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 ease-out fill-mode-both">
           <div className="absolute top-0 right-0 opacity-[0.2] -m-10 group-hover:scale-110 transition-transform duration-700">
              <Megaphone size={200} />
           </div>
           
           <h2 className="text-4xl font-black mb-3 relative z-10 tracking-tight drop-shadow-md">News Feed</h2>
           <p className="text-amber-50/90 font-bold text-lg relative z-10 w-4/5 leading-snug drop-shadow-sm mb-8">
             Check the latest announcements and community updates.
           </p>
           
           <div className="bg-white/20 px-10 py-5 rounded-full font-black tracking-[0.15em] text-sm inline-flex items-center gap-3 backdrop-blur-md relative z-10 shadow-inner group-hover:bg-white/30 transition-colors uppercase">
              Open Board
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
           </div>
        </Link>
        
      </div>
    </main>
  );
}
