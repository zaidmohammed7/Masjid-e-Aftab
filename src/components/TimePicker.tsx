"use client";

import { useRef } from "react";
import clsx from "clsx";

interface TimePickerProps {
  value: string;
  onChange: (val: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
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
      const finalMinute = nextMinuteDigit ? `${nextMinuteDigit}0`.slice(0, 2) : minute;
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
