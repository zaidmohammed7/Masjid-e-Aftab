"use client";

import { useState, useRef, useEffect } from "react";
import { Pause, Play } from "lucide-react";
import clsx from "clsx";

interface CompactAudioPlayerProps {
  fileUrl?: string;
  duration?: number;
}

export default function CompactAudioPlayer({ fileUrl, duration: totalDuration = 0 }: CompactAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(totalDuration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && fileUrl) {
      const audio = new Audio(fileUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [fileUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
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
    <div className="flex items-center gap-3 p-1.5 bg-gold/5 dark:bg-gold/900/10 rounded-xl w-full min-w-0" onClick={e => e.stopPropagation()}>
      <button onClick={togglePlay} className={clsx(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95",
        isPlaying ? "bg-red-600" : "bg-gold"
      )}>
        {isPlaying ? <Pause size={18} className="text-white fill-current" /> : <Play size={18} className="text-white fill-current ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
        <div className="flex justify-between items-center mb-1 px-1">
          <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em] tabular-nums">
            {isPlaying ? "Playing..." : "Paused"}
          </span>
          <span className="text-[9px] font-black text-gold/60 uppercase tracking-tighter tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="relative h-2 flex items-center px-0.5">
          <div className="absolute left-0 right-0 h-1 bg-champagne/40 dark:bg-gray-800 rounded-full" />
          <div className="absolute left-0 h-1 bg-gold rounded-full z-10" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
          <input
            type="range" min="0" max={duration || 0} step="0.1" value={currentTime}
            onChange={handleSeek}
            className="seek-slider h-2 w-full absolute opacity-0 cursor-pointer z-20"
          />
        </div>
      </div>
    </div>
  );
}
