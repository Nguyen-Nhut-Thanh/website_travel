"use client";

import { usePathname } from "next/navigation";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatWorkspace = pathname.startsWith("/admin/chats");

  if (pathname === "/admin/login") {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">{children}</div>
    );
  }

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-blue-50 font-sans text-slate-900">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminTopbar />

          <main className="admin-content-scroll flex-1 min-h-0">
            <div className={isChatWorkspace ? "h-full w-full" : "mx-auto w-full max-w-[1520px] p-6 md:p-8"}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
