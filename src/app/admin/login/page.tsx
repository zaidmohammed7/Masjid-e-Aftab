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
      document.cookie = "admin_auth=true; path=/";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 flex flex-col pt-12 pb-32 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center mx-auto">
        <div className="bg-emerald-500 p-6 rounded-full mb-8 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
          <Lock size={64} className="text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2">Admin Access</h1>
        <p className={clsx(
          "mb-10 text-xl transition-colors duration-300",
          error ? "text-red-400 font-bold" : "text-gray-400"
        )}>
          {error ? "Incorrect PIN" : "Enter your 4-digit PIN"}
        </p>

        {/* PIN Display */}
        <div className={clsx("flex gap-4 mb-12", error && "animate-bounce")}>
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx} 
              className={clsx(
                "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                error ? "border-red-500 bg-red-500/20" : 
                pin.length > idx ? "bg-emerald-500 border-emerald-500" : "border-gray-600 bg-transparent"
              )}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "submit"].map((key) => {
            if (key === "clear") {
              return (
                <button
                  key={key}
                  disabled={loading}
                  onClick={() => setPin("")}
                  className="flex items-center justify-center h-20 text-xl font-bold text-gray-400 hover:text-white active:scale-95"
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
                    "flex items-center justify-center h-20 rounded-full transition-all duration-300 active:scale-95 shadow-xl",
                    pin.length === 4 ? "bg-emerald-500 text-white shadow-emerald-500/50" : "bg-gray-800 text-gray-600"
                  )}
                >
                  <ArrowRight size={40} />
                </button>
              );
            }
            return (
              <button
                key={key}
                disabled={loading}
                onClick={() => handleKeypad(key)}
                className="flex items-center justify-center h-20 rounded-full bg-gray-800 hover:bg-gray-700 text-3xl font-bold text-white shadow-lg active:scale-95 transition-all"
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
