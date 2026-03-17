import { format, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Kolkata";

/**
 * Converts IST time string (e.g. "05:30 PM") to UTC ISO String for today
 */
export function istToUtc(timeStr: string): string {
  if (!timeStr || timeStr === "--:--") return "";
  
  // Get the current date specifically in the IST timezone
  const now = new Date();
  const istNow = toZonedTime(now, TIMEZONE);
  const dateStr = format(istNow, "yyyy-MM-dd");
  const fullStr = `${dateStr} ${timeStr}`;
  
  // Parse the string as an IST time
  const parsedIST = parse(fullStr, "yyyy-MM-dd hh:mm a", new Date());
  
  // Convert from IST to UTC
  const utcDate = fromZonedTime(parsedIST, TIMEZONE);
  
  // If the resulting time is in the past by more than 12 hours, 
  // it's likely intended for the next day (e.g. saving 1 AM when it's 11 PM)
  // But for simple "today" logic, the target timezone date is usually enough.
  return utcDate.toISOString();
}

/**
 * Converts UTC ISO String back to IST time string for display (e.g. "05:30 PM")
 */
export function utcToIst(utcIso: string): string {
  if (!utcIso) return "--:--";
  const utcDate = new Date(utcIso);
  const istDate = toZonedTime(utcDate, TIMEZONE);
  return format(istDate, "hh:mm a");
}
