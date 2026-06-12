"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function QuoteUpload({
  issueId,
  contractorId,
  refreshAll,
}: {
  issueId: string;
  contractorId: string | null;
  refreshAll: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  async function uploadQuote(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setUploading(true);

    const fileName = `${issueId}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("quote-documents")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("quote-documents").getPublicUrl(fileName);

    const { error: quoteError } = await supabase.from("quote_documents").insert([
      {
        issue_id: issueId,
        contractor_id: contractorId,
        document_url: publicUrl,
      },
    ]);

    if (quoteError) {
      alert(quoteError.message);
      setUploading(false);
      return;
    }

    const { error: issueError } = await supabase
      .from("issues")
      .update({
        workflow_status: "quote_submitted",
        quote_submitted: true,
      })
      .eq("id", issueId);

    setUploading(false);

    if (issueError) {
      alert(issueError.message);
      return;
    }

    await refreshAll();
  }

  return (
    <div style={{ marginTop: 8 }}>
      <input
        type="file"
        accept=".pdf,image/*"
        disabled={uploading}
        onChange={uploadQuote}
      />

      {uploading && <p>Uploading quote...</p>}
    </div>
  );
}