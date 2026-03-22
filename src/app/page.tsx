import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { Clock, Megaphone, MapPin, Phone, Star, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import NextPrayer from "@/components/NextPrayer";
import QiblaCard from "@/components/QiblaCard";
import InstallBanner from "@/components/InstallBanner";
import MakkahLive from "@/components/MakkahLive";
import { getMakkahLiveId } from "@/lib/makkah";
import ImamCorner from "@/components/ImamCorner";

const client = createClient({ projectId, dataset, apiVersion, useCdn: true });

export const revalidate = 60; // Cache for 60 seconds (ISR)

export default async function Home() {
  const prayerTimes = await client.fetch(`*[_type == "prayerTimes"][0]`);
  const hadithSettings = await client.fetch(`*[_id == "hadith-of-the-day"][0]`);
  const makkahLiveId = await getMakkahLiveId();

  return (
    <main className="min-h-screen pb-40 bg-transparent font-sans selection:bg-gold/30 transition-colors duration-500">
      {/* Dynamic Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/5 dark:bg-gold/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-champagne/10 dark:bg-gold/5 rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
      </div>

      {/* Premium Hero Header - Sticky */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-[#C5A059] via-[#D5B06A] to-[#8E6D2F] text-white pt-8 pb-10 px-8 rounded-b-[3rem] shadow-[0_20px_50px_-12px_rgba(197,160,89,0.4)] relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border border-white rounded-full blur-2xl opacity-50" />
        </div>

        {/* Background Watermark Icon - Simplistic & Seamless */}
        <div className="absolute -right-12 -bottom-16 opacity-[0.08] mix-blend-screen pointer-events-none"
          style={{ maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)' }}>
          <Image src="/watermark.png" alt="" width={350} height={350} priority />
        </div>

        {/* Masjid Logo */}
        <div className="relative z-20 mb-4 flex justify-center animate-in zoom-in duration-1000">
          <div className="p-0.5 bg-white/10 backdrop-blur-md rounded-[1.8rem] border border-white/20 shadow-2xl">
            <div className="bg-white rounded-[1.6rem] p-0.5 overflow-hidden shadow-inner">
              <Image src="/icon-192x192.png" alt="Masjid-e-Aftab Logo" width={60} height={60} className="rounded-[1.4rem]" priority />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-serif font-black relative z-10 tracking-tight leading-tight drop-shadow-2xl text-white uppercase">
          Masjid-e-Aftab
        </h1>
        <div className="h-1 w-12 bg-white/30 mx-auto mt-3 rounded-full relative z-10" />
        <p className="text-white/80 text-[10px] font-black mt-3 relative z-10 tracking-[0.3em] uppercase drop-shadow-md">
          Heart of the Community
        </p>
      </div>

      <div className="px-6 pt-12 space-y-12 max-w-md mx-auto relative z-20">

        {/* Makkah Live Stream Section */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
          <MakkahLive initialVideoId={makkahLiveId} />
        </div>

        {/* Dynamic Prayer Times clock */}
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100 ease-out fill-mode-both">
          <NextPrayer prayerTimes={prayerTimes} />
        </div>

        {/* Qibla Direction Finder Section */}
        <QiblaCard />

        {/* Imaams Corner Section */}
        {hadithSettings?.arabicText && (
          <ImamCorner 
            arabic={hadithSettings.arabicText}
            english={hadithSettings.englishText}
            urdu={hadithSettings.urduText}
            source={hadithSettings.source}
          />
        )}

        {/* News & Announcements Professional Card */}
        <Link href="/announcements" className="block relative bg-white dark:bg-[var(--card-bg)] rounded-[3rem] p-8 shadow-[0_15px_40px_-12px_rgba(197,160,89,0.15)] dark:shadow-none border border-champagne dark:border-[var(--card-border)] transform active:scale-[0.98] transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 ease-out fill-mode-both">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 dark:bg-gold/10 rounded-bl-[5rem] transition-transform group-hover:scale-110 duration-700" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-gold rounded-[1.2rem] text-white shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform duration-500">
              <Megaphone size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] font-black text-gold tracking-[0.3em] uppercase mb-1">Latest Updates</h3>
              <h2 className="text-2xl font-serif font-black text-[#2d2d2d] dark:text-gray-100 tracking-tight leading-none">Posts</h2>

              <div className="mt-3 flex items-center gap-2 text-gold/80 dark:text-gold/60 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-all">
                Open Posts
                <div className="h-0.5 w-6 bg-gold/30 rounded-full" />
              </div>
            </div>
          </div>
        </Link>

        {/* Quran Professional Card */}
        <Link href="/quran" className="block relative bg-white dark:bg-[#1a1c1e] rounded-[3rem] p-8 shadow-[0_15px_40px_-12px_rgba(197,160,89,0.15)] dark:shadow-none border border-champagne dark:border-gray-800/50 transform active:scale-[0.98] transition-all duration-300 overflow-hidden group animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400 ease-out fill-mode-both">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 dark:bg-gold/10 rounded-bl-[5rem] transition-transform group-hover:scale-110 duration-700" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-gold rounded-[1.2rem] text-white shadow-lg shadow-gold/20 dark:shadow-none group-hover:scale-105 transition-transform duration-500">
               <BookOpen size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] font-black text-gold tracking-[0.3em] uppercase mb-1">Holy Book</h3>
              <h2 className="text-2xl font-serif font-black text-[#2d2d2d] dark:text-gray-100 tracking-tight leading-none">Quran Reader</h2>
              
              <div className="mt-3 flex items-center gap-2 text-gold/80 dark:text-gold/60 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-all">
                Read the Holy Quran
                <div className="h-0.5 w-6 bg-gold/30 rounded-full" />
              </div>
            </div>
          </div>
        </Link>

       </div>

      <InstallBanner />
    </main>
  );
}
