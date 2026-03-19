"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading || pin.length < 4) return;

    setLoading(true);
    setError(false);

    try {
      // Use the environment variable or a default for testing
      const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || "1234";
      
      if (pin === correctPin) {
        // Set cookie with expiration and appropriate flags
        document.cookie = `admin_auth=true; path=/; SameSite=Lax; Max-Age=${60 * 60 * 24}`;
        
        // Use window.location for a hard refresh if router.push is hanging
        // but router.push is preferred for SPA experience.
        // Let's add a small timeout before navigating to ensure cookie is set
        setTimeout(() => {
          router.push("/admin");
        }, 100);
      } else {
        throw new Error("Invalid PIN");
      }
    } catch (err) {
      setError(true);
      setPin("");
      setLoading(false);
      // Reset error after 2 seconds
      setTimeout(() => setError(false), 2000);
    }
    // Note: We don't set loading back to false here on success because we expect a navigation
  };

  const handleKeypad = (num: string) => {
    if (!loading && pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => {
    if (!loading) {
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex flex-col justify-center items-center overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-sm flex flex-col items-center mx-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-emerald-500 p-4 rounded-[1.5rem] mb-4 shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-pulse">
          <Lock size={32} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">Administration</h1>
        <p className={clsx(
          "mb-8 text-sm transition-all duration-300",
          error ? "text-red-400 font-black animate-shake" : "text-gray-400 font-bold"
        )}>
          {loading ? "Logging in..." : error ? "Incorrect PIN" : "Enter PIN"}
        </p>

        {/* PIN Display */}
        <div className={clsx("flex gap-4 mb-10 transition-all", error && "animate-shake")}>
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx} 
              className={clsx(
                "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500",
                error ? "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : 
                pin.length > idx ? "bg-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-110" : "border-gray-700 bg-gray-800/30"
              )}
            >
               {pin.length > idx && <div className="w-3 h-3 bg-white rounded-full animate-in zoom-in-0 duration-300" />}
            </div>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "submit"].map((key) => {
            if (key === "clear") {
              return (
                <button
                  key={key}
                  type="button"
                  disabled={loading}
                  onClick={handleClear}
                  className="flex items-center justify-center h-16 rounded-2xl text-xs font-black text-gray-500 hover:text-white active:scale-90 transition-all uppercase tracking-widest disabled:opacity-30"
                >
                  Clear
                </button>
              );
            }
            if (key === "submit") {
              return (
                <button
                  key={key}
                  type="button"
                  disabled={loading || pin.length < 4}
                  onClick={() => handleLogin()}
                  className={clsx(
                    "flex items-center justify-center h-16 rounded-[1.2rem] transition-all duration-500 active:scale-95 shadow-xl relative overflow-hidden",
                    pin.length === 4 ? "bg-emerald-500 text-white shadow-emerald-500/40" : "bg-gray-800/80 text-gray-700 pointer-events-none opacity-50"
                  )}
                >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <ArrowRight size={28} />
                  )}
                </button>
              );
            }
            return (
              <button
                key={key}
                type="button"
                disabled={loading}
                onClick={() => handleKeypad(key)}
                className="flex items-center justify-center h-16 rounded-[1.2rem] bg-gray-800/80 dark:bg-gray-700/80 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent text-2xl font-black text-white shadow-lg active:scale-90 transition-all disabled:opacity-30"
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
