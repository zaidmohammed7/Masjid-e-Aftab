import { kv } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { deviceId, subscription } = await req.json();

    if (!deviceId || !subscription) {
      return NextResponse.json({ error: "Missing deviceId or subscription" }, { status: 400 });
    }

    // Save to Redis: Key is user:subscription:<deviceId>, Value is the JSON string
    await kv.set(`user:subscription:${deviceId}`, JSON.stringify(subscription));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
