import { Amiri } from "next/font/google";
import QuranClient from "./QuranClient";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const revalidate = 3600; // ISR each hour

async function getSurahs() {
  const res = await fetch("https://api.alquran.cloud/v1/surah");
  if (!res.ok) throw new Error("Failed to fetch surahs");
  const data = await res.json();
  return data.data;
}

export default async function QuranPage() {
  const surahs = await getSurahs();

  return (
    <main className={`${amiri.variable} min-h-screen bg-transparent font-sans`}>
      <QuranClient initialSurahs={surahs} />
    </main>
  );
}
