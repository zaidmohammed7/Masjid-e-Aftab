export interface Hadith {
  arabic: string;
  english: string;
  urdu: string;
  source: string;
}

import { promises as fs } from 'fs';
import path from 'path';

async function fetchNawawiHadith(index: number): Promise<Hadith | null> {
  try {
    const [araRes, engRes] = await Promise.all([
      fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi.json`),
      fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-nawawi.json`)
    ]);

    const araData = await araRes.json();
    const engData = await engRes.json();

    const arabic = araData.hadiths.find((h: any) => h.hadithnumber === index);
    const english = engData.hadiths.find((h: any) => h.hadithnumber === index);

    if (arabic && english) {
      return {
        arabic: arabic.text,
        english: english.text,
        urdu: "", // No Urdu translation in this repo for Nawawi
        source: `Imam Nawawi - ${index}`,
      };
    }
  } catch (error) {
    console.error("Error fetching Nawawi Hadith:", error);
  }
  return null;
}

export async function fetchHadithByIndex(index: number, book: string = "sahih-bukhari"): Promise<Hadith | null> {
  if (book === "nawawi") {
    return fetchNawawiHadith(index);
  }

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
