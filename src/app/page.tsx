import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { Clock, Megaphone, MapPin, Phone, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import NextPrayer from "@/components/NextPrayer";

const client = createClient({ projectId, dataset, apiVersion, useCdn: false });

export const revalidate = 0; // Disable caching for immediate updates

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

        {/* Background Watermark Icon - Simplistic & Seamless */}
        <div className="absolute -right-12 -bottom-16 opacity-[0.12] mix-blend-screen pointer-events-none"
             style={{ maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)' }}>
          <Image src="/watermark.png" alt="" width={350} height={350} priority />
        </div>

        {/* Masjid Logo */}
        <div className="relative z-20 mb-4 flex justify-center animate-in zoom-in duration-1000">
          <div className="p-0.5 bg-white/10 backdrop-blur-md rounded-[1.8rem] border border-white/20 shadow-2xl">
            <div className="bg-white rounded-[1.6rem] p-0.5 overflow-hidden shadow-inner">
              <Image src="/icon.png" alt="Masjid-e-Aftab Logo" width={60} height={60} className="rounded-[1.4rem]" priority />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-black relative z-10 tracking-tighter leading-tight drop-shadow-2xl text-white uppercase">
          Masjid-e-Aftab
        </h1>
        <div className="h-1 w-12 bg-white/30 mx-auto mt-3 rounded-full relative z-10" />
        <p className="text-emerald-50/80 text-[10px] font-black mt-3 relative z-10 tracking-[0.3em] uppercase drop-shadow-md">
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

              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-emerald-500 rounded-[1.2rem] text-white shadow-lg shadow-emerald-500/20">
                  <Star size={24} className="fill-white" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-emerald-500 tracking-[0.3em] uppercase mb-1">Imaam's Corner</h3>
                  <p className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tighter leading-none">
                    {prayerTimes?.hadeethTitle || "Daily Message"}
                  </p>
                </div>
              </div>

              <div className="relative border-l-4 border-emerald-500/20 pl-6 ml-2">
                <p className="text-xl font-bold text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  "{prayerTimes.hadeethText}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* News & Announcements Professional Card */}
        <Link href="/announcements" className="block relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-1 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800 transform active:scale-[0.98] transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 ease-out fill-mode-both">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-bl-[6rem] transition-transform group-hover:scale-125 duration-700" />
          
          <div className="flex items-center gap-8 p-1 relative z-10">
            <div className="p-7 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
               <Megaphone size={40} />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tighter mb-1">News Feed</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] leading-none mb-5">Digital Notice Board</p>
              
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-all">
                Open Announcements
                <div className="h-0.5 w-6 bg-emerald-500/30 rounded-full" />
              </div>
            </div>
          </div>
        </Link>

      </div>
    </main>
  );
}
