import { format, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Kolkata";

/**
 * Converts IST time string (e.g. "05:30 PM") to UTC ISO String for today
 */
export function istToUtc(timeStr: string): string {
  if (!timeStr || timeStr === "--:--") return "";
  
  // Parse the time string assuming today's date in IST
  const today = new Date();
  const dateStr = format(today, "yyyy-MM-dd");
  const fullStr = `${dateStr} ${timeStr}`;
  
  // parse() expects a format like "yyyy-MM-dd hh:mm a"
  const parsedIST = parse(fullStr, "yyyy-MM-dd hh:mm a", new Date());
  
  // Convert from IST to UTC
  const utcDate = fromZonedTime(parsedIST, TIMEZONE);
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
