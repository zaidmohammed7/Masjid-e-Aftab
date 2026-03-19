import { kv } from "@/lib/redis";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { differenceInMinutes, parseISO, addDays, format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { NextResponse } from "next/server";
import { Client } from "@upstash/qstash";

const qstash = new Client({ 
  token: process.env.QSTASH_TOKEN!,
  baseUrl: process.env.QSTASH_URL // Correct regional endpoint
});

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

export async function GET(req: Request) {
  // 0. Security: Only allow Vercel Cron or manual calls with CRON_SECRET/pw
  const { searchParams } = new URL(req.url);
  const cronPass = searchParams.get("pw");
  const force = searchParams.get("force") === "true";
  const authHeader = req.headers.get("Authorization");
  
  const isAuthorized = 
    authHeader === `Bearer ${process.env.CRON_SECRET}` || 
    cronPass === process.env.CRON_SECRET;

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

        // Precision Window: 15-20 minutes away OR manual force
        if ((diff >= 15 && diff < 20) || force) {
          activePrayer = p;
          if (force) break; // Use the first available prayer if forcing
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

    // 2. Fetch all subscriptions from Redis using SMEMBERS
    const allSubs = await kv.smembers("user:subscriptions") as string[];
    console.log(`[Dispatcher] Target: ${activePrayer}. Found ${allSubs.length} sessions.`);

    if (allSubs.length === 0) return NextResponse.json({ message: "Zero subscriptions found." });

    // 3. Dispatch to Workers via QStash Fan-out
    const CHUNK_SIZE = 500;
    const protocol = req.url.startsWith('https') ? 'https' : 'http';
    const host = req.headers.get('host');
    const workerUrl = `${protocol}://${host}/api/notifications/process-chunk`;

    const payload = {
      title: "Prayer Alert",
      prayerType: activePrayer,
      body: `It's almost time for ${activePrayer.charAt(0).toUpperCase() + activePrayer.slice(1)} prayer.`,
    };

    const dispatchPromises = [];

    for (let i = 0; i < allSubs.length; i += CHUNK_SIZE) {
      const chunk = allSubs.slice(i, i + CHUNK_SIZE);
      
      dispatchPromises.push(
        qstash.publishJSON({
          url: workerUrl,
          body: { chunk, payload },
        })
      );
    }

    await Promise.all(dispatchPromises);

    console.log(`[Dispatcher] Dispatched ${dispatchPromises.length} chunks to QStash.`);

    return NextResponse.json({
      message: `Dispatched ${allSubs.length} notifications to ${dispatchPromises.length} workers via QStash.`,
      prayer: activePrayer,
      chunks: dispatchPromises.length
    });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
