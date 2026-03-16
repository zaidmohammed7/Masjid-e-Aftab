import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import FeedClient from "@/components/FeedClient";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Ensure we get fresh data directly from Sanity DB
});

export const revalidate = 0; // Opt out of static caching so new announcements appear immediately

export default async function AnnouncementsPage() {
  const announcements = await client.fetch(`
    *[_type == "announcement"] | order(timestamp desc) {
      _id,
      title,
      type,
      language,
      timestamp,
      "contentImage": contentImage.asset->url,
      "contentAudio": contentAudio.asset->url,
      "contentPdf": contentPdf.asset->url,
      "contentVideo": contentVideo,
      contentText
    }
  `);

  return <FeedClient announcements={announcements} />;
}
