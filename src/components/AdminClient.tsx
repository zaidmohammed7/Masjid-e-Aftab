"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Mic, Image as ImageIcon, FileText, X, Send, Loader2, Trash2, Megaphone, Edit, Clock, LogOut, Lock, Video, Languages, Star, ChevronRight, Pause, Play } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { publishAnnouncement, deleteAnnouncement, updateAnnouncement, savePrayerTimes } from "../app/actions";
import { createClient } from "@sanity/client";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { utcToIst } from "@/lib/time";

type Announcement = {
  _id: string;
  type: "audio" | "image" | "video" | "text" | "pdf";
  language: "urdu" | "english" | "both";
  timestamp: string;
  title?: string;
  contentText?: string;
  contentImage?: string;
  contentAudio?: string;
  contentVideo?: string;
  contentPdf?: string;
};

// Reusable TimePicker ensuring uniform cross-platform UI
// Custom Select Component for a more "Pro" feel
function TimePicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  // Parsing value of format "HH:MM AM/PM"
  const [timePart, ampmRaw] = value.split(" ");
  const [hPart, mPart] = (timePart || "").split(":");
  
  const hour = hPart || "12";
  const minute = mPart || "00";
  const ampm = (ampmRaw || "PM").toUpperCase();

  const minuteInputRef = useRef<HTMLInputElement>(null);

  const handleHourChange = (newVal: string) => {
    // Only allow digits
    const digits = newVal.replace(/\D/g, "");
    
    let finalHour = hour;
    let shouldFocusMinutes = false;
    let nextMinuteDigit = "";

    if (digits.length === 1) {
      const num = parseInt(digits);
      if (num >= 2 && num <= 9) {
        finalHour = `0${digits}`;
        shouldFocusMinutes = true;
      } else {
        finalHour = digits; // wait for next digit if it's 1 or 0
      }
    } else if (digits.length >= 2) {
      const lastTwo = digits.slice(-2);
      const num = parseInt(lastTwo);
      
      if (num >= 1 && num <= 12) {
        finalHour = lastTwo;
        shouldFocusMinutes = true;
      } else if (num > 12) {
        // Smart handle: if user types "1" then "3", it can't be "13".
        // Assume "1" was "01" and "3" belongs to minutes.
        if (lastTwo[0] === "1" && parseInt(lastTwo[1]) > 2) {
          finalHour = "01";
          nextMinuteDigit = lastTwo[1];
          shouldFocusMinutes = true;
        } else {
          // just take the last digit as a new start
          finalHour = `0${lastTwo[1]}`;
          if (parseInt(lastTwo[1]) >= 2) shouldFocusMinutes = true;
        }
      }
    }

    if (shouldFocusMinutes) {
      const finalMinute = nextMinuteDigit ? `${nextMinuteDigit}0`.slice(0,2) : minute;
      onChange(`${finalHour}:${finalMinute} ${ampm}`);
      setTimeout(() => {
        minuteInputRef.current?.focus();
        if (nextMinuteDigit) {
          // If we pushed a digit to minutes, place cursor after it
          minuteInputRef.current?.setSelectionRange(1, 1);
        } else {
          minuteInputRef.current?.select();
        }
      }, 0);
    } else {
      onChange(`${finalHour}:${minute} ${ampm}`);
    }
  };

  const handleMinuteChange = (newVal: string) => {
    const digits = newVal.replace(/\D/g, "");
    let finalMinute = digits;

    if (digits.length >= 2) {
      const lastTwo = digits.slice(-2);
      const num = parseInt(lastTwo);
      if (num <= 59) {
        finalMinute = lastTwo;
      } else {
        finalMinute = "59";
      }
    }

    onChange(`${hour}:${finalMinute} ${ampm}`);
  };

  return (
    <div className="flex gap-4 items-center w-full">
      <div className="flex flex-1 items-center gap-2 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 shadow-sm focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">HH</span>
          <input
            type="text"
            inputMode="numeric"
            value={hour}
            onFocus={(e) => e.target.select()}
            onChange={(e) => handleHourChange(e.target.value)}
            className="w-full bg-transparent outline-none font-black text-center text-2xl text-gray-800 dark:text-gray-100 appearance-none"
            placeholder="12"
          />
        </div>
        <span className="text-2xl font-black text-gray-200">:</span>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">MM</span>
          <input
            ref={minuteInputRef}
            type="text"
            inputMode="numeric"
            value={minute}
            onFocus={(e) => e.target.select()}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="w-full bg-transparent outline-none font-black text-center text-2xl text-gray-800 dark:text-gray-100 appearance-none"
            placeholder="00"
          />
        </div>
      </div>

      <div className="flex flex-col bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl shadow-inner gap-1">
        <button
          onClick={() => onChange(`${hour}:${minute} AM`)}
          className={clsx(
            "px-4 py-2 rounded-xl text-[10px] font-black transition-all",
            ampm === "AM" ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-md" : "text-gray-400"
          )}
        >AM</button>
        <button
          onClick={() => onChange(`${hour}:${minute} PM`)}
          className={clsx(
            "px-4 py-2 rounded-xl text-[10px] font-black transition-all",
            ampm === "PM" ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-md" : "text-gray-400"
          )}
        >PM</button>
      </div>
    </div>
  );
}

function CompactAudioPlayer({ fileUrl, duration: totalDuration = 0 }: { fileUrl?: string; duration?: number }) {
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
    <div className="flex items-center gap-3 p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl w-full min-w-0" onClick={e => e.stopPropagation()}>
      <button onClick={togglePlay} className={clsx(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95",
        isPlaying ? "bg-red-500" : "bg-emerald-500"
      )}>
        {isPlaying ? <Pause size={18} className="text-white fill-current" /> : <Play size={18} className="text-white fill-current ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
        <div className="flex justify-between items-center mb-1 px-0.5">
          <span className="text-[9px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tighter tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="relative h-2 flex items-center">
          <div className="absolute left-0 right-0 h-1 bg-emerald-200/40 dark:bg-emerald-900/40 rounded-full" />
          <div className="absolute left-0 h-1 bg-emerald-500 rounded-full z-10" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
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

export default function AdminClient({ announcements, initialPrayerTimes }: { announcements: Announcement[], initialPrayerTimes: any }) {
  const [activeTab, setActiveTab] = useState<"announcements" | "prayerTimes" | "imaamsCorner">("announcements");
  const [adminLang, setAdminLang] = useState<"all" | "urdu" | "english">("all");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const router = useRouter();

  // Post Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postType, setPostType] = useState<"audio" | "image" | "video" | "text" | "pdf" | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postLang, setPostLang] = useState<"urdu" | "english" | "both">("urdu");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectionGroup, setSelectionGroup] = useState<"audio" | "media" | "document" | "text" | null>(null);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Handle Android/Browser back button to close expanded image
  useEffect(() => {
    if (expandedImage) {
      window.history.pushState({ imageExpanded: true }, "");
      const handlePopState = () => setExpandedImage(null);
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [expandedImage]);

  const closeExpandedImage = () => {
    if (expandedImage) {
      window.history.back();
      setExpandedImage(null);
    }
  };

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTextContent, setEditTextContent] = useState("");
  const [editType, setEditType] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Helper to ensure we only have "HH:MM AM/PM" from potentially ISO strings
  const formatForPicker = (time: string) => {
    if (!time) return "12:00 PM";
    if (time.includes("T") && time.endsWith("Z")) {
      return utcToIst(time);
    }
    return time;
  };

  // Prayer Times States
  const [ptFajr, setPtFajr] = useState(formatForPicker(initialPrayerTimes?.fajr));
  const [ptDhuhr, setPtDhuhr] = useState(formatForPicker(initialPrayerTimes?.dhuhr));
  const [ptAsr, setPtAsr] = useState(formatForPicker(initialPrayerTimes?.asr));
  const [ptMaghrib, setPtMaghrib] = useState(formatForPicker(initialPrayerTimes?.maghrib));
  const [ptIsha, setPtIsha] = useState(formatForPicker(initialPrayerTimes?.isha));
  const [ptJummah1, setPtJummah1] = useState(formatForPicker(initialPrayerTimes?.jummah1));
  const [ptJummah2, setPtJummah2] = useState(formatForPicker(initialPrayerTimes?.jummah2));
  const [ptJummah3, setPtJummah3] = useState(formatForPicker(initialPrayerTimes?.jummah3));
  const [ptHadeethTitle, setPtHadeethTitle] = useState(initialPrayerTimes?.hadeethTitle || "Hadeeth of the Day");
  const [ptHadeethText, setPtHadeethText] = useState(initialPrayerTimes?.hadeethText || "");
  const [ptSaving, setPtSaving] = useState(false);
  const [isTestSending, setIsTestSending] = useState(false);


  // Secure Token Fetcher
  const fetchSanityToken = async () => {
    const res = await fetch("/api/admin/sanity-token");
    if (!res.ok) throw new Error("Could not fetch secure upload token");
    const data = await res.json();
    return data.token;
  };

  // Direct Sanity Upload Helper
  const uploadFileDirectly = async (fileToUpload: File, type: string) => {
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const token = await fetchSanityToken();
      const client = createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false,
        token,
      });

      const assetType = (type === "audio" || type === "pdf" || type === "video") ? "file" : "image";

      setUploadProgress(30);
      const asset = await client.assets.upload(assetType, fileToUpload, {
        filename: fileToUpload.name,
      });
      setUploadProgress(100);
      return asset._id;
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin/login");
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setPostType(null);
    setPostTitle("");
    setTextContent("");
    setFile(null);
    setPostLang("urdu");
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks: Blob[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const f = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setFile(f);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setFile(null);
    } catch (e) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const openEditModal = (id: string, currentTitle: string, currentText: string, type: string) => {
    setEditId(id);
    setEditTitle(currentTitle || "");
    setEditTextContent(currentText || "");
    setEditType(type);
    setEditFile(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditId(null);
    setEditTitle("");
    setEditTextContent("");
    setEditType(null);
    setEditFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this announcement?")) return;

    const res = await deleteAnnouncement(id);
    if (!res.success) {
      alert("Failed to delete processing: " + res.error);
    } else {
      router.refresh(); // Request Next.js to reconstruct the server UI
    }
  };

  const handleEditSubmit = async () => {
    if (!editId || !editType) return;
    setIsEditing(true);

    const formData = new FormData();
    formData.append("id", editId);
    formData.append("title", editTitle);
    formData.append("type", editType);

    if (editType === "text") {
      formData.append("textContent", editTextContent);
    } else if (editFile) {
      try {
        const assetId = await uploadFileDirectly(editFile, editType);
        formData.append("assetId", assetId);
      } catch (err: any) {
        alert("Upload failed: " + err.message);
        setIsEditing(false);
        return;
      }
    }

    const res = await updateAnnouncement(formData);
    setIsEditing(false);
    setUploadProgress(0);
    if (res.success) {
      closeEditModal();
      router.refresh();
    } else {
      alert("Error updating post: " + res.error);
    }
  };

  const handlePrayerTimesSubmit = async () => {
    setPtSaving(true);
    
    // Clean up times (e.g. " :30 PM" -> "12:30 PM", "5: 0 PM" -> "05:00 PM")
    const clean = (time: string) => {
      let [h, mAmpm] = time.split(":");
      let [m, ampm] = (mAmpm || "").split(" ");
      let hr = parseInt(h.trim());
      if (isNaN(hr) || hr === 0) hr = 12;
      let min = parseInt(m.trim());
      if (isNaN(min)) min = 0;
      return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm || "PM"}`;
    };

    const data = {
      fajr: clean(ptFajr),
      dhuhr: clean(ptDhuhr),
      asr: clean(ptAsr),
      maghrib: clean(ptMaghrib),
      isha: clean(ptIsha),
      jummah1: clean(ptJummah1),
      jummah2: clean(ptJummah2),
      jummah3: clean(ptJummah3),
      hadeethTitle: ptHadeethTitle,
      hadeethText: ptHadeethText,
    };
    const res = await savePrayerTimes(initialPrayerTimes?._id || null, data);
    setPtSaving(false);
    if (res.success) {
      alert("Prayer times updated successfully!");
      router.refresh();
    } else {
      alert("Error saving prayer times: " + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-40 transition-colors duration-300">
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-select-arrow {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 8l5 5 5-5'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }
      `}} />
      {/* Premium Gradient Header block - Centered & Sync Height */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white pt-6 pb-8 px-8 rounded-b-[3.5rem] shadow-[0_20px_40px_-15px_rgba(4,120,87,0.5)] relative overflow-hidden text-center mb-6">
        <div className="absolute top-10 right-10 opacity-10 mix-blend-overlay rotate-12">
          <Lock size={160} />
        </div>
        <div className="absolute -top-16 -right-16 opacity-20 rotate-12 mix-blend-overlay">
          <div className="w-80 h-80 rounded-[4rem] border-[30px] border-white blur-sm"></div>
        </div>
        <div className="absolute bottom-[-10%] -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-screen opacity-20 blur-2xl"></div>

        <h1 className="text-4xl font-black relative z-10 tracking-tight leading-tight drop-shadow-lg text-white">
          Admin Control
        </h1>
        <p className="text-emerald-50/90 text-lg font-medium mt-2 relative z-10 tracking-wide drop-shadow-md">
          Management dashboard
        </p>
      </div>

      <div className="px-6 -mt-3 relative z-30">
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-950 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 px-6 py-3.5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 transition-all active:scale-95 group"
          >
            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Logout from Session</span>
          </button>
          
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 mx-6 mt-6 rounded-[2rem] shadow-inner">
        <button
          onClick={() => setActiveTab("announcements")}
          className={clsx(
            "flex-1 py-4 text-sm flex flex-col items-center justify-center gap-1 font-black rounded-[1.75rem] transition-all uppercase tracking-widest",
            activeTab === "announcements" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xl scale-105" : "text-gray-400 dark:text-gray-500 hover:bg-white/50"
          )}
        >
          <Megaphone size={20} /> Posts
        </button>
        <button
          onClick={() => setActiveTab("prayerTimes")}
          className={clsx(
            "flex-1 py-4 text-sm flex flex-col items-center justify-center gap-1 font-black rounded-[1.75rem] transition-all uppercase tracking-widest",
            activeTab === "prayerTimes" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xl scale-105" : "text-gray-400 dark:text-gray-500 hover:bg-white/50"
          )}
        >
          <Clock size={20} /> Times
        </button>
        <button
          onClick={() => setActiveTab("imaamsCorner")}
          className={clsx(
            "flex-1 py-4 text-sm flex flex-col items-center justify-center gap-1 font-black rounded-[1.75rem] transition-all uppercase tracking-widest",
            activeTab === "imaamsCorner" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xl scale-105" : "text-gray-400 dark:text-gray-500 hover:bg-white/50"
          )}
        >
          <Star size={20} /> Imaam
        </button>
      </div>

      {activeTab === "announcements" && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Recent Posts</h2>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setAdminLang("all")}
                className={clsx("px-3 py-1.5 text-xs font-bold rounded-lg transition-all", adminLang === "all" ? "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm" : "text-gray-400")}
              >All</button>
              <button
                onClick={() => setAdminLang("english")}
                className={clsx("px-3 py-1.5 text-xs font-bold rounded-lg transition-all mx-1", adminLang === "english" ? "bg-blue-500 text-white shadow-sm" : "text-gray-400")}
              >English</button>
              <button
                onClick={() => setAdminLang("urdu")}
                className={clsx("px-3 py-1.5 text-xs font-bold rounded-lg transition-all", adminLang === "urdu" ? "bg-green-500 text-white shadow-sm" : "text-gray-400")}
              >اردو</button>
            </div>
          </div>

          {announcements.filter(a => adminLang === "all" || a.language === "both" || a.language === adminLang).length === 0 ? (
            <div className="bg-[var(--card-bg)] p-10 rounded-3xl shadow-sm border border-[var(--card-border)] flex flex-col items-center justify-center min-h-[200px] text-center">
              <Megaphone size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No {adminLang !== "all" ? adminLang : ""} posts found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.filter(a => adminLang === "all" || a.language === "both" || a.language === adminLang).map((item) => (
                <div key={item._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] overflow-hidden shadow-sm flex flex-col transition-all active:scale-[0.99] duration-300">
                  {/* Header: Title and Language Badge */}
                  <div className="flex justify-between items-center px-5 py-3 border-b border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/30">
                    <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 tracking-tight leading-tight flex-1 line-clamp-1">
                      {item.title || "Announcement"}
                    </h3>
                    <div className={clsx(
                      "ml-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm",
                      item.language === "urdu" ? "bg-green-500 text-white" : item.language === "english" ? "bg-blue-500 text-white" : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    )}>
                      {item.language === "both" ? "Urdu/Eng" : item.language}
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex items-stretch">
                    <div className="flex-1 p-4 min-w-0">
                      <div className="rounded-xl overflow-hidden">
                        {item.type === "image" && item.contentImage && (
                          <div 
                            className="bg-gray-50 dark:bg-gray-800 flex items-center justify-center h-44 cursor-pointer group relative"
                            onClick={() => setExpandedImage(item.contentImage!)}
                          >
                            <img src={item.contentImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                        )}
                        {item.type === "video" && item.contentVideo && (
                          <div className="bg-black flex items-center justify-center h-44">
                            <video src={item.contentVideo} controls className="w-full h-full object-contain" />
                          </div>
                        )}
                        {item.type === "audio" && item.contentAudio && (
                          <div className="py-1">
                            <CompactAudioPlayer fileUrl={item.contentAudio} />
                          </div>
                        )}
                        {item.type === "pdf" && item.contentPdf && (
                          <div className="bg-purple-50 dark:bg-purple-950/30 flex flex-col p-4 items-center justify-center text-center rounded-2xl border border-purple-100 dark:border-purple-800/50">
                            <FileText size={40} className="text-purple-600 dark:text-purple-400 mb-2" />
                            <a
                              href={item.contentPdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center py-2 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-xs transition-all active:scale-95 shadow-md"
                            >
                              <FileText size={14} className="mr-2" />
                              Open Document
                            </a>
                          </div>
                        )}
                        {item.type === "text" && item.contentText && (
                          <p className="text-[12px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic line-clamp-3">
                            {item.contentText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-col gap-1 border-l border-gray-100 dark:border-gray-800 p-2 justify-center bg-gray-50/30 dark:bg-gray-800/10">
                      <button
                        onClick={() => openEditModal(item._id, item.title || "", item.contentText || "", item.type)}
                        className="p-3 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl transition-colors active:scale-95"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors active:scale-95"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Footer: Timestamp */}
                  <div className="px-5 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center text-gray-400 dark:text-gray-500">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                      {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating Action / Quick Post Button */}
          <button
            onClick={toggleModal}
            className="fixed bottom-32 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl hover:bg-emerald-600 active:scale-90 transition-all z-40 animate-bounce flex items-center justify-center"
            aria-label="Quick Post"
            style={{ animationDuration: '1s' }}
          >
            <Plus size={28} />
          </button>
        </div>
      )}

      {activeTab === "prayerTimes" && (
        <div className="p-6">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white dark:border-gray-800 flex flex-col gap-6">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center border-b border-gray-100 dark:border-gray-800 pb-4 tracking-tight capitalize">Daily jamaat times</h2>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">Fajr</label>
                <TimePicker value={ptFajr} onChange={setPtFajr} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">Dhuhr</label>
                <TimePicker value={ptDhuhr} onChange={setPtDhuhr} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">Asr</label>
                <TimePicker value={ptAsr} onChange={setPtAsr} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">Maghrib</label>
                <TimePicker value={ptMaghrib} onChange={setPtMaghrib} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">Isha</label>
                <TimePicker value={ptIsha} onChange={setPtIsha} />
              </div>
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100/50">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">1st Jummah Jamaat</label>
                <TimePicker value={ptJummah1} onChange={setPtJummah1} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">2nd Jummah Jamaat</label>
                <TimePicker value={ptJummah2} onChange={setPtJummah2} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">3rd Jummah Jamaat</label>
                <TimePicker value={ptJummah3} onChange={setPtJummah3} />
              </div>

              <button
                disabled={ptSaving}
                onClick={handlePrayerTimesSubmit}
                className="w-full bg-emerald-500 text-white p-6 rounded-[2rem] text-xl font-black flex items-center justify-center gap-4 hover:bg-emerald-600 shadow-xl active:scale-95 transition-all mt-6 uppercase tracking-widest"
              >
                {ptSaving ? <Loader2 size={32} className="animate-spin" /> : <><Send size={24} /> Save Times</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "imaamsCorner" && (
        <div className="p-6 pt-2">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white dark:border-gray-800">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-3xl text-emerald-600 dark:text-emerald-400 mb-4">
                <Star size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight capitalize">Imaam's corner</h2>
              <p className="text-gray-400 font-medium">Update the Hadeeth of the Day</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">Hadeeth Title</label>
                <input
                  value={ptHadeethTitle}
                  onChange={e => setPtHadeethTitle(e.target.value)}
                  placeholder="e.g. Hadeeth of the Day"
                  className="w-full p-4 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-emerald-500 outline-none font-bold bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 shadow-sm transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-400 uppercase tracking-widest text-[10px] pl-2">Hadeeth Text / Message</label>
                <textarea
                  value={ptHadeethText}
                  onChange={e => setPtHadeethText(e.target.value)}
                  placeholder="Type the Imaam's message or Hadeeth..."
                  className="w-full p-4 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-emerald-500 outline-none font-bold bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 shadow-sm transition-all min-h-[150px]"
                  rows={6}
                />
              </div>

              <button
                disabled={ptSaving}
                onClick={handlePrayerTimesSubmit}
                className="w-full bg-emerald-500 text-white p-6 rounded-[2rem] text-xl font-black flex items-center justify-center gap-4 hover:bg-emerald-600 shadow-xl active:scale-95 transition-all mt-6 uppercase tracking-widest"
              >
                {ptSaving ? <Loader2 size={32} className="animate-spin" /> : <><Send size={24} /> Update Content</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------- MODALS ----------- */}
      {/* Action / Add Post Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 pb-12">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative translate-y-0 animate-in slide-in-from-bottom-10 h-auto max-h-[85vh] overflow-y-auto">

            <button
              onClick={toggleModal}
              className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full active:scale-90"
            >
              <X size={32} />
            </button>

            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 mt-2 tracking-tight">New Post</h3>

            {/* Language Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-6 shadow-inner">
              <button
                onClick={() => setPostLang("both")}
                className={clsx(
                  "flex-1 py-3 text-sm font-black rounded-xl transition-all uppercase tracking-tighter",
                  postLang === "both" ? "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-md scale-105" : "text-gray-500 hover:bg-gray-200"
                )}
              >Both</button>
              <button
                onClick={() => setPostLang("english")}
                className={clsx(
                  "flex-1 py-3 text-sm font-black rounded-xl transition-all uppercase tracking-tighter mx-1",
                  postLang === "english" ? "bg-blue-500 text-white shadow-md scale-105" : "text-gray-500 hover:bg-gray-200"
                )}
              >English</button>
              <button
                onClick={() => setPostLang("urdu")}
                className={clsx(
                  "flex-1 py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1.5",
                  postLang === "urdu" ? "bg-green-500 text-white shadow-md scale-105" : "text-gray-500 hover:bg-gray-200"
                )}
              >
                <span className="text-lg">اردو</span>
                <span className="text-[9px] font-bold opacity-80 translate-y-[2px]">(Urdu)</span>
              </button>
            </div>

            <div className="mb-6 flex flex-col gap-2">
              <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Subject / Title</label>
              <input
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder="e.g. Eid Update"
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-2xl focus:border-emerald-500 outline-none text-xl font-bold shadow-sm text-gray-800 dark:text-gray-100"
              />
            </div>

            {!selectionGroup ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setSelectionGroup("audio"); setPostType("audio"); }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 active:scale-95 transition-all shadow-sm border border-emerald-100 dark:border-emerald-800/50"
                >
                  <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md">
                    <Mic size={20} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight">Audio</span>
                </button>

                <button
                  onClick={() => setSelectionGroup("media")}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 active:scale-95 transition-all shadow-sm border border-rose-100 dark:border-rose-800/50"
                >
                  <div className="bg-rose-500 text-white p-2 rounded-xl shadow-md">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight">Photo / Video</span>
                </button>

                <button
                  onClick={() => setSelectionGroup("document")}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 active:scale-95 transition-all shadow-sm border border-purple-100 dark:border-purple-800/50"
                >
                  <div className="bg-purple-500 text-white p-2 rounded-xl shadow-md">
                    <FileText size={20} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight">PDF / Word</span>
                </button>

                <button
                  onClick={() => { setSelectionGroup("text"); setPostType("text"); }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 active:scale-95 transition-all shadow-sm border border-amber-100 dark:border-amber-800/50"
                >
                  <div className="bg-amber-500 text-white p-2 rounded-xl shadow-md">
                    <FileText size={20} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight">Text Only</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl mb-4 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "p-2 rounded-xl text-white",
                    selectionGroup === "audio" ? "bg-emerald-500" : selectionGroup === "media" ? "bg-rose-500" : selectionGroup === "document" ? "bg-purple-500" : "bg-amber-500"
                  )}>
                    {selectionGroup === "audio" && <Mic size={20} />}
                    {selectionGroup === "media" && <ImageIcon size={20} />}
                    {selectionGroup === "document" && <FileText size={20} />}
                    {selectionGroup === "text" && <FileText size={20} />}
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300 capitalize">{selectionGroup === "document" ? "Document" : selectionGroup} Selected</span>
                </div>
                <button
                  onClick={() => { setSelectionGroup(null); setPostType(null); setFile(null); setTextContent(""); }}
                  className="text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-wider underline underline-offset-4"
                >
                  Change
                </button>
              </div>
            )}

            {selectionGroup && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center w-full animate-in fade-in zoom-in-95">
                {selectionGroup === "text" ? (
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Type your announcement here..."
                    className="w-full p-4 mb-6 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl text-lg text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-950 focus:outline-none focus:border-amber-500 shadow-inner"
                    rows={4}
                  />
                ) : file ? (
                  <div className="w-full mb-8 p-6 bg-emerald-50 dark:bg-emerald-950 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center gap-4 animate-in zoom-in-95">
                    <div className="bg-emerald-500 text-white p-4 rounded-full shadow-lg">
                      <Send size={32} className="rotate-0" />
                    </div>
                    <p className="text-xl font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest text-center">
                      {file.name}<br/><span className="text-xs opacity-60">Ready to Publish</span>
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="text-emerald-600 dark:text-emerald-400 font-bold text-sm underline underline-offset-4"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center mb-6">
                    {selectionGroup === "audio" && (
                      <div className="flex flex-col gap-6 w-full">
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={clsx(
                            "group relative flex items-center justify-center gap-4 p-8 rounded-[2.5rem] w-full transition-all active:scale-95 shadow-lg overflow-hidden",
                            isRecording ? "bg-red-500 scale-105" : "bg-emerald-50 dark:bg-emerald-950 border-2 border-dashed border-emerald-300 dark:border-emerald-800"
                          )}
                        >
                          <div className={clsx("p-4 rounded-full text-white shadow-md transition-transform", isRecording && "animate-pulse")}>
                            <Mic size={32} />
                          </div>
                          <span className={clsx("font-bold text-xl uppercase tracking-tight", isRecording ? "text-white" : "text-emerald-800 dark:text-emerald-400")}>
                            {isRecording ? "Recording... (Stop)" : "Record Live Audio"}
                          </span>
                        </button>

                        <div className="flex items-center gap-4 text-gray-400 dark:text-gray-600 font-bold w-full uppercase text-xs justify-center">
                          <hr className="flex-1 border-gray-100 dark:border-gray-800" /> OR <hr className="flex-1 border-gray-100 dark:border-gray-800" />
                        </div>

                        <label className="cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 p-6 rounded-[2rem] w-full text-center border-2 border-dashed border-gray-300 dark:border-gray-800 active:scale-95 transition-all">
                          <span className="text-lg font-bold text-gray-600 dark:text-gray-400 block px-4 py-4 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800">
                            Attach Audio File
                          </span>
                          <input
                            type="file" accept="audio/*" className="hidden"
                            onChange={(e) => {
                              const selected = e.target.files?.[0];
                              if (selected && selected.size > 100 * 1024 * 1024) {
                                alert("File too large!"); e.target.value = ""; return setFile(null);
                              }
                              setFile(selected || null); setPostType("audio");
                            }}
                          />
                        </label>
                      </div>
                    )}
                    {selectionGroup === "media" && (
                      <div className="flex flex-col gap-4 w-full">
                        <p className="text-gray-500 mb-4 font-bold text-center">Attach Photo or Video below:</p>
                        <label className="cursor-pointer bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900/40 p-6 rounded-[2rem] w-full text-center border-2 border-dashed border-rose-300 dark:border-rose-800 active:scale-95 transition-all">
                          <div className="bg-rose-500 w-16 h-16 mx-auto rounded-full text-white shadow-md flex items-center justify-center mb-2">
                            <ImageIcon size={32} />
                          </div>
                          <span className="text-lg font-bold text-rose-800 dark:text-rose-400">Capture / Pick Media</span>
                          <input
                            type="file" accept="image/*,video/*" className="hidden"
                            onChange={(e) => {
                              const selected = e.target.files?.[0];
                              if (selected && selected.size > 100 * 1024 * 1024) {
                                alert("File too large!"); e.target.value = ""; return setFile(null);
                              }
                              if (selected) {
                                setFile(selected);
                                setPostType(selected.type.startsWith("image/") ? "image" : "video");
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                    {selectionGroup === "document" && (
                      <div className="w-full">
                        <p className="text-gray-500 mb-4 font-bold text-center">Attach PDF or Word Doc below:</p>
                        <label className="cursor-pointer bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900/40 p-6 rounded-[2rem] w-full text-center border-2 border-dashed border-purple-300 dark:border-purple-800 active:scale-95 transition-all">
                          <div className="bg-purple-500 w-16 h-16 mx-auto rounded-full text-white shadow-md flex items-center justify-center mb-2">
                            <FileText size={32} />
                          </div>
                          <span className="text-lg font-bold text-purple-800 dark:text-purple-400">Attach Document (PDF/Word)</span>
                          <input
                            type="file" accept=".pdf,.doc,.docx" className="hidden"
                            onChange={(e) => {
                              const selected = e.target.files?.[0];
                              if (selected && selected.size > 100 * 1024 * 1024) {
                                alert("File too large!"); e.target.value = ""; return setFile(null);
                              }
                              setFile(selected || null); setPostType("pdf");
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                <button
                  disabled={isSubmitting || isUploading}
                  onClick={async () => {
                    setIsSubmitting(true);

                    if (postType !== "text" && !file) {
                      alert("Please attach a file or record audio first!");
                      setIsSubmitting(false);
                      return;
                    }

                    const formData = new FormData();
                    formData.append("type", postType as string);
                    formData.append("language", postLang);
                    formData.append("title", postTitle);

                    if (postType === "text") {
                      formData.append("textContent", textContent);
                    } else if (file) {
                      try {
                        const assetId = await uploadFileDirectly(file, postType as string);
                        formData.append("assetId", assetId);
                      } catch (err: any) {
                        alert("Upload failed: " + err.message);
                        setIsSubmitting(false);
                        return;
                      }
                    }

                    try {
                      const res = await publishAnnouncement(formData);
                      setIsSubmitting(false);
                      setUploadProgress(0);
                      if (res.success) {
                        toggleModal();
                        router.refresh();
                      } else {
                        alert("Error: " + (res as any).error);
                      }
                    } catch (e: any) {
                      setIsSubmitting(false);
                      setUploadProgress(0);
                      alert("Publish Failed: " + e.message);
                    }
                  }}
                  className={clsx(
                    "w-full text-white p-6 rounded-full text-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-xl active:scale-90 transition-all duration-300 overflow-hidden relative",
                    (isSubmitting || isUploading) ? "bg-gray-400" : "bg-emerald-500 hover:bg-emerald-600"
                  )}
                >
                  {isUploading && (
                    <div
                      className="absolute bottom-0 left-0 h-2 bg-emerald-300 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  )}
                  <div className="flex items-center gap-4">
                    {(isSubmitting || isUploading) ? <Loader2 size={32} className="animate-spin" /> : <><Send size={32} /> Publish</>}
                  </div>
                  {isUploading && <span className="text-xs opacity-80">Uploading to Cloud... {uploadProgress}%</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Text/Subject Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative translate-y-0 animate-in zoom-in-95 border border-gray-100 dark:border-gray-800">
            <button
              onClick={closeEditModal}
              className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full active:scale-90"
            >
              <X size={32} />
            </button>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 mt-2 tracking-tight">Edit Post</h3>

            <div className="mb-6 flex flex-col gap-2">
              <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Subject / Title</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-800 rounded-2xl text-xl text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-950 focus:outline-none focus:border-emerald-500 shadow-sm font-bold"
              />
            </div>

            {editType === "text" ? (
              <div className="mb-6 flex flex-col gap-2">
                <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Details (Text)</label>
                <textarea
                  value={editTextContent}
                  onChange={(e) => setEditTextContent(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-800 rounded-2xl text-xl text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-950 focus:outline-none focus:border-emerald-500 shadow-inner"
                  rows={4}
                />
              </div>
            ) : (
              <div className="mb-6 flex flex-col items-center">
                <label className="font-bold text-gray-500 uppercase tracking-widest text-sm w-full pl-2 mb-2">Replace Attached File (Optional)</label>
                <label className={clsx(
                  "cursor-pointer p-6 rounded-[2rem] w-full text-center border-2 border-dashed active:scale-95 transition-all text-xs",
                  editType === "audio" ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100" :
                  (editType === "image" || editType === "video") ? "bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-800 hover:bg-rose-100" :
                  "bg-purple-50 dark:bg-purple-950 border-purple-300 dark:border-purple-800 hover:bg-purple-100"
                )}>
                  <span className={clsx(
                    "font-bold block line-clamp-2 px-4 shadow-sm py-4 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800",
                    editType === "audio" ? "text-emerald-700 dark:text-emerald-400" :
                    (editType === "image" || editType === "video") ? "text-rose-700 dark:text-rose-400" :
                    "text-purple-700 dark:text-purple-400"
                  )}>
                    {editFile ? editFile.name : `Choose New ${editType === 'audio' ? 'Audio' : (editType === 'image' || editType === 'video') ? 'Media' : 'Document'}...`}
                  </span>
                  <input
                    type="file"
                    accept={
                      editType === "audio" ? "audio/*" : 
                      (editType === "image" || editType === "video") ? "image/*,video/*" : 
                      ".pdf,.doc,.docx"
                    }
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected && selected.size > 100 * 1024 * 1024) {
                        alert("File too large!"); e.target.value = ""; return setEditFile(null);
                      }
                      setEditFile(selected || null);
                    }}
                  />
                </label>
              </div>
            )}

            <button
              disabled={isEditing || isUploading}
              onClick={handleEditSubmit}
              className={clsx(
                "w-full text-white p-6 rounded-full text-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-xl active:scale-95 transition-all relative overflow-hidden",
                (isEditing || isUploading) ? "bg-gray-400" : "bg-emerald-500 hover:bg-emerald-600"
              )}
            >
              {isUploading && (
                <div
                  className="absolute bottom-0 left-0 h-2 bg-emerald-300 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
              <div className="flex items-center gap-4">
                {(isEditing || isUploading) ? <Loader2 size={32} className="animate-spin" /> : <><Send size={32} /> Save Changes</>}
              </div>
              {isUploading && <span className="text-xs opacity-80">Uploading Changes... {uploadProgress}%</span>}
            </button>
          </div>
        </div>
      )}

      {/* Expanded Image Overlay */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={closeExpandedImage}
        >
          <button 
            onClick={closeExpandedImage}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all active:scale-95"
          >
            <X size={32} />
          </button>
          <div className="w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
            <img 
              src={expandedImage} 
              alt="Expanded Preview" 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
