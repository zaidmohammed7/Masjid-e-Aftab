"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Image as ImageIcon, Video, FileText, Megaphone } from "lucide-react";
import clsx from "clsx";

// Types based on the Sanity Schema
type Announcement = {
  _id: string;
  type: "audio" | "image" | "video" | "text" | "pdf";
  language: "urdu" | "english";
  timestamp: string;
  contentImage?: string;
  contentAudio?: string;
  contentVideo?: string;
  contentText?: string;
  title?: string;
  contentPdf?: string;
};

export default function FeedClient({ announcements }: { announcements: Announcement[] }) {
  const [activeLang, setActiveLang] = useState<"urdu" | "english">("urdu");

  const filteredAnnouncements = announcements.filter(
    (a) => a.language === activeLang
  );

  return (
    <main className="min-h-screen pb-40 bg-gray-50 dark:bg-gray-950 font-sans selection:bg-emerald-200">
      
      {/* Premium Gradient Header block - Centered & Sync Height */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 pt-12 pb-14 px-8 rounded-b-[3.5rem] shadow-[0_20px_40px_-15px_rgba(4,120,87,0.5)] relative overflow-hidden text-center mb-6">
        <div className="absolute top-10 left-10 opacity-10 mix-blend-overlay rotate-12">
          <Megaphone size={160} />
        </div>
        <h1 className="text-4xl font-black text-white relative z-10 tracking-tight drop-shadow-lg">Announcements</h1>
        <p className="text-emerald-100/90 font-medium mt-2 relative z-10 tracking-wide drop-shadow-md">Latest news and updates</p>
      </div>

      {/* Floating Header Container */}
      <div className="sticky top-4 z-50 px-4">
        {/* Language Toggle */}
        <div className="flex z-10 p-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2rem] max-w-[320px] mx-auto shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] border border-white/50 dark:border-gray-800 relative">
          <button
            onClick={() => setActiveLang("urdu")}
            className={clsx(
              "flex-1 flex items-center justify-center py-3.5 rounded-[1.75rem] transition-all duration-300 relative z-10 text-lg font-bold outline-none",
              activeLang === "urdu"
                ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md transform scale-[1.02]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            اردو (Urdu)
          </button>
          <button
            onClick={() => setActiveLang("english")}
            className={clsx(
              "flex-1 flex items-center justify-center py-3.5 rounded-[1.75rem] transition-all duration-300 relative z-10 text-lg font-bold outline-none",
              activeLang === "english"
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md transform scale-[1.02]"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            English
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-8 max-w-md mx-auto">
        {filteredAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
            <Megaphone size={80} className="opacity-20 mb-4" />
            <p className="text-2xl font-bold">No announcements</p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement._id} item={announcement} />
          ))
        )}
      </div>
    </main>
  );
}

function AnnouncementCard({ item }: { item: Announcement }) {
  return (
    <div className="overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-800 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-3 transition-colors duration-300">
      {item.title && (
        <div className="px-5 pt-4 pb-3 border-b border-gray-100/50 dark:border-gray-800 mb-3">
           <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
             {item.title}
           </h3>
        </div>
      )}
      <div className="rounded-[1.8rem] overflow-hidden">
        {item.type === "audio" && <AudioPlayer fileUrl={item.contentAudio} />}
        {item.type === "image" && (
          <div className="bg-gray-100 flex items-center justify-center min-h-[200px]">
            <img
              src={item.contentImage}
              alt={item.title || "Announcement"}
              className="w-full h-auto object-contain"
            />
          </div>
        )}
        {item.type === "text" && (
          <div className="p-10 text-center bg-gray-50/80 dark:bg-gray-800/80">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {item.contentText}
            </p>
          </div>
        )}
        {item.type === "pdf" && (
          <div className="bg-gray-100 flex flex-col">
            <iframe 
              src={`${item.contentPdf}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-96 border-0"
              title={item.title || "PDF Preview"}
            />
            <a 
              href={item.contentPdf} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center p-5 bg-purple-600 text-white w-full font-black text-lg transition-all active:bg-purple-700 shadow-inner"
            >
              <FileText size={28} className="mr-3" />
              Open Full PDF
            </a>
          </div>
        )}
      </div>
      
      {/* Meta Footer */}
      <div className="px-5 pt-4 pb-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-gray-400 dark:text-gray-500">
        <span className="text-[12px] font-black flex flex-col uppercase tracking-widest">
          <span>{new Date(item.timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}</span>
          <span className="opacity-60 mt-0.5">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </span>
        <div className="flex items-center gap-2">
           {item.type === 'audio' && <Megaphone size={24} className="opacity-50" />}
           {item.type === 'image' && <ImageIcon size={24} className="opacity-50" />}
           {item.type === 'text' && <FileText size={24} className="opacity-50" />}
           {item.type === 'pdf' && <FileText size={24} className="opacity-50" />}
        </div>
      </div>
    </div>
  );
}

function AudioPlayer({ fileUrl }: { fileUrl?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && fileUrl) {
      audioRef.current = new Audio(fileUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [fileUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-100 to-green-50 dark:from-emerald-950/40 dark:to-green-900/20 rounded-[1.5rem] relative overflow-hidden">
      {/* Background Pulse Animation */}
      {isPlaying && (
        <>
          <div className="absolute left-6 w-24 h-24 bg-emerald-400 rounded-full opacity-20 animate-ping" style={{ animationDuration: '1.5s' }} />
        </>
      )}
      
      {/* Play Button */}
      <button
        onClick={togglePlay}
        className={clsx(
          "relative z-10 flex items-center justify-center w-20 h-20 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all active:scale-90 duration-200",
          isPlaying ? "bg-red-500" : "bg-emerald-500"
        )}
      >
        {isPlaying ? (
          <Pause size={40} className="text-white fill-current" />
        ) : (
          <Play size={40} className="text-white ml-2 fill-current" />
        )}
      </button>
      
      <p className="text-xl font-bold text-emerald-800 dark:text-emerald-400 z-10 text-right w-full pr-4">
        {isPlaying ? "Playing..." : "Listen Notes"}
      </p>
    </div>
  );
}
