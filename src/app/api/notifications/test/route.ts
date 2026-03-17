import { kv } from "@/lib/redis";
import { NextResponse } from "next/server";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:contact@masjid-e-aftab.org",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }

    const subStr = await kv.get(`user:subscription:${deviceId}`);
    if (!subStr) {
      return NextResponse.json({ error: "No subscription found for this device" }, { status: 404 });
    }

    const subscription = typeof subStr === "string" ? JSON.parse(subStr) : subStr;

    const payload = JSON.stringify({
      title: "Test Notification",
      body: "Experience the premium Masjid-e-Aftab alerts! This is a test broadcast.",
      prayerType: "test"
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Test Notification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
