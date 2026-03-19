import { kv } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: "Missing subscription" }, { status: 400 });
    }

    // Save to Redis Set: Use SADD for optimized broadcasting (replaces O(n) KEYS extraction)
    await kv.sadd("user:subscriptions", JSON.stringify(subscription));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
