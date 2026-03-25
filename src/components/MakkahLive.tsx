"use client";

import React, { useState } from "react";
import { Play, Tv } from "lucide-react";
import Image from "next/image";

/**
 * Self-healing Makkah Live Stream.
 * Uses YouTube's permanent channel live-embed URL so the stream
 * automatically resolves to whatever video the channel is currently
 * broadcasting — no scraper, no stale video IDs, no redeployments.
 */
const CHANNEL_EMBED_URL =
  "https://www.youtube.com/embed/live_stream?channel=UCos52azQNBgW63_9uDJoPDA";

export default function MakkahLive() {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoSrc = `${CHANNEL_EMBED_URL}&autoplay=1&mute=0&rel=0`;

  return (
    <section className="w-full max-w-md mx-auto mb-10 overflow-hidden px-1">
      <div className="flex items-center gap-3 mb-4 px-4">
        <div className="p-2 bg-gold/10 rounded-lg text-gold">
          <Tv size={20} />
        </div>
        <div>
          <h3 className="text-[10px] font-black text-gold tracking-[0.3em] uppercase mb-0.5">Live from Makkah</h3>
          <h2 className="text-xl font-serif font-black text-gray-800 dark:text-gray-100 tracking-tight leading-none">Makkah Live Stream</h2>
        </div>
      </div>

      <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-white dark:bg-[var(--card-bg)] border border-champagne dark:border-[var(--card-border)] shadow-xl shadow-gold/10 dark:shadow-none group">
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
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-white shadow-2xl shadow-gold/40 animate-pulse active:scale-95 transition-transform">
                <Play size={32} fill="white" className="ml-1" />
              </div>
            </div>
            {/* Live Indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-700 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg border border-champagne/30">
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
            className="text-[10px] font-black text-gold uppercase tracking-widest hover:text-gold/80 transition-colors flex items-center justify-center gap-1.5"
          >
            Stream down? Watch on YouTube
            <div className="w-1 h-1 bg-gold rounded-full animate-pulse" />
          </a>
        </div>
      )}
    </section>
  );
}
