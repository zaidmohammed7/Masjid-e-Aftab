export interface Hadith {
  arabic: string;
  english: string;
  urdu: string;
  source: string;
}

import { promises as fs } from 'fs';
import path from 'path';

export async function fetchHadithByIndex(index: number, book: string = "sahih-bukhari"): Promise<Hadith | null> {
  try {
    let apiKey = process.env.HADITH_API_KEY;
    
    // Attempt to load from JSON config if ENV is missing (prevents $ expansion issues in .env)
    if (!apiKey) {
      try {
        const configPath = path.join(process.cwd(), 'src/lib/hadith-config.json');
        const configRaw = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configRaw);
        apiKey = config.apiKey;
      } catch (err) {}
    }

    const url = `https://hadithapi.com/api/hadiths?apiKey=${apiKey || ""}&hadithNumber=${index}&book=${book}&paginate=1`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data && data.hadiths && data.hadiths.data && data.hadiths.data.length > 0) {
      const h = data.hadiths.data[0];
      return {
        arabic: h.hadithArabic,
        english: h.hadithEnglish,
        urdu: h.hadithUrdu,
        source: `${h.book.bookName} - ${h.hadithNumber}`,
      };
    } else {
      console.error("Hadith API Error:", data.message || "Unknown error (likely invalid/missing API Key)");
    }
  } catch (error) {
    console.error("Error fetching Hadith:", error);
  }
  return null;
}
