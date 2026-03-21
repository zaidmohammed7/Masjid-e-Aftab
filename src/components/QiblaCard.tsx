"use client";

import React, { useState, useEffect } from "react";
import { Compass, MapPin, Navigation, Info, Lock } from "lucide-react";
import { calculateQibla } from "@/lib/qibla";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function QiblaCard() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [qibla, setQibla] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [city, setCity] = useState<string>("Detecting Location...");
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load last known position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("last_qibla_data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCoords(data.coords);
        setQibla(data.qibla);
        setCity(data.city);
        setHasPermission(true);
      } catch (e) {}
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const qWay = calculateQibla(latitude, longitude);
        setCoords({ lat: latitude, lon: longitude });
        setQibla(qWay);
        setHasPermission(true);

        // Fetch city name (Simple reverse geocoding)
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          const cityName = data.city || data.locality || "Current Location";
          setCity(cityName);
          
          localStorage.setItem("last_qibla_data", JSON.stringify({
            coords: { lat: latitude, lon: longitude },
            qibla: qWay,
            city: cityName
          }));
        } catch (e) {
          setCity("Detected");
        }
      },
      (err) => {
        setError("Permission denied. Please enable location.");
      }
    );
  };

  useEffect(() => {
    if (!isExpanded) return;

    // Handle Orientation
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is available on iOS
      const h = (e as any).webkitCompassHeading || (e.alpha !== null ? 360 - e.alpha : 0);
      setHeading(h);
    };

    const startOrientation = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const res = await (DeviceOrientationEvent as any).requestPermission();
          if (res === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (e) {}
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    startOrientation();
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isExpanded]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-150 fill-mode-both">
      <div 
        className={clsx(
          "relative bg-white dark:bg-[var(--card-bg)] rounded-[3rem] p-8 shadow-[0_15px_40px_-12px_rgba(197,160,89,0.15)] dark:shadow-none border border-champagne dark:border-[var(--card-border)] overflow-hidden transition-all duration-500",
          isExpanded ? "min-h-[450px]" : "min-h-[120px]"
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 dark:bg-gold/10 rounded-bl-[5rem]" />

        {!isExpanded ? (
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gold rounded-[1.2rem] text-white shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform duration-500">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-black text-gold tracking-[0.3em] uppercase mb-1">Direction</h3>
                <h2 className="text-2xl font-serif font-black text-[#2d2d2d] dark:text-gray-100 tracking-tight leading-none flex items-center gap-2">
                  Qibla Finder
                  {qibla && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: qibla }}
                      className="ml-1"
                    >
                       <Navigation size={14} className="text-gold fill-gold" />
                    </motion.div>
                  )}
                </h2>
                {hasPermission && (
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-1">
                    {city}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-gold/5 dark:bg-gold/10 p-3 rounded-full text-gold">
               <Compass size={20} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-8">
               <button onClick={() => setIsExpanded(false)} className="text-xs font-black text-gold uppercase tracking-widest hover:opacity-70 transition-opacity">
                  Close
               </button>
               <h3 className="text-[10px] font-black text-gold tracking-[0.3em] uppercase">Compass View</h3>
               <div className="w-10" />
            </div>

            {!hasPermission ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-6 animate-pulse">
                   <Lock size={32} />
                </div>
                <p className="text-[#2d2d2d] dark:text-gray-200 font-bold mb-6 px-4">
                   We need your location to calculate the exact direction of the Kaaba.
                </p>
                <button 
                  onClick={requestLocation}
                  className="bg-gold text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-gold/20 active:scale-95 transition-all"
                >
                  Enable Location
                </button>
                {error && <p className="text-red-500 text-[10px] mt-4 font-bold">{error}</p>}
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-full py-6">
                {/* Compass Face */}
                <div className="relative w-64 h-64 rounded-full border-4 border-champagne/30 dark:border-white/5 flex items-center justify-center shadow-inner">
                  {/* Compass Markers */}
                  <div className="absolute top-2 font-black text-[10px] text-gray-300">N</div>
                  <div className="absolute bottom-2 font-black text-[10px] text-gray-300">S</div>
                  <div className="absolute left-2 font-black text-[10px] text-gray-300">W</div>
                  <div className="absolute right-2 font-black text-[10px] text-gray-300">E</div>

                  {/* Fixed North Marker */}
                  <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    animate={{ rotate: -heading }}
                    transition={{ type: "spring", stiffness: 40, damping: 15 }}
                  >
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 font-black text-[12px] text-gray-300 dark:text-gray-600">N</div>
                  </motion.div>

                  {/* Rotating Needle Element */}
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ rotate: (qibla || 0) - heading }}
                    transition={{ type: "spring", stiffness: 40, damping: 15 }}
                  >
                    {/* Compass Needle - Sleek Gold Tapered Line pointing to Kaaba */}
                    <div className="absolute h-44 w-1 flex flex-col items-center">
                       {/* Tip pointing to Kaaba */}
                       <div className="absolute -top-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-gold" />
                       <div className="w-[1px] h-full bg-gradient-to-b from-gold via-gold/50 to-transparent rounded-full shadow-[0_0_15px_rgba(197,160,89,0.5)]" />
                    </div>

                    {/* Kaaba Icon at the edge of the needle's rotation */}
                    <div className="absolute translate-y-[-115px]">
                      <div className="w-6 h-6 bg-[#2d2d2d] rounded-sm border-2 border-gold flex items-center justify-center shadow-lg scale-90">
                         <div className="w-4 h-1 bg-gold/50 rounded-full mb-1" />
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Center Dot */}
                  <div className="w-4 h-4 bg-[#2d2d2d] border-2 border-gold rounded-full z-10 shadow-xl" />
                </div>

                <div className="absolute bottom-[-40px] text-center">
                   <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1">Heading</p>
                   <p className="text-2xl font-serif font-black text-[#2d2d2d] dark:text-gray-100">
                      {Math.round(heading)}° <span className="text-gray-300 text-sm font-sans mx-1">/</span> {Math.round(qibla || 0)}°
                   </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
