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
    const { subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: "Missing subscription object" }, { status: 400 });
    }

    // Optional: Verify the subscription exists in our Redis Set
    const isMember = await kv.sismember("user:subscriptions", JSON.stringify(subscription));
    if (!isMember) {
      // We'll still allow testing for newly created subscriptions not yet propagated
      console.warn("[Test] Subscription not found in Redis Set, but proceeding with push.");
    }

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
