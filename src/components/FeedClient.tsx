"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Image as ImageIcon, Video, FileText, Megaphone } from "lucide-react";
import clsx from "clsx";

// Types based on the Sanity Schema
type Announcement = {
  _id: string;
  type: "audio" | "image" | "video" | "text" | "pdf";
  language: "urdu" | "english" | "both";
  timestamp: string;
  contentImage?: string;
  contentAudio?: string;
  contentVideo?: string;
  contentText?: string;
  title?: string;
  contentPdf?: string;
};

export default function FeedClient({ announcements }: { announcements: Announcement[] }) {
  const [activeLang, setActiveLang] = useState<"urdu" | "english" | "all">("urdu");

  const filteredAnnouncements = announcements.filter(
    (a) => activeLang === "all" || a.language === "both" || a.language === activeLang
  );

  return (
    <main className="min-h-screen pb-40 bg-transparent font-sans selection:bg-emerald-200 transition-colors duration-300">

      {/* Premium Gradient Header block - Centered & Sync Height */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white pt-6 pb-8 px-8 rounded-b-[3.5rem] shadow-[0_20px_40px_-15px_rgba(4,120,87,0.5)] relative overflow-hidden text-center mb-6">
        <div className="absolute top-10 left-10 opacity-10 mix-blend-overlay rotate-12">
          <Megaphone size={160} />
        </div>
        <h1 className="text-4xl font-black relative z-10 tracking-tight leading-tight drop-shadow-lg">Announcements</h1>
        <p className="text-emerald-100/90 text-lg font-medium mt-2 relative z-10 tracking-wide drop-shadow-md">Latest news and updates</p>
      </div>

      {/* Floating Header Container */}
      <div className="sticky top-4 z-50 px-4">
        {/* Language Toggle */}
        <div className="flex z-10 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2.5rem] max-w-[360px] mx-auto shadow-2xl border border-white/40 dark:border-gray-800 relative ring-1 ring-black/5">
          <button
            onClick={() => setActiveLang("all")}
            className={clsx(
              "flex-1 flex items-center justify-center py-3.5 rounded-[2rem] transition-all duration-300 relative z-10 text-sm font-black outline-none uppercase tracking-tighter",
              activeLang === "all"
                ? "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-lg scale-105"
                : "text-gray-500 hover:text-gray-800"
            )}
          >
            All
          </button>
          <button
            onClick={() => setActiveLang("english")}
            className={clsx(
              "flex-1 flex items-center justify-center py-3.5 rounded-[2rem] transition-all duration-300 relative z-10 text-sm font-black outline-none uppercase tracking-tighter mx-1",
              activeLang === "english"
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105"
                : "text-gray-500 dark:text-gray-400 hover:text-blue-600"
            )}
          >
            English
          </button>
          <button
            onClick={() => setActiveLang("urdu")}
            className={clsx(
              "flex-1 flex items-center justify-center py-3.5 rounded-[2rem] transition-all duration-300 relative z-10 text-sm font-black outline-none",
              activeLang === "urdu"
                ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105"
                : "text-gray-500 hover:text-emerald-600"
            )}
          >
            <span className="text-xl">اردو</span>
            <span className="ml-1.5 text-[10px] font-bold opacity-80 translate-y-[2px]">(Urdu)</span>
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
    <div className="overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[0_15px_45px_-15px_rgba(0,0,0,0.1)] dark:shadow-none rounded-[2.5rem] p-3 transition-colors duration-300">
      <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-[var(--card-border)] mb-3">
        {item.title ? (
          <h3 className="text-2xl font-black text-[var(--card-text)] tracking-tight leading-tight flex-1">
            {item.title}
          </h3>
        ) : <div className="flex-1"></div>}

        <div className={clsx(
          "ml-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
          item.language === "urdu" ? "bg-green-500 text-white" : item.language === "english" ? "bg-blue-500 text-white" : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        )}>
          {item.language === "both" ? "Urdu/Eng" : item.language}
        </div>
      </div>
      <div className="rounded-[1.8rem] overflow-hidden">
        {item.type === "audio" && <AudioPlayer fileUrl={item.contentAudio} />}
        {item.type === "image" && (
          <div className="bg-gray-50 dark:bg-gray-800 flex items-center justify-center min-h-[200px]">
            <img
              src={item.contentImage}
              alt={item.title || "Announcement"}
              className="w-full h-auto object-contain"
            />
          </div>
        )}
        {item.type === "text" && (
          <div className="p-10 text-center bg-gray-50 dark:bg-gray-800/50">
            <p className="text-2xl font-bold text-[var(--card-text)] leading-relaxed whitespace-pre-wrap">
              {item.contentText}
            </p>
          </div>
        )}
        {item.type === "video" && (
          <div className="bg-black flex items-center justify-center min-h-[200px]">
            <video
              src={item.contentVideo}
              controls
              playsInline
              className="w-full h-auto max-h-[500px]"
              poster={item.contentImage} // Optional: use image as poster if available
            />
          </div>
        )}
        {item.type === "pdf" && (
          <div className="bg-gray-100 dark:bg-gray-800 flex flex-col p-8 items-center justify-center text-center">
            <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-3xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 shadow-sm ring-1 ring-purple-100 dark:ring-purple-900/50">
              <FileText size={48} />
            </div>
            <h4 className="font-black text-gray-800 dark:text-gray-200 text-lg mb-2 line-clamp-1 px-4">{item.title || "Document Flyer"}</h4>
            <p className="text-gray-500 text-sm mb-8 font-bold uppercase tracking-widest">PDF Document</p>

            <a
              href={item.contentPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center py-4 px-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-full rounded-[1.5rem] font-black text-lg transition-all active:scale-95 shadow-[0_10px_20px_-5px_rgba(147,51,234,0.4)]"
            >
              <FileText size={24} className="mr-3" />
              Open Document
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
          {item.type === 'video' && <Video size={24} className="opacity-50" />}
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
