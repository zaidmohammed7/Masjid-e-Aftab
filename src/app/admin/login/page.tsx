"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import clsx from "clsx";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simple mock logic for demonstration: 
    // In production, send this via a Server Action to verify process.env.ADMIN_PIN and set an HTTP-Only cookie.
    if (pin === "1234" || pin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
      document.cookie = "admin_auth=true; path=/; SameSite=Lax; Max-Age=86400";
      router.push("/admin");
    } else {
      setError(true);
      setPin("");
      setLoading(false);
      // Reset error after 2 seconds
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleKeypad = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex flex-col justify-center items-center overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center mx-auto">
        <div className="bg-emerald-500 p-4 rounded-full mb-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <Lock size={32} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">Admin Login</h1>
        <p className={clsx(
          "mb-6 text-sm transition-colors duration-300",
          error ? "text-red-400 font-bold" : "text-gray-400 font-medium"
        )}>
          {error ? "Incorrect PIN" : "Enter your 4-digit PIN"}
        </p>

        {/* PIN Display */}
        <div className={clsx("flex gap-3 mb-8", error && "animate-shake")}>
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx} 
              className={clsx(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                error ? "border-red-500 bg-red-500/20" : 
                pin.length > idx ? "bg-emerald-500 border-emerald-500" : "border-gray-600 bg-transparent"
              )}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "submit"].map((key) => {
            if (key === "clear") {
              return (
                <button
                  key={key}
                  disabled={loading}
                  onClick={() => setPin("")}
                  className="flex items-center justify-center h-14 text-sm font-black text-gray-500 hover:text-white active:scale-95 transition-colors uppercase tracking-widest"
                >
                  Clear
                </button>
              );
            }
            if (key === "submit") {
              return (
                <button
                  key={key}
                  disabled={loading || pin.length < 4}
                  onClick={handleLogin}
                  className={clsx(
                    "flex items-center justify-center h-14 rounded-2xl transition-all duration-300 active:scale-95 shadow-xl",
                    pin.length === 4 ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-gray-800 dark:bg-gray-700/50 text-gray-700"
                  )}
                >
                  <ArrowRight size={24} />
                </button>
              );
            }
            return (
              <button
                key={key}
                disabled={loading}
                onClick={() => handleKeypad(key)}
                className="flex items-center justify-center h-14 rounded-2xl bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-2xl font-black text-white shadow-lg active:scale-95 transition-all"
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
