"use client";

import { useState } from "react";
import { AlertCircle, Compass, Loader2, Lock, Mail } from "lucide-react";
import { API_BASE, setToken } from "@/lib/auth";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tài khoản hoặc mật khẩu không chính xác");
      }

      setToken(data.access_token);
      window.location.href = "/admin";
    } catch (error) {
      setError(getErrorMessage(error, "Đăng nhập thất bại"));
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-md animate-in zoom-in fade-in duration-500">
        <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/50">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/40">
              <Compass className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">
              Travol<span className="text-blue-500">.</span>Admin
            </h1>
            <p className="mt-2 text-sm text-slate-400">Hệ thống quản trị du lịch cao cấp</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
              <AlertCircle size={18} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                Email quản trị
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-3.5 pl-12 pr-4 font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-3.5 pl-12 pr-4 font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-blue-500 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Đăng nhập hệ thống"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
