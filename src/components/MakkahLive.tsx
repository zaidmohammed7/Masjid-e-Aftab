"use client";

import React, { useState } from "react";
import { Play, Tv } from "lucide-react";
import Image from "next/image";

export default function MakkahLive({ initialVideoId }: { initialVideoId?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Official Saudi Quran TV active live ID: kYqGbBqmp8g (if prop is missing)
  const videoId = initialVideoId || "kYqGbBqmp8g";
  const videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`;

  return (
    <section className="w-full max-w-md mx-auto mb-10 overflow-hidden px-1">
      <div className="flex items-center gap-3 mb-4 px-4">
        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
          <Tv size={20} />
        </div>
        <div>
          <h3 className="text-[10px] font-black text-emerald-500 tracking-[0.3em] uppercase mb-0.5">Live from Makkah</h3>
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight leading-none">Makkah Live Stream</h2>
        </div>
      </div>

      <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-emerald-50 dark:border-gray-800 shadow-xl group">
        {!isPlaying ? (
          <div
            className="absolute inset-0 cursor-pointer flex items-center justify-center"
            onClick={() => setIsPlaying(true)}
          >
            <Image
              src="/kaaba-live.png"
              alt="Makkah Live Stream Placeholder"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 animate-pulse active:scale-95 transition-transform">
                <Play size={32} fill="white" className="ml-1" />
              </div>
            </div>
            {/* Live Indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
              Live
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <iframe
              src={videoSrc}
              title="Makkah Live Stream"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Fallback Direct Link - Visible only when playing to avoid clutter */}
      {isPlaying && (
        <div className="mt-3 px-4 text-center">
          <a 
            href="https://www.youtube.com/@SaudiQuranTv/live" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-500 transition-colors flex items-center justify-center gap-1.5"
          >
            Stream down? Watch on YouTube
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
          </a>
        </div>
      )}
    </section>
  );
}
