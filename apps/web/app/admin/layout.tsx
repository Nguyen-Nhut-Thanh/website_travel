"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await adminFetch("/admin/auth/me", { method: "GET" });
      if (!res.ok) router.replace("/admin/login");
    })();
  }, [router]);

  async function logout() {
    await adminFetch("/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-2">
        <div className="font-semibold">TRAVEL ADMIN</div>

        <nav className="space-y-1 text-sm">
          <a
            className="block p-2 rounded hover:bg-gray-100"
            href="/admin/tours"
          >
            Tours
          </a>

          <button
            className="w-full text-left block p-2 rounded hover:bg-gray-100"
            onClick={logout}
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="p-6">{children}</main>
    </div>
  );
}
