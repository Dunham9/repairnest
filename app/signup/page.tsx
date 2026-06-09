"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------
  // SIGN UP (WITH ONBOARDING)
  // -------------------------
  async function signUp() {
    setLoading(true);

    try {
      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = data.user;

      if (!user) {
        alert("Check email for confirmation link");
        return;
      }

      // 2. Create organization automatically
      const orgName = `${email.split("@")[0]}'s Org`;

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert([
          {
            name: orgName,
          },
        ])
        .select()
        .single();

      if (orgError) {
        console.error(orgError);
        return;
      }

      // 3. Link user to org (ADMIN ROLE)
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert([
          {
            user_id: user.id,
            organization_id: org.id,
            role: "admin",
          },
        ]);

      if (memberError) {
        console.error(memberError);
        return;
      }

      // 4. Redirect to app
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // SIGN IN (simple)
  // -------------------------
  async function signIn() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  }

  return (
    <div style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <button onClick={signIn} disabled={loading}>
        Sign in
      </button>

      <button onClick={signUp} disabled={loading}>
        Sign up
      </button>
    </div>
  );
}