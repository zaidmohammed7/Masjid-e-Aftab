import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { fetchHadithByIndex } from "@/lib/hadith";

function isThresholdMet(lastUpdatedIso: string): boolean {
  if (!lastUpdatedIso) return true;
  
  // Convert IST (UTC+5:30) for day comparison
  const now = new Date();
  const last = new Date(lastUpdatedIso);
  
  const getIstDay = (date: Date) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(date.getTime() + istOffset);
    return istTime.getUTCDate();
  };

  // True if the current IST day is different from the last updated IST day
  return getIstDay(now) !== getIstDay(last);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const apiKey = req.nextUrl.searchParams.get("key");
  const secret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${secret}` && apiKey !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });

  // Fetch settings using deterministic ID
  const settings = await client.fetch(`*[_id == "hadith-of-the-day"][0]`);
  
  if (settings?.isManualOverride && !isThresholdMet(settings.lastUpdated)) {
    return NextResponse.json({ message: "Manual override/Threshold active. Skipping." });
  }

  const newIndex = (settings?.currentIndex || 0) + 1;
  // Forced to Sahih Bukhari for automation
  const h = await fetchHadithByIndex(newIndex, "sahih-bukhari");

  if (!h) {
    return NextResponse.json({ error: "Failed to fetch Hadith" }, { status: 500 });
  }

  // Prepare document data
  const hadithData = {
    _type: "hadithSettings",
    currentIndex: newIndex,
    isManualOverride: false,
    lastUpdated: new Date().toISOString(),
    arabicText: h.arabic,
    englishText: h.english,
    urduText: h.urdu,
    source: h.source,
  };

  if (settings) {
    await client.patch(settings._id).set(hadithData).commit();
  } else {
    await client.create({ _id: "hadith-of-the-day", ...hadithData });
  }

  return NextResponse.json({ success: true, index: newIndex, source: h.source });
}
