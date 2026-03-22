"use client";

import React from "react";
import { Star } from "lucide-react";
import { Amiri } from "next/font/google";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

interface HadithProps {
  arabic: string;
  english: string;
  urdu: string;
  source: string;
}

export default function ImamCorner({ arabic, english, urdu, source }: HadithProps) {
  return (
    <div className={`${amiri.variable} animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200 fill-mode-both`}>
      <div className="relative bg-white dark:bg-[var(--card-bg)] rounded-[3rem] p-8 shadow-[0_15px_40px_-12px_rgba(197,160,89,0.15)] dark:shadow-none border border-champagne dark:border-[var(--card-border)] overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 dark:bg-gold/10 rounded-bl-[5rem] transition-transform group-hover:scale-110 duration-700" />

        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gold rounded-[1.2rem] text-white shadow-lg shadow-gold/20">
            <Star size={24} className="fill-white" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-gold tracking-[0.3em] uppercase mb-1">Imaam's Corner</h3>
            <p className="text-2xl font-serif font-black text-[#2d2d2d] dark:text-gray-100 tracking-tight leading-none">
              Daily Hadith
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Arabic Text (Centered) */}
          <div className="text-center">
            <p className="text-3xl font-amiri text-[#2d2d2d] dark:text-[#FCFAF2] leading-relaxed dir-rtl whitespace-pre-wrap">
              {arabic}
            </p>
          </div>

          {/* Translations (Stacked) */}
          <div className="space-y-6">
            <div className="bg-[#fbf9f1] dark:bg-gray-800/40 p-6 rounded-3xl border border-champagne/10">
              <p className="text-[9px] font-black text-gold uppercase tracking-widest mb-3 opacity-60">English</p>
              <p className="text-sm font-medium text-[#2d2d2d] dark:text-gray-300 leading-relaxed italic">
                {english}
              </p>
            </div>
            {urdu && (
              <div className="bg-[#fbf9f1] dark:bg-gray-800/40 p-6 rounded-3xl border border-champagne/10">
                <p className="text-[9px] font-black text-gold uppercase tracking-widest mb-3 opacity-60">Urdu</p>
                <p className="text-xl font-amiri text-[#2d2d2d] dark:text-[#FCFAF2] leading-relaxed text-right dir-rtl">
                  {urdu}
                </p>
              </div>
            )}
          </div>

          {/* Source Flag */}
          {source && (
            <div className="flex justify-end pt-2">
              <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-gold/10">
                {source}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .dir-rtl {
          direction: rtl;
        }
        .font-amiri {
          font-family: var(--font-amiri), serif;
        }
      `}</style>
    </div>
  );
}
