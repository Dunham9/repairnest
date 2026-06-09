"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function acceptInvite() {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        alert("Invalid invite link");
        router.push("/");
        return;
      }

      const { data: invite, error: inviteError } = await supabase
        .from("organization_invites")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (inviteError || !invite) {
        alert("Invite not found");
        router.push("/");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { error: memberError } = await supabase
        .from("organization_members")
        .insert([
          {
            user_id: user.id,
            organization_id: invite.organization_id,
            role: invite.role || "member",
          },
        ]);

      if (memberError) {
        alert(memberError.message);
        return;
      }

      await supabase
        .from("organization_invites")
        .update({ accepted: true })
        .eq("id", invite.id);

      router.push("/");
    }

    acceptInvite().finally(() => setLoading(false));
  }, [router]);

  return (
    <div style={{ padding: 40 }}>
      {loading ? "Accepting invite..." : "Invite accepted"}
    </div>
  );
}