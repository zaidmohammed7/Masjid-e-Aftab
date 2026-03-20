"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, BookOpen, Search, X, Loader2, Book } from "lucide-react";
import clsx from "clsx";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

interface SurahData {
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  };
  ayahs: Ayah[];
}

interface QuranClientProps {
  initialSurahs: Surah[];
}

export default function QuranClient({ initialSurahs }: QuranClientProps) {
  const [selectedSurahNum, setSelectedSurahNum] = useState<number | null>(null);
  const [surahContent, setSurahContent] = useState<{ [key: number]: SurahData[] }>({});
  const [loading, setLoading] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSurahs = useMemo(() => {
    return initialSurahs.filter(s =>
      s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.number.toString().includes(searchTerm) ||
      s.name.includes(searchTerm)
    );
  }, [initialSurahs, searchTerm]);

  useEffect(() => {
    if (selectedSurahNum && !surahContent[selectedSurahNum]) {
      fetchSurah(selectedSurahNum);
    }
  }, [selectedSurahNum]);

  const fetchSurah = async (num: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${num}/editions/quran-uthmani,en.sahih,ur.jalandhry`);
      const data = await res.json();
      if (data.code === 200) {
        setSurahContent(prev => ({ ...prev, [num]: data.data }));
      }
    } catch (error) {
      console.error("Failed to fetch surah content:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSurahInfo = initialSurahs.find(s => s.number === selectedSurahNum);
  const currentContent = selectedSurahNum ? surahContent[selectedSurahNum] : null;

  return (
    <div className="pb-32">
      {/* Premium Header - Emerald Theme - Sticky */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white pt-6 pb-8 px-8 rounded-b-[3.5rem] shadow-2xl relative text-center">
        <div className="absolute top-10 left-10 opacity-10 mix-blend-overlay rotate-12">
          <Book size={160} />
        </div>
        <div className="absolute top-10 right-10 opacity-10 mix-blend-overlay -rotate-12">
          <BookOpen size={120} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl font-black relative z-10 tracking-tight leading-tight drop-shadow-lg">
            Holy Quran
          </h1>
          <p className="text-emerald-100/90 text-lg font-medium mt-2 relative z-10 tracking-wide drop-shadow-md">
            Guidance for Mankind
          </p>
        </div>
      </div>

      {/* Floating Selector Trigger - Sticky below the main header */}
      <div className="sticky top-36 z-50 px-4 mt-3">
        <div className="max-w-sm mx-auto">
          <button
            onClick={() => setIsSelectorOpen(true)}
            className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-xl border border-emerald-100 dark:border-gray-800 flex items-center justify-between group active:scale-95 transition-all outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Search size={20} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Select Surah</p>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-base flex gap-2 items-baseline">
                  {selectedSurahInfo ? (
                    <>
                      <span className="text-emerald-600">#{selectedSurahInfo.number}</span>
                      {selectedSurahInfo.englishName}
                    </>
                  ) : "Choose a Surah..."}
                </p>
              </div>
            </div>
            <ChevronDown size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-12 space-y-8 max-w-lg mx-auto">
        {!selectedSurahNum ? (
          <div className="py-20 flex flex-col items-center text-center space-y-4 opacity-40">
            <BookOpen size={64} className="text-emerald-500" />
            <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Choose a Surah to begin reading</p>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 size={40} className="text-emerald-500 animate-spin" />
            <p className="font-black text-emerald-500 text-[10px] uppercase tracking-widest">Loading Revelations...</p>
          </div>
        ) : currentContent ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Surah Header Details */}
            <div className="text-center space-y-2 pb-8 border-b border-emerald-100 dark:border-gray-800">
              <h2 className="text-4xl font-amiri text-emerald-600 font-bold">{selectedSurahInfo?.name}</h2>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                {selectedSurahInfo?.revelationType} • {selectedSurahInfo?.numberOfAyahs} Ayahs
              </p>
              {selectedSurahNum !== 1 && selectedSurahNum !== 9 && (
                <p className="text-2xl font-amiri text-gray-700 dark:text-gray-300 mt-6 overflow-hidden">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              )}
            </div>

            {/* Ayah List */}
            <div className="space-y-12">
              {currentContent[0].ayahs.map((ayah, idx) => (
                <div key={ayah.number} className="group relative">
                  {/* Ayah Number Badge */}
                  <div className="absolute -left-2 top-0 -translate-x-full pr-4 text-[10px] font-black text-emerald-300 group-hover:text-emerald-500 transition-colors hidden sm:block">
                    {ayah.numberInSurah}
                  </div>

                  <div className="space-y-6">
                    {/* Arabic */}
                    <p className="text-3xl font-amiri text-gray-800 dark:text-gray-100 leading-[2] text-right dir-rtl">
                      {ayah.text}
                    </p>

                    {/* Translations */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-emerald-50 dark:border-gray-800 shadow-sm">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 opacity-60">English</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                          {currentContent[1].ayahs[idx].text}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-emerald-50 dark:border-gray-800 shadow-sm">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 opacity-60">Urdu</p>
                        <p className="text-lg font-amiri text-gray-700 dark:text-gray-300 leading-relaxed text-right dir-rtl">
                          {currentContent[2].ayahs[idx].text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Surah Selector Modal */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-950 w-full max-w-sm rounded-[2.5rem] flex flex-col shadow-2xl relative animate-in zoom-in-95 border border-emerald-100 dark:border-gray-800 overflow-hidden max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight">Select Surah</h3>
                <button
                  onClick={() => setIsSelectorOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full active:scale-90 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-1 custom-scrollbar">
              {filteredSurahs.map(s => (
                <button
                  key={s.number}
                  onClick={() => {
                    setSelectedSurahNum(s.number);
                    setIsSelectorOpen(false);
                    setSearchTerm("");
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={clsx(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98]",
                    selectedSurahNum === s.number
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={clsx("text-xs font-black w-6", selectedSurahNum === s.number ? "text-white/60" : "text-emerald-500/40")}>
                      {s.number}
                    </span>
                    <div className="text-left">
                      <p className="font-black tracking-tight leading-none mb-0.5">{s.englishName}</p>
                      <p className={clsx("text-[10px] font-medium uppercase tracking-widest", selectedSurahNum === s.number ? "text-white/70" : "text-gray-400")}>
                        {s.englishNameTranslation}
                      </p>
                    </div>
                  </div>
                  <span className={clsx("font-amiri text-lg", selectedSurahNum === s.number ? "text-white" : "text-emerald-600")}>
                    {s.name}
                  </span>
                </button>
              ))}
              {filteredSurahs.length === 0 && (
                <div className="py-10 text-center text-gray-400 font-bold text-sm uppercase tracking-widest">
                  No Surahs Found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .font-amiri {
          font-family: var(--font-amiri), serif;
        }
        .dir-rtl {
          direction: rtl;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
