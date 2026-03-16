import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const hasAuthToken = request.cookies.has("admin_auth");

  if (!hasAuthToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.SANITY_API_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "Sanity token not configured" }, { status: 500 });
  }

  return NextResponse.json({ token });
}
