"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InviteUser({ orgId }: { orgId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendInvite() {
    if (!orgId) {
      alert("Missing organisation ID");
      return;
    }

    if (!email.trim()) {
      alert("Email is required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("organization_invites").insert([
      {
        email: email.trim().toLowerCase(),
        organization_id: orgId,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Invite error:", error);
      alert(error.message);
      return;
    }

    alert("Invite sent!");
    setEmail("");
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", marginTop: 20 }}>
      <h3>Invite User</h3>

      <input
        type="email"
        placeholder="email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          display: "block",
          padding: 8,
          marginBottom: 10,
          width: "100%",
        }}
      />

      <button onClick={sendInvite} disabled={loading}>
        {loading ? "Sending..." : "Send Invite"}
      </button>
    </div>
  );
}