"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { getAdminMe } from "@/lib/admin/adminAuthApi";

type GuardStatus = "loading" | "authorized" | "unauthorized" | "error";

type GuardCache = {
  status: GuardStatus;
  message: string;
};

const AUTH_STATUS_KEY = "admin_auth_status";
const AUTH_MESSAGE_KEY = "admin_auth_message";

function readCachedAuth(): GuardCache {
  const cachedStatus = window.sessionStorage.getItem(
    AUTH_STATUS_KEY,
  ) as GuardStatus | null;
  const cachedMessage = window.sessionStorage.getItem(AUTH_MESSAGE_KEY) || "";

  if (cachedStatus === "authorized") {
    return { status: "authorized", message: "" };
  }

  return { status: "loading", message: cachedMessage };
}

function writeCachedAuth(status: GuardStatus, message = "") {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(AUTH_STATUS_KEY, status);
    window.sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
  }
}

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<GuardCache>({
    status: "loading",
    message: "",
  });

  useEffect(() => {
    let active = true;

    const check = async () => {
      const cached = readCachedAuth();
      if (active && cached.status === "authorized") {
        setAuthState(cached);
      }

      const result = await getAdminMe();
      if (!active) return;

      writeCachedAuth(result.status, result.message);
      setAuthState(result);
    };

    void check();

    return () => {
      active = false;
    };
  }, []);

  if (authState.status === "loading") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
        <div className="animate-pulse text-sm font-black uppercase tracking-widest text-white">
          Đang kiểm tra bảo mật...
        </div>
      </div>
    );
  }

  if (authState.status === "unauthorized" || authState.status === "error") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
        <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10">
            <ShieldAlert className="h-10 w-10 text-rose-500" />
          </div>
          <h2 className="mb-3 text-2xl font-black text-white">
            Truy cập bị chặn
          </h2>
          <p className="mb-8 leading-relaxed text-slate-400">
            {authState.message}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-700"
            >
              <Home size={18} /> Trang chủ
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
            >
              <LogIn size={18} /> Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
