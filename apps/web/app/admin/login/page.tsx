"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@travel.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/admin/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      },
    );

    if (!res.ok) {
      setError("Login failed");
      return;
    }

    router.push("/admin/tours");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md border rounded-lg p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">Admin Login</h1>

        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            className="w-full border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            className="w-full border rounded p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full bg-black text-white rounded p-2">
          Login
        </button>
      </form>
    </div>
  );
}
