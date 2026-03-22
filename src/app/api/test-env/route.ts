import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    length: process.env.HADITH_API_KEY?.length,
    prefix: process.env.HADITH_API_KEY?.substring(0, 5),
  });
}
