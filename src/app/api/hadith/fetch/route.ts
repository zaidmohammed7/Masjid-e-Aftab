import { NextRequest, NextResponse } from "next/server";
import { fetchHadithByIndex } from "@/lib/hadith";

export async function GET(req: NextRequest) {
  const index = req.nextUrl.searchParams.get("index");
  // Optional: Book slug if we want to expand beyond default
  const book = req.nextUrl.searchParams.get("book"); 
  
  if (!index) return NextResponse.json({ error: "Missing index" }, { status: 400 });

  const h = await fetchHadithByIndex(parseInt(index), book || "sahih-bukhari");
  if (!h) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(h);
}
