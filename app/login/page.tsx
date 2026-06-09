"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!email.trim() || !password.trim()) {
      alert("Email and password required");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    setLoading(false);

    if (error) {
      console.error("LOGIN ERROR:", error);
      alert(error.message);
      return;
    }

    console.log("LOGIN SUCCESS:", data);

    router.push("/");
    router.refresh();
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        fontFamily: "Arial",
      }}
    >
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 10,
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
        }}
      />

      <button
        onClick={signIn}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
        }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </div>
  );
}