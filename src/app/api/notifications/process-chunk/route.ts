import { kv } from "@/lib/redis";
import { NextResponse } from "next/server";
import webpush from "web-push";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

webpush.setVapidDetails(
  "mailto:contact@masjid-e-aftab.org",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

async function handler(req: Request) {
  try {
    const { chunk, payload } = await req.json();

    if (!chunk || !Array.isArray(chunk)) {
      return NextResponse.json({ error: "Invalid chunk" }, { status: 400 });
    }

    const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);

    const results = await Promise.allSettled(
      chunk.map(async (subStr) => {
        if (!subStr) return;
        const sub = typeof subStr === "string" ? JSON.parse(subStr) : subStr;

        try {
          await webpush.sendNotification(sub, payloadStr);
        } catch (err: any) {
          // Prune expired tokens using SREM
          if (err.statusCode === 410 || err.statusCode === 404) {
             await kv.srem("user:subscriptions", subStr);
          }
          throw err;
        }
      })
    );

    const successCount = results.filter(r => r.status === "fulfilled").length;
    const failureCount = results.filter(r => r.status === "rejected").length;

    console.log(`[Worker] Chunk processed. Success: ${successCount}, Failures: ${failureCount}`);

    return NextResponse.json({ success: true, processed: chunk.length });
  } catch (error: any) {
    console.error("Worker Chunk Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Protect the route with QStash signature verification
export const POST = verifySignatureAppRouter(handler);
