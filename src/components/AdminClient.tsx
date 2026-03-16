"use client";

import { useState } from "react";
import { Plus, Mic, Image as ImageIcon, FileText, X, Send, Loader2, Trash2, Megaphone, Edit, Clock, LogOut } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { publishAnnouncement, deleteAnnouncement, updateAnnouncement, savePrayerTimes } from "../app/actions";

type Announcement = {
  _id: string;
  type: "audio" | "image" | "video" | "text" | "pdf";
  language: "urdu" | "english";
  timestamp: string;
  title?: string;
  contentText?: string;
  contentImage?: string;
  contentAudio?: string;
  contentPdf?: string;
};

// Reusable TimePicker ensuring uniform cross-platform UI
function TimePicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [h, mAmpm] = value.split(":");
  const [m, ampmRaw] = (mAmpm || "").split(" ");
  
  const hour = h ? String(parseInt(h)).padStart(2, '0') : "12";
  const minute = m ? String(parseInt(m)).padStart(2, '0') : "00";
  const ampm = (ampmRaw || "PM").toUpperCase();

  const handleUpdate = (newH: string, newM: string, newAmPm: string) => {
    onChange(`${newH}:${newM} ${newAmPm}`);
  };

  const hours = Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="flex gap-2 text-xl w-full">
      <select 
        value={hour} 
        onChange={e => handleUpdate(e.target.value, minute, ampm)}
        className="flex-1 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-emerald-500 outline-none font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-center cursor-pointer min-w-[30%] shadow-inner appearance-none custom-select-arrow"
      >
        {hours.map(hr => <option key={hr} value={hr}>{hr}</option>)}
      </select>
      <span className="text-3xl font-black text-gray-400 self-center mb-1">:</span>
      <select 
        value={minute} 
        onChange={e => handleUpdate(hour, e.target.value, ampm)}
        className="flex-1 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-emerald-500 outline-none font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-center cursor-pointer min-w-[30%] shadow-inner appearance-none custom-select-arrow"
      >
        {minutes.map(mn => <option key={mn} value={mn}>{mn}</option>)}
      </select>
      <select 
        value={ampm} 
        onChange={e => handleUpdate(hour, minute, e.target.value)}
        className="flex-1 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-emerald-500 outline-none font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-center cursor-pointer min-w-[30%] shadow-inner transition-colors focus:bg-emerald-50 appearance-none custom-select-arrow"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

export default function AdminClient({ announcements, initialPrayerTimes }: { announcements: Announcement[], initialPrayerTimes: any }) {
  const [activeTab, setActiveTab] = useState<"announcements" | "prayerTimes">("announcements");
  const router = useRouter();

  // Post Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postType, setPostType] = useState<"audio" | "image" | "text" | "pdf" | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postLang, setPostLang] = useState<"urdu" | "english">("urdu");

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTextContent, setEditTextContent] = useState("");
  const [editType, setEditType] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Prayer Times States
  const [ptFajr, setPtFajr] = useState(initialPrayerTimes?.fajr || "05:30 AM");
  const [ptDhuhr, setPtDhuhr] = useState(initialPrayerTimes?.dhuhr || "01:30 PM");
  const [ptAsr, setPtAsr] = useState(initialPrayerTimes?.asr || "05:00 PM");
  const [ptMaghrib, setPtMaghrib] = useState(initialPrayerTimes?.maghrib || "07:00 PM");
  const [ptIsha, setPtIsha] = useState(initialPrayerTimes?.isha || "08:30 PM");
  const [ptJummah1, setPtJummah1] = useState(initialPrayerTimes?.jummah1 || "01:00 PM");
  const [ptJummah2, setPtJummah2] = useState(initialPrayerTimes?.jummah2 || "01:30 PM");
  const [ptJummah3, setPtJummah3] = useState(initialPrayerTimes?.jummah3 || "02:00 PM");
  const [ptSaving, setPtSaving] = useState(false);

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

    if (editFile && editFile.size > 20 * 1024 * 1024) {
      alert("This file is too large! Please upload a file smaller than 20MB.");
      setIsEditing(false);
      return;
    }

    const formData = new FormData();
    formData.append("id", editId);
    formData.append("title", editTitle);
    formData.append("type", editType);
    if (editType === "text") {
       formData.append("textContent", editTextContent);
    } else if (editFile) {
       formData.append("file", editFile);
    }

    const res = await updateAnnouncement(formData);
    setIsEditing(false);
    if (res.success) {
      closeEditModal();
      router.refresh();
    } else {
      alert("Error updating post: " + res.error);
    }
  };

  const handlePrayerTimesSubmit = async () => {
    setPtSaving(true);
    const data = {
      fajr: ptFajr,
      dhuhr: ptDhuhr,
      asr: ptAsr,
      maghrib: ptMaghrib,
      isha: ptIsha,
      jummah1: ptJummah1,
      jummah2: ptJummah2,
      jummah3: ptJummah3,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-40 transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-select-arrow {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 8l5 5 5-5'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }
      `}} />
      {/* Premium Header - Centered & Sync Height */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white pt-12 pb-14 px-8 rounded-b-[3.5rem] shadow-[0_20px_40px_-15px_rgba(4,120,87,0.5)] relative overflow-hidden text-center">
        <div className="absolute -top-16 -right-16 opacity-20 rotate-12 mix-blend-overlay">
          <div className="w-80 h-80 rounded-[4rem] border-[30px] border-white blur-sm"></div>
        </div>
        <div className="absolute bottom-[-10%] -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-screen opacity-20 blur-2xl"></div>
        
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 transition-all active:scale-95 text-[10px]"
          >
            <LogOut size={14} />
            <span className="font-bold uppercase tracking-wider">Logout</span>
          </button>
        </div>

        <h1 className="text-4xl font-black relative z-10 tracking-tight leading-tight drop-shadow-lg">
          Admin Control
        </h1>
        <p className="text-emerald-50/90 text-lg font-medium mt-2 relative z-10 tracking-wide drop-shadow-md">
          Manage Announcements & Times
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-200 dark:bg-gray-800 p-1 mx-6 mt-6 rounded-2xl shadow-inner">
         <button 
           onClick={() => setActiveTab("announcements")}
           className={clsx(
             "flex-1 py-4 text-xl flex items-center justify-center gap-2 font-bold rounded-xl transition-all",
             activeTab === "announcements" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-md scale-105" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
           )}
         >
           <Megaphone size={28} /> Posts
         </button>
         <button 
           onClick={() => setActiveTab("prayerTimes")}
           className={clsx(
             "flex-1 py-4 text-xl flex items-center justify-center gap-2 font-bold rounded-xl transition-all",
             activeTab === "prayerTimes" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-md scale-105" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
           )}
         >
           <Clock size={28} /> Times
         </button>
      </div>

      {activeTab === "announcements" ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">Recent Posts</h2>
          {announcements.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[200px]">
              <p className="text-gray-400 font-medium">No recent posts to show.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((item) => (
                <div key={item._id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                  {/* Language Tag Badge */}
                  <div className={clsx(
                    "absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold text-white",
                    item.language === "urdu" ? "bg-green-500" : "bg-blue-500"
                  )}>
                     {item.language === "urdu" ? "Urdu" : "English"}
                  </div>
                  
                  <div className="flex gap-4 items-center mt-2 flex-1 min-w-0 pr-2">
                    <div className={clsx(
                      "p-4 rounded-2xl flex-shrink-0 text-white",
                      item.type === "text" ? "bg-amber-400" : item.type === "audio" ? "bg-blue-400" : item.type === "pdf" ? "bg-purple-400" : "bg-emerald-400"
                    )}>
                      {item.type === "text" && <FileText size={28} />}
                      {item.type === "audio" && <Mic size={28} />}
                      {item.type === "image" && <ImageIcon size={28} />}
                      {item.type === "pdf" && <FileText size={28} />}
                    </div>

                    <div className="overflow-hidden flex-1 min-w-0">
                      <p className="font-bold text-gray-800 dark:text-gray-100 capitalize truncate w-full text-lg pr-2">
                         {item.title || "Announcement"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                         {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="pl-4 border-l border-gray-100 ml-2 flex flex-col gap-2 flex-shrink-0">
                     <button 
                       onClick={() => openEditModal(item._id, item.title || "", item.contentText || "", item.type)}
                       className="p-3 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors active:scale-95"
                       title="Edit Post"
                     >
                        <Edit size={32} />
                     </button>
                     <button 
                       onClick={() => handleDelete(item._id)}
                       className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
                       title="Delete Post"
                     >
                        <Trash2 size={32} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating Action / Quick Post Button */}
          <button
            onClick={toggleModal}
            className="fixed bottom-32 right-6 p-6 bg-emerald-500 text-white rounded-[2rem] shadow-2xl hover:bg-emerald-600 active:scale-90 transition-all z-40 animate-bounce cursor-pointer flex items-center gap-2"
            aria-label="Quick Post"
          >
            <Plus size={40} />
          </button>
        </div>
      ) : (
        <div className="p-6">
           <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center border-b border-gray-100 dark:border-gray-800 pb-4">Set Namaz Times</h2>
              
              <div className="space-y-6">
                 <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Fajr</label>
                    <TimePicker value={ptFajr} onChange={setPtFajr} />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Dhuhr</label>
                    <TimePicker value={ptDhuhr} onChange={setPtDhuhr} />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Asr</label>
                    <TimePicker value={ptAsr} onChange={setPtAsr} />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Maghrib</label>
                    <TimePicker value={ptMaghrib} onChange={setPtMaghrib} />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Isha</label>
                    <TimePicker value={ptIsha} onChange={setPtIsha} />
                 </div>
                 <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                    <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">1st Jummah Jamaat</label>
                    <TimePicker value={ptJummah1} onChange={setPtJummah1} />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">2nd Jummah Jamaat</label>
                    <TimePicker value={ptJummah2} onChange={setPtJummah2} />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">3rd Jummah Jamaat</label>
                    <TimePicker value={ptJummah3} onChange={setPtJummah3} />
                 </div>

                 <button
                    disabled={ptSaving}
                    onClick={handlePrayerTimesSubmit}
                    className="w-full bg-emerald-500 text-white p-6 rounded-full text-2xl font-bold flex items-center justify-center gap-4 hover:bg-emerald-600 shadow-xl active:scale-95 transition-all mt-6"
                 >
                    {ptSaving ? <Loader2 size={32} className="animate-spin" /> : <><Send size={32} /> Save Times</>}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ----------- MODALS ----------- */}

      {/* Action / Add Post Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 pb-12">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative translate-y-0 animate-in slide-in-from-bottom-10 h-auto max-h-[85vh] overflow-y-auto">
            
            <button
              onClick={toggleModal}
              className="absolute top-6 right-6 p-2 bg-gray-100 text-gray-400 rounded-full active:scale-90"
            >
              <X size={32} />
            </button>
            
            <h3 className="text-3xl font-bold text-gray-800 mb-6 mt-2 tracking-tight">New Post</h3>
            
            {/* Language Selector */}
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 shadow-inner">
               <button 
                 onClick={() => setPostLang("urdu")}
                 className={clsx(
                   "flex-1 py-3 text-lg font-bold rounded-xl transition-all",
                   postLang === "urdu" ? "bg-green-500 text-white shadow-md scale-105" : "text-gray-500 hover:bg-gray-200"
                 )}
               >Urdu</button>
               <button 
                 onClick={() => setPostLang("english")}
                 className={clsx(
                   "flex-1 py-3 text-lg font-bold rounded-xl transition-all",
                   postLang === "english" ? "bg-blue-500 text-white shadow-md scale-105" : "text-gray-500 hover:bg-gray-200"
                 )}
               >English</button>
            </div>

            <div className="mb-6 flex flex-col gap-2">
              <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Subject / Title</label>
              <input 
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder="e.g. Eid Update"
                className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 outline-none text-xl font-bold shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setPostType("audio")}
                className="flex items-center gap-6 p-4 rounded-3xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all shadow-sm"
              >
                <div className="bg-blue-500 text-white p-4 rounded-[1.5rem] shadow-lg shadow-blue-500/30">
                  <Mic size={40} />
                </div>
                <span className="text-2xl font-bold">Voice Note</span>
              </button>

              <button 
                onClick={() => setPostType("image")}
                className="flex items-center gap-6 p-4 rounded-3xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95 transition-all shadow-sm"
              >
                <div className="bg-emerald-500 text-white p-4 rounded-[1.5rem] shadow-lg shadow-emerald-500/30">
                  <ImageIcon size={40} />
                </div>
                <span className="text-2xl font-bold">Photo / Flyer</span>
              </button>
              
              <button 
                onClick={() => setPostType("pdf")}
                className="flex items-center gap-6 p-4 rounded-3xl bg-purple-50 text-purple-600 hover:bg-purple-100 active:scale-95 transition-all shadow-sm"
              >
                <div className="bg-purple-500 text-white p-4 rounded-[1.5rem] shadow-lg shadow-purple-500/30">
                  <FileText size={40} />
                </div>
                <span className="text-2xl font-bold">Attach PDF</span>
              </button>

              <button 
                onClick={() => setPostType("text")}
                className="flex items-center gap-6 p-4 rounded-3xl bg-amber-50 text-amber-600 hover:bg-amber-100 active:scale-95 transition-all shadow-sm"
              >
                <div className="bg-amber-500 text-white p-4 rounded-[1.5rem] shadow-lg shadow-amber-500/30">
                  <FileText size={40} />
                </div>
                <span className="text-2xl font-bold">Text Only</span>
              </button>
            </div>

            {postType && (
               <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center w-full animate-in fade-in zoom-in-95">
                  {postType === "text" ? (
                    <textarea 
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Type your announcement here..."
                      className="w-full p-4 mb-6 border-2 border-amber-200 rounded-2xl text-lg text-gray-800 focus:outline-none focus:border-amber-500 shadow-inner"
                      rows={4}
                    />
                  ) : postType === "audio" ? (
                    <div className="w-full flex flex-col items-center mb-6 gap-4">
                      {isRecording ? (
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 bg-red-500 rounded-full animate-pulse flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] mb-4 ring-4 ring-red-200">
                             <Mic size={48} className="text-white" />
                          </div>
                          <button 
                            onClick={stopRecording} 
                            className="bg-red-100 text-red-700 px-8 py-4 rounded-full font-bold text-xl active:scale-95 transition-all border border-red-200"
                          >
                            Stop Recording
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 w-full">
                           <button
                             onClick={startRecording}
                             className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-6 rounded-[2rem] border-2 border-dashed border-blue-300 w-full flex flex-col items-center gap-3 active:scale-95 transition-all"
                           >
                              <div className="bg-blue-500 p-4 rounded-full text-white shadow-md">
                                 <Mic size={32} />
                              </div>
                              <span className="font-bold text-xl">Tap to Record Live Audio</span>
                           </button>
                           
                           <div className="flex items-center gap-4 text-gray-400 font-bold w-full uppercase text-sm justify-center">
                              <hr className="flex-1"/> OR <hr className="flex-1"/>
                           </div>

                           <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 p-6 rounded-[2rem] w-full text-center border-2 border-dashed border-gray-300 active:scale-95 transition-all">
                             <span className="text-lg font-bold text-gray-600 block line-clamp-2 px-4 shadow-sm py-4 bg-white rounded-2xl border border-gray-100">
                               {file ? file.name : `Attach Pre-recorded Audio File`}
                             </span>
                             <input 
                               type="file" 
                               accept="audio/*"
                               className="hidden"
                               onChange={(e) => {
                                 const selected = e.target.files?.[0];
                                 if (selected && selected.size > 20 * 1024 * 1024) {
                                   alert("This file is too large! Please upload a file smaller than 20MB.");
                                   e.target.value = "";
                                   return setFile(null);
                                 }
                                 setFile(selected || null);
                               }}
                             />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center mb-6">
                      <p className="text-gray-500 mb-4 font-bold text-center">Attach {postType === "pdf" ? "PDF Document" : "Photo"} below:</p>
                      
                      {postType === "image" ? (
                         <div className="flex flex-col gap-4 w-full">
                           <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 p-6 rounded-[2rem] w-full text-center border-2 border-dashed border-emerald-300 active:scale-95 transition-all">
                             <div className="bg-emerald-500 w-16 h-16 mx-auto rounded-full text-white shadow-md flex items-center justify-center mb-2">
                                <ImageIcon size={32} />
                             </div>
                             <span className="text-lg font-bold text-emerald-800">Take Photo (Camera)</span>
                             <input 
                               type="file" 
                               accept="image/*" 
                               capture="environment"
                               className="hidden"
                               title="Camera"
                               onChange={(e) => {
                                 const selected = e.target.files?.[0];
                                 if (selected && selected.size > 20 * 1024 * 1024) { 
                                   alert("This file is too large! Please upload a file smaller than 20MB.");
                                   e.target.value = "";
                                   return setFile(null);
                                 }
                                 setFile(selected || null);
                               }}
                             />
                           </label>
                           
                           <div className="flex items-center gap-4 text-gray-400 font-bold w-full uppercase text-sm justify-center">
                              <hr className="flex-1"/> OR <hr className="flex-1"/>
                           </div>

                           <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 p-6 rounded-[2rem] w-full text-center border-2 border-dashed border-gray-300 active:scale-95 transition-all">
                             <span className="text-lg font-bold text-gray-600 block line-clamp-2 px-4 shadow-sm py-4 bg-white rounded-2xl border border-gray-100">
                               {file && file.name ? file.name : `Choose from Gallery`}
                             </span>
                             <input 
                               type="file" 
                               accept="image/*" 
                               className="hidden"
                               onChange={(e) => {
                                 const selected = e.target.files?.[0];
                                 if (selected && selected.size > 20 * 1024 * 1024) { 
                                   alert("This file is too large! Please upload a file smaller than 20MB.");
                                   e.target.value = "";
                                   return setFile(null);
                                 }
                                 setFile(selected || null);
                               }}
                             />
                           </label>
                         </div>
                      ) : (
                         <label className="cursor-pointer bg-gray-50 hover:bg-emerald-50 p-6 rounded-[2rem] w-full text-center border-2 border-dashed border-gray-300 hover:border-emerald-400 active:scale-95 transition-all">
                           <span className="text-xl font-bold text-emerald-700 block line-clamp-2 px-4 shadow-sm py-4 bg-white rounded-2xl border border-gray-100">
                             {file ? file.name : `Tap to Attach File`}
                           </span>
                           <input 
                             type="file" 
                             accept="application/pdf"
                             className="hidden"
                             onChange={(e) => {
                               const selected = e.target.files?.[0];
                               if (selected && selected.size > 20 * 1024 * 1024) { 
                                 alert("This file is too large! Please upload a file smaller than 20MB.");
                                 e.target.value = "";
                                 return setFile(null);
                               }
                               setFile(selected || null);
                             }}
                           />
                        </label>
                      )}
                    </div>
                  )}
                  
                  <button
                    disabled={isSubmitting}
                    onClick={async () => {
                        setIsSubmitting(true);
                        
                        // Enforce final size checks before passing to next-server actions payload
                        if (file && file.size > 20 * 1024 * 1024) {
                            alert("This file is too large (Exceeds 20MB server action safety net).");
                            setIsSubmitting(false);
                            return;
                        }

                        const formData = new FormData();
                        formData.append("type", postType);
                        formData.append("language", postLang);
                        formData.append("title", postTitle);
                        
                        if (postType === "text") {
                            formData.append("textContent", textContent);
                        } else {
                            if (!file) {
                                alert("Please attach a file first!");
                                setIsSubmitting(false);
                                return;
                            }
                            formData.append("file", file);
                        }

                        try {
                           const res = await publishAnnouncement(formData);
                           setIsSubmitting(false);
                           if (res.success) {
                               toggleModal();
                               router.refresh();
                           } else {
                               alert("Error: " + res.error);
                           }
                        } catch (e: any) {
                           setIsSubmitting(false);
                           alert("Upload Failed. The file might be too large or the network is unreachable. Details: " + e.message);
                        }
                    }}
                    className={clsx(
                      "w-full text-white p-6 rounded-full text-2xl font-bold flex items-center justify-center gap-4 shadow-xl active:scale-90 transition-all duration-300",
                      isSubmitting ? "bg-gray-400" : "bg-emerald-500 hover:bg-emerald-600"
                    )}
                  >
                    {isSubmitting ? <Loader2 size={32} className="animate-spin" /> : <><Send size={32} /> Publish</>}
                  </button>
               </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Text/Subject Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative translate-y-0 animate-in zoom-in-95">
            <button
              onClick={closeEditModal}
              className="absolute top-6 right-6 p-2 bg-gray-100 text-gray-400 rounded-full active:scale-90"
            >
              <X size={32} />
            </button>
            <h3 className="text-3xl font-bold text-gray-800 mb-6 mt-2 tracking-tight">Edit Post</h3>
            
            <div className="mb-6 flex flex-col gap-2">
              <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Subject / Title</label>
              <input 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-2xl text-xl text-gray-800 focus:outline-none focus:border-amber-500 shadow-sm font-bold"
              />
            </div>

            {editType === "text" ? (
              <div className="mb-6 flex flex-col gap-2">
                <label className="font-bold text-gray-500 uppercase tracking-widest text-sm pl-2">Details (Text)</label>
                <textarea 
                  value={editTextContent}
                  onChange={(e) => setEditTextContent(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl text-xl text-gray-800 focus:outline-none focus:border-amber-500 shadow-inner"
                  rows={4}
                />
              </div>
            ) : (
              <div className="mb-6 flex flex-col items-center">
                <label className="font-bold text-gray-500 uppercase tracking-widest text-sm w-full pl-2 mb-2">Replace Attached File (Optional)</label>
                <label className="cursor-pointer bg-gray-50 hover:bg-amber-50 p-6 rounded-[2rem] w-full text-center border-2 border-dashed border-gray-300 hover:border-amber-400 active:scale-95 transition-all">
                   <span className="text-xl font-bold text-amber-700 block line-clamp-2 px-4 shadow-sm py-4 bg-white rounded-2xl border border-gray-100">
                     {editFile ? editFile.name : `Tap to Choose New File...`}
                   </span>
                   <input 
                     type="file" 
                     accept={editType === "audio" ? "audio/*" : editType === "pdf" ? "application/pdf" : "image/*"} 
                     capture={editType === "image" ? "environment" : undefined}
                     className="hidden"
                     onChange={(e) => {
                       const selected = e.target.files?.[0];
                       if (selected && selected.size > 20 * 1024 * 1024) {
                         alert("This file is too large! Please upload a file smaller than 20MB.");
                         e.target.value = "";
                         return setEditFile(null);
                       }
                       setEditFile(selected || null);
                     }}
                   />
                </label>
              </div>
            )}

            <button
               disabled={isEditing}
               onClick={handleEditSubmit}
               className={clsx(
                 "w-full text-white p-6 rounded-full text-2xl font-bold flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all",
                 isEditing ? "bg-gray-400" : "bg-amber-500 hover:bg-amber-600"
               )}
            >
               {isEditing ? <Loader2 size={32} className="animate-spin" /> : <><Edit size={32} /> Save Changes</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
