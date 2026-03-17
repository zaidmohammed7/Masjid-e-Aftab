import { kv } from "@/lib/redis";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import webpush from "web-push";
import { NextResponse } from "next/server";
import { isSameMinute, addMinutes, parseISO } from "date-fns";

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
  // 0. Security First: Authorization check at the very top
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch Today's Prayer Times
    const prayerTimes = await client.fetch(`*[_type == "prayerTimes"][0]`);
    if (!prayerTimes) return NextResponse.json({ message: "No prayer times found." });

    const types = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    const nowUtc = new Date();
    
    // Precision Window: 15-20 minutes away
    // This allows a 5-minute cron to trigger exactly once per prayer without overlapping
    const lowerBound = addMinutes(nowUtc, 15);
    const upperBound = addMinutes(nowUtc, 20);

    let activePrayer: string | null = null;

    for (const p of types) {
      if (prayerTimes[p]) {
        const prayerDate = parseISO(prayerTimes[p]);
        // Check if prayer falls exactly within the 15-20 min window
        if (prayerDate >= lowerBound && prayerDate < upperBound) {
          activePrayer = p;
          break;
        }
      }
    }

    if (!activePrayer) {
      return NextResponse.json({ message: "No upcoming prayer in the 15-20m precision window." });
    }

    // 2. Fetch all subscriptions from Redis
    const keys = await kv.keys("user:subscription:*");
    console.log(`[Cron] Target Prayer: ${activePrayer}. Fetched ${keys.length} tokens from Redis.`);

    if (keys.length === 0) return NextResponse.json({ message: "Zero subscriptions found." });

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
