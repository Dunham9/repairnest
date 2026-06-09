"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import InviteUser from "@/components/InviteUser";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      try {
        // Get session
        const { data: sessionData } = await supabase.auth.getSession();

        console.log("SESSION DATA:", sessionData);

        const session = sessionData.session;

        if (!session) {
          console.log("NO SESSION");
          router.push("/login");
          return;
        }

        const user = session.user;

        console.log("USER:", user);

        setUserId(user.id);

        // Read memberships
        const {
          data: membership,
          error,
          status,
          statusText,
        } = await supabase
          .from("organization_members")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("MEMBERSHIP DATA:", membership);
        console.log("MEMBERSHIP ERROR:", error);
        console.log("MEMBERSHIP STATUS:", status, statusText);

        if (membership?.organization_id) {
          setOrgId(membership.organization_id);
        }
      } catch (err) {
        console.error("PAGE ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Maintenance Dashboard</h1>

      <button onClick={logout}>Logout</button>

      <hr />

      <p>
        <strong>User ID:</strong> {userId || "none"}
      </p>

      <p>
        <strong>ORG ID:</strong> {orgId || "none"}
      </p>

      <hr />

      {orgId ? (
        <>
          <h2>Invite User</h2>
          <InviteUser orgId={orgId} />
        </>
      ) : (
        <div>No organisation found for this user.</div>
      )}
    </div>
  );
}