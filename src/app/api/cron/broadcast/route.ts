import { kv } from "@/lib/redis";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import webpush from "web-push";
import { differenceInMinutes, parseISO, addDays, format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { NextResponse } from "next/server";

// Web-push Configuration
webpush.setVapidDetails(
  "mailto:contact@masjid-e-aftab.org",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

export async function GET(req: Request) {
  // 0. Security: Check Authorization header OR ?pw query parameter
  const authHeader = req.headers.get("Authorization");
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("pw");
  
  const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}` || password === "RaanBiryani@27";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowUtc = new Date();
  const istNow = toZonedTime(nowUtc, "Asia/Kolkata");
  
  console.log(`[Broadcast] --- Debug Start ---`);
  console.log(`[Broadcast] Server UTC: ${nowUtc.toISOString()}`);
  console.log(`[Broadcast] India IST: ${istNow.toString()}`);

  try {
    // 1. Fetch Today's Prayer Times
    const prayerTimes = await client.fetch(`*[_type == "prayerTimes"][0]`);
    if (!prayerTimes) return NextResponse.json({ message: "No prayer times found." });

    const types = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    
    // Diagnostic info for the response
    const diagnostics: any = {
      serverTimeUtc: nowUtc.toISOString(),
      indiaTimeIst: istNow.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      prayersFound: {}
    };

    let activePrayer: string | null = null;

    for (const p of types) {
      if (prayerTimes[p]) {
        // 1. Extract HH:MM from Sanity (handles ISO or "05:00 AM" format)
        let hh: number, mm: number;
        
        if (prayerTimes[p].includes("T")) {
          const d = new Date(prayerTimes[p]);
          const z = toZonedTime(d, "Asia/Kolkata");
          hh = z.getHours();
          mm = z.getMinutes();
        } else {
          const match = prayerTimes[p].match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) continue;
          hh = parseInt(match[1]);
          mm = parseInt(match[2]);
          const ampm = match[3].toUpperCase();
          if (ampm === "PM" && hh !== 12) hh += 12;
          if (ampm === "AM" && hh === 12) hh = 0;
        }

        // 2. Build target date for TODAY in IST using string composition
        const dateStr = format(istNow, "yyyy-MM-dd");
        const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
        
        let targetUtc = fromZonedTime(`${dateStr} ${timeStr}`, "Asia/Kolkata");

        // 3. If target is in the past, move to TOMORROW
        if (targetUtc.getTime() <= nowUtc.getTime()) {
          const tomorrow = addDays(istNow, 1);
          const tomorrowDateStr = format(tomorrow, "yyyy-MM-dd");
          targetUtc = fromZonedTime(`${tomorrowDateStr} ${timeStr}`, "Asia/Kolkata");
        }

        const diff = differenceInMinutes(targetUtc, nowUtc);
        const targetZoned = toZonedTime(targetUtc, "Asia/Kolkata");
        
        diagnostics.prayersFound[p] = {
          original: prayerTimes[p],
          nextOccurrenceIst: targetZoned.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
          minutesUntil: diff
        };

        console.log(`[Broadcast] ${p}: Next at ${targetZoned.toLocaleString()} IST (${diff} mins)`);

        // Precision Window: 15-20 minutes away
        if (diff >= 15 && diff < 20) {
          activePrayer = p;
        }
      }
    }

    if (!activePrayer) {
      console.log(`[Broadcast] No prayer in window. Window: 15-20m. Matches found: 0`);
      return NextResponse.json({ 
        message: "No upcoming prayer in the 15-20m precision window.",
        diagnostics 
      });
    }

    // 2. Fetch all subscriptions from Redis
    const keys = await kv.keys("user:subscription:*");
    console.log(`[Cron] Target Prayer: ${activePrayer}. Fetched ${keys.length} tokens from Redis.`);

    if (keys.length === 0) {
      const allKeys = await kv.keys("*");
      return NextResponse.json({ 
        message: "Zero subscriptions found.", 
        allKeysFound: allKeys,
        debugHint: "Try toggling Prayer Alerts OFF and ON in Settings to register your device."
      });
    }

    // 3. Broadcast in Optimized Chunks
    const CHUNK_SIZE = 250; // Increased for scale
    let prunedCount = 0;
    let successCount = 0;
    
    const payload = JSON.stringify({
      title: "Prayer Alert",
      prayerType: activePrayer,
      body: `It's almost time for ${activePrayer.charAt(0).toUpperCase() + activePrayer.slice(1)} prayer.`,
    });

    for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
      const chunk = keys.slice(i, i + CHUNK_SIZE);
      const subs = await kv.mget(...chunk);
      
      const chunkPromises = subs.map((subStr, idx) => {
        if (!subStr) return Promise.resolve(null);
        let sub: any;
        try {
          sub = typeof subStr === "string" ? JSON.parse(subStr) : subStr;
        } catch (e) {
          return Promise.resolve(null);
        }

        return webpush.sendNotification(sub, payload)
          .then(() => { successCount++; return null; })
          .catch(async (err) => {
            // Prune expired tokens (410 Gone or 404 Not Found)
            if (err.statusCode === 410 || err.statusCode === 404) {
                await kv.del(chunk[idx]);
                prunedCount++;
            }
            return null;
          });
      });

      await Promise.allSettled(chunkPromises);

      // Scale Guard: Tiny delay between batches to respect Vercel's Hobby limits
      if (i + CHUNK_SIZE < keys.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.log(`[Cron] Broadcast finished. Success: ${successCount}, Pruned: ${prunedCount}`);

    return NextResponse.json({
      message: `Broadcast finished for ${activePrayer}`,
      sent: successCount,
      pruned: prunedCount
    });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
