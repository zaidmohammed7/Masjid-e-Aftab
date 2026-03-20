export async function getMakkahLiveId(): Promise<string> {
  try {
    const response = await fetch("https://www.youtube.com/@SaudiQuranTv/live", {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.31",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch Makkah live page");

    const html = await response.text();
    
    // Look for the canonical URL which contains the current video ID
    const match = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)">/);
    if (match && match[1]) {
      return match[1];
    }

    // Fallback: look for og:url
    const ogMatch = html.match(/<meta property="og:url" content="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)">/);
    if (ogMatch && ogMatch[1]) {
      return ogMatch[1];
    }
    
    // Fallback ID (last known working)
    return "kYqGbBqmp8g";
  } catch (error) {
    console.error("Error fetching Makkah Live ID:", error);
    return "kYqGbBqmp8g"; // Return last known working ID as safety
  }
}
