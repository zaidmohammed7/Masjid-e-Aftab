import { kv } from "@vercel/kv";
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
    const targetTime = addMinutes(nowUtc, 15);

    let activePrayer: string | null = null;

    for (const p of types) {
      if (prayerTimes[p]) {
        const prayerDate = parseISO(prayerTimes[p]);
        // If the prayer is approximately 15 minutes away (within the same minute)
        if (isSameMinute(prayerDate, targetTime)) {
          activePrayer = p;
          break;
        }
      }
    }

    if (!activePrayer) {
      return NextResponse.json({ message: "No upcoming prayer in the 15m window." });
    }

    // 2. Fetch all subscriptions from Redis
    // SCAN to get all keys with patterns user:subscription:*
    const keys = await kv.keys("user:subscription:*");

    if (keys.length === 0) return NextResponse.json({ message: "Zero subscriptions found." });

    // 3. Broadcast in Chunks of 100
    const CHUNK_SIZE = 100;
    const results = [];
    
    // Key formatting for payload
    const payload = JSON.stringify({
      title: "Prayer Alert",
      prayerType: activePrayer,
      body: `It's almost time for ${activePrayer.charAt(0).toUpperCase() + activePrayer.slice(1)} prayer.`,
    });

    for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
      const chunk = keys.slice(i, i + CHUNK_SIZE);
      const subs = await kv.mget<string[]>(...chunk);
      
      const chunkPromises = subs.map((subStr, idx) => {
        if (!subStr) return Promise.resolve(null);
        let sub: any;
        try {
          sub = typeof subStr === "string" ? JSON.parse(subStr) : subStr;
        } catch (e) {
          return Promise.resolve(null);
        }
        return webpush.sendNotification(sub, payload).catch(async (err) => {
            // Cleanup expired subscriptions
            if (err.statusCode === 410 || err.statusCode === 404) {
                await kv.del(chunk[idx]);
            }
            return null;
        });
      });

      const batchRes = await Promise.allSettled(chunkPromises);
      results.push(...batchRes);
    }

    return NextResponse.json({
      message: `Broadcast finished for ${activePrayer}`,
      recipients: results.length,
    });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
