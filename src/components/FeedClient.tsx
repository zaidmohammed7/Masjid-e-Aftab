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
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Handle Android/Browser back button to close expanded image
  useEffect(() => {
    if (expandedImage) {
      window.history.pushState({ imageExpanded: true }, "");
      
      const handlePopState = (e: PopStateEvent) => {
        setExpandedImage(null);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [expandedImage]);

  const closeExpandedImage = () => {
    if (expandedImage) {
      // Go back in history to clean up the dummy state
      window.history.back();
      setExpandedImage(null);
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a) => activeLang === "all" || a.language === "both" || a.language === activeLang
  );

  return (
    <main className="min-h-screen pb-40 bg-transparent font-sans selection:bg-emerald-200 transition-colors duration-300">

      {/* Premium Gradient Header block - Centered & Sticky */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-[#C5A059] via-[#D5B06A] to-[#8E6D2F] text-white pt-6 pb-8 px-8 rounded-b-[3.5rem] shadow-[0_20px_40px_-15px_rgba(197,160,89,0.4)] relative overflow-hidden text-center">
        <div className="absolute top-10 left-10 opacity-10 mix-blend-overlay rotate-12">
          <Megaphone size={160} />
        </div>
        <h1 className="text-4xl font-serif font-black relative z-10 tracking-tight leading-tight drop-shadow-lg uppercase">Announcements</h1>
        <p className="text-white/90 text-lg font-medium mt-2 relative z-10 tracking-wide drop-shadow-md">Latest news and updates</p>
      </div>

      {/* Floating Header Container - Sticky below the main header */}
      <div className="sticky top-36 z-50 px-4 mt-3">
        {/* Language Toggle */}
        <div className="flex z-10 p-1.5 bg-white/95 dark:bg-gray-950/90 backdrop-blur-2xl rounded-[2.5rem] max-w-[360px] mx-auto shadow-2xl border border-champagne dark:border-gray-800 relative ring-1 ring-black/5">
          <button
            onClick={() => setActiveLang("all")}
            className={clsx(
              "flex-1 flex items-center justify-center py-3.5 rounded-[2rem] transition-all duration-300 relative z-10 text-sm font-black outline-none uppercase tracking-tighter",
              activeLang === "all"
                ? "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-lg scale-105"
                : "text-gray-500 hover:text-gold"
            )}
          >
            All
          </button>
          <button
            onClick={() => setActiveLang("english")}
            className={clsx(
              "flex-1 flex items-center justify-center py-3.5 rounded-[2rem] transition-all duration-300 relative z-10 text-sm font-black outline-none uppercase tracking-tighter mx-1",
              activeLang === "english"
                ? "bg-gradient-to-br from-[#8E6D2F] to-[#C5A059] text-white shadow-lg scale-105"
                : "text-gray-500 dark:text-gray-400 hover:text-gold"
            )}
          >
            English
          </button>
          <button
            onClick={() => setActiveLang("urdu")}
            className={clsx(
              "flex-1 flex items-center justify-center py-3.5 rounded-[2rem] transition-all duration-300 relative z-10 text-sm font-black outline-none",
              activeLang === "urdu"
                ? "bg-gradient-to-br from-gold to-[#8E6D2F] text-white shadow-lg scale-105"
                : "text-gray-500 hover:text-gold"
            )}
          >
            <span className="text-xl">اردو</span>
            <span className="ml-1.5 text-[10px] font-bold opacity-80 translate-y-[2px]">(Urdu)</span>
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-3 max-w-md mx-auto">
        {filteredAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
            <Megaphone size={80} className="opacity-20 mb-4" />
            <p className="text-2xl font-bold">No announcements</p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <AnnouncementCard 
              key={announcement._id} 
              item={announcement} 
              onImageClick={(url) => setExpandedImage(url)}
            />
          ))
        )}
      </div>

      {/* Fullscreen Image Overlay */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={closeExpandedImage}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <img 
              src={expandedImage} 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" 
              alt="Expanded view"
            />
            <button className="absolute top-4 right-4 text-white/50 hover:text-white p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function AnnouncementCard({ item, onImageClick }: { item: Announcement, onImageClick: (url: string) => void }) {
  return (
    <div className="overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[0_10px_30px_-10px_rgba(197,160,89,0.15)] dark:shadow-none rounded-[2rem] p-2 transition-colors duration-300">
      <div className="flex justify-between items-center px-4 pt-1.5 pb-1 border-b border-champagne/30 dark:border-[var(--card-border)] mb-1.5">
        {item.title ? (
          <h3 className="text-base font-serif font-black text-[var(--card-text)] tracking-tight leading-tight flex-1 line-clamp-1">
            {item.title}
          </h3>
        ) : <div className="flex-1"></div>}

        <div className={clsx(
          "ml-2 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest shadow-sm",
          item.language === "urdu" ? "bg-gold text-white" : item.language === "english" ? "bg-[#8E6D2F] text-white" : "bg-champagne dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        )}>
          {item.language === "both" ? "Urdu/Eng" : item.language}
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden">
        {item.type === "audio" && <AudioPlayer fileUrl={item.contentAudio} />}
        {item.type === "image" && (
          <div 
            className="bg-white dark:bg-gray-800 flex items-center justify-center h-48 cursor-pointer group relative"
            onClick={() => item.contentImage && onImageClick(item.contentImage)}
          >
            <img
              src={item.contentImage}
              alt={item.title || "Announcement"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ImageIcon size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}
        {item.type === "text" && (
          <div className="p-3 bg-white/50 dark:bg-gray-800/50">
            <p className="text-base font-bold text-[var(--card-text)] leading-relaxed whitespace-pre-wrap text-left">
              {item.contentText}
            </p>
          </div>
        )}
        {item.type === "video" && (
          <div className="bg-black flex items-center justify-center max-h-56">
            <video
              src={item.contentVideo}
              controls
              playsInline
              className="w-full h-auto max-h-56"
              poster={item.contentImage}
            />
          </div>
        )}
        {item.type === "pdf" && (
          <div className="bg-champagne/10 dark:bg-gray-800 flex flex-col p-4 items-center justify-center text-center">
            <div className="w-16 h-16 bg-gold/10 dark:bg-gold/900/30 rounded-2xl flex items-center justify-center text-gold dark:text-gold mb-3 shadow-sm ring-1 ring-gold/20 dark:ring-gold/50">
              <FileText size={32} />
            </div>
            <h4 className="font-serif font-black text-[#2d2d2d] dark:text-gray-200 text-sm mb-1 line-clamp-1 px-4">{item.title || "Document Flyer"}</h4>
            
            <a
              href={item.contentPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center py-2.5 px-6 mt-2 bg-gradient-to-r from-[#8E6D2F] to-[#C5A059] text-white w-full rounded-xl font-black text-sm transition-all active:scale-95 shadow-md uppercase tracking-widest"
            >
              <FileText size={18} className="mr-2" />
              Open Document
            </a>
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="px-4 py-1 border-t border-champagne/30 dark:border-gray-800 flex justify-between items-center text-gray-400 dark:text-gray-500">
        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
          <span>{new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          <span className="opacity-40">•</span>
          <span className="opacity-60">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </span>
        <div className="flex items-center gap-2">
          {item.type === 'audio' && <Megaphone size={14} className="opacity-50" />}
          {item.type === 'image' && <ImageIcon size={14} className="opacity-50" />}
          {item.type === 'text' && <FileText size={14} className="opacity-50" />}
          {item.type === 'video' && <Video size={14} className="opacity-50" />}
          {item.type === 'pdf' && <FileText size={14} className="opacity-50" />}
        </div>
      </div>
    </div>
  );
}

function AudioPlayer({ fileUrl }: { fileUrl?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && fileUrl) {
      const audio = new Audio(fileUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration);
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-1.5 bg-gradient-to-br from-champagne/20 to-[#FCFAF2]/50 dark:from-gold/10 dark:to-gray-900/20 rounded-xl relative overflow-hidden group">
      {/* Background Pulse Animation */}
      {isPlaying && (
        <div className="absolute left-3 w-10 h-10 bg-gold/50 rounded-full opacity-20 animate-ping" style={{ animationDuration: '1.5s' }} />
      )}

      {/* Play Button */}
      <button
        onClick={togglePlay}
        className={clsx(
          "relative z-10 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.1)] transition-all active:scale-90 duration-200",
          isPlaying ? "bg-red-500" : "bg-gold"
        )}
      >
        {isPlaying ? (
          <Pause size={18} className="text-white fill-current" />
        ) : (
          <Play size={18} className="text-white ml-0.5 fill-current" />
        )}
      </button>

      {/* Progress / Seek Slider */}
      <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
        <div className="flex justify-between items-center mb-1.5 px-0.5">
          <span className="text-[9px] font-black text-gold uppercase tracking-tighter">
            {isPlaying ? "Playing..." : "Voice Note"}
          </span>
          <span className="text-[9px] font-black tabular-nums text-gold/60 dark:text-gold/60">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="relative h-2 flex items-center group/slider mx-1.5">
          {/* Unfilled Track Background */}
          <div className="absolute left-0 right-0 h-1 bg-champagne/30 dark:bg-gray-800 rounded-full" />
          
          {/* Custom Progress Fill Overlay */}
          <div 
            className="absolute left-0 h-1 bg-gold rounded-full pointer-events-none z-10 transition-all duration-100" 
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
          <input 
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="seek-slider relative z-20 w-full"
            style={{ width: "calc(100% + 12px)", margin: "0 -6px" }}
          />
        </div>
      </div>
    </div>
  );
}
