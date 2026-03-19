import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import FeedClient from "@/components/FeedClient";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Use global edge cache
});

export const revalidate = 60; // Cache for 60 seconds (ISR)

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
      "contentVideo": contentVideo.asset->url,
      contentText
    }
  `);

  return <FeedClient announcements={announcements} />;
}
