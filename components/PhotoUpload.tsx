"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PhotoUpload({
  issueId,
  refreshPhotos,
}: {
  issueId: string;
  refreshPhotos: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  async function uploadPhoto(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    setUploading(true);

    const fileName = `${issueId}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("issue-photos")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("issue-photos")
      .getPublicUrl(fileName);

    const { error } = await supabase.from("issue_photos").insert([
      {
        issue_id: issueId,
        photo_url: publicUrl,
      },
    ]);

    setUploading(false);

    if (error) {
      alert(error.message);
      return;
    }

    await refreshPhotos();
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={uploadPhoto}
        disabled={uploading}
      />
    </div>
  );
}