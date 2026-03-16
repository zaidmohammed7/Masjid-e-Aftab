import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import AdminClient from "@/components/AdminClient";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Ensure fresh data for the admin
});

export const revalidate = 0; // Opt out of static caching so new announcements appear immediately

export default async function AdminPage() {
  const announcements = await client.fetch(`
    *[_type == "announcement"] | order(timestamp desc) {
      _id,
      title,
      type,
      language,
      timestamp,
      "contentImage": contentImage.asset->url,
      "contentAudio": contentAudio.asset->url,
      "contentVideo": contentVideo,
      contentText
    }
  `);

  const prayerTimes = await client.fetch(`*[_type == "prayerTimes"][0]`);

  return <AdminClient announcements={announcements} initialPrayerTimes={prayerTimes} />;
}
