"use server";

import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";
import { revalidatePath } from "next/cache";

export async function publishAnnouncement(data: FormData) {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error("Missing Sanity API Token. Please add SANITY_API_TOKEN to .env.local");
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });

  const type = data.get("type") as "audio" | "image" | "video" | "text" | "pdf" | null;
  const language = data.get("language") as "urdu" | "english" | "both" || "urdu";
  const file = data.get("file") as File | null;
  const textContent = data.get("textContent") as string | null;
  const rawTitle = data.get("title") as string | null;

  if (!type) {
    throw new Error("Missing announcement type");
  }

  try {
    const document: any = {
      _type: "announcement",
      title: rawTitle && rawTitle.trim() !== "" ? rawTitle : `New ${type.toUpperCase()} from App`,
      type,
      language,
      timestamp: new Date().toISOString(),
    };

    const assetId = data.get("assetId") as string | null;

    if (type === "text" && textContent) {
      document.contentText = textContent;
    } else if (assetId) {
      // Use existing asset ID from client-side upload
      const assetRef = { _type: "reference", _ref: assetId };
      if (type === "audio") document.contentAudio = { _type: "file", asset: assetRef };
      else if (type === "pdf") document.contentPdf = { _type: "file", asset: assetRef };
      else if (type === "video") document.contentVideo = { _type: "file", asset: assetRef };
      else document.contentImage = { _type: "image", asset: assetRef };
    } else if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const assetType = (type === "audio" || type === "pdf" || type === "video") ? "file" : "image";
      
      const asset = await client.assets.upload(assetType, buffer, {
        filename: file.name || `upload_${Date.now()}.${type === "audio" ? "webm" : type === "pdf" ? "pdf" : type === "video" ? "mp4" : "jpg"}`,
      });

      if (type === "audio") {
        document.contentAudio = {
          _type: "file",
          asset: { _type: "reference", _ref: asset._id },
        };
      } else if (type === "pdf") {
        document.contentPdf = {
          _type: "file",
          asset: { _type: "reference", _ref: asset._id },
        };
      } else if (type === "video") {
        document.contentVideo = {
          _type: "file",
          asset: { _type: "reference", _ref: asset._id },
        };
      } else {
        document.contentImage = {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        };
      }
    } else {
       if (type !== "text") {
           throw new Error("Missing file for media post");
       }
    }

    await client.create(document);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to publish to Sanity", error);
    return { success: false, error: error?.message || "Failed to publish" };
  }
}

export async function deleteAnnouncement(id: string) {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error("Missing Sanity API Token.");
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });

  try {
    await client.delete(id);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/announcements");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete", error);
    return { success: false, error: error?.message || "Failed to delete" };
  }
}

export async function updateAnnouncement(data: FormData) {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) throw new Error("Missing Sanity API Token.");

  const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token });

  const id = data.get("id") as string;
  const title = data.get("title") as string | null;
  const type = data.get("type") as "audio" | "image" | "video" | "text" | "pdf";
  const language = data.get("language") as "urdu" | "english" | "both";
  const textContent = data.get("textContent") as string | null;
  const file = data.get("file") as File | null;

  const assetId = data.get("assetId") as string | null;

  try {
    const patch = client.patch(id);
    
    if (title !== null) {
      patch.set({ title });
    }
    
    if (type === "text" && textContent !== null) {
      patch.set({ contentText: textContent });
    }

    if (assetId) {
       const assetRef = { _type: "reference", _ref: assetId };
       if (type === "audio") patch.set({ contentAudio: { _type: "file", asset: assetRef } });
       else if (type === "pdf") patch.set({ contentPdf: { _type: "file", asset: assetRef } });
       else if (type === "video") patch.set({ contentVideo: { _type: "file", asset: assetRef } });
       else patch.set({ contentImage: { _type: "image", asset: assetRef } });
    } else if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const assetType = (type === "audio" || type === "pdf" || type === "video") ? "file" : "image";
      
      const asset = await client.assets.upload(assetType, buffer, {
        filename: file.name || `update_${Date.now()}.${type === "audio" ? "webm" : type === "pdf" ? "pdf" : "jpg"}`,
      });

      if (type === "audio") {
        patch.set({ contentAudio: { _type: "file", asset: { _type: "reference", _ref: asset._id } } });
      } else if (type === "pdf") {
        patch.set({ contentPdf: { _type: "file", asset: { _type: "reference", _ref: asset._id } } });
      } else if (type === "video") {
        patch.set({ contentVideo: { _type: "file", asset: { _type: "reference", _ref: asset._id } } });
      } else {
        patch.set({ contentImage: { _type: "image", asset: { _type: "reference", _ref: asset._id } } });
      }
    }

    await patch.commit();

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/announcements");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update" };
  }
}

export async function savePrayerTimes(id: string | null, data: any) {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) throw new Error("Missing Sanity API Token.");

  const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token });

  try {
    if (id) {
       await client.patch(id).set(data).commit();
    } else {
       await client.create({ _type: "prayerTimes", title: "Current Prayer Times", ...data });
    }
    revalidatePath("/prayer-times");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to save prayer times" };
  }
}
