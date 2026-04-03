"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/auth";
import InlineNotice from "@/components/common/InlineNotice";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function VerifyContent() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Xác thực thành công! Đang chuyển hướng đến trang đăng nhập...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setError(getErrorMessage(error, "Xác thực thất bại"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("Mã xác thực mới đã được gửi!");
    } catch (error) {
      setError(getErrorMessage(error, "Không thể gửi lại mã"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Xác thực Email</h2>
        <p className="mt-1 text-sm text-slate-500">
          Chúng tôi đã gửi mã xác thực đến <b>{email}</b>. Vui lòng kiểm tra hộp thư đến
          (hoặc spam).
        </p>
      </div>

      {error && (
        <InlineNotice tone="error" className="px-4 py-3">
          {error}
        </InlineNotice>
      )}

      {success && (
        <InlineNotice tone="success" className="px-4 py-3">
          {success}
        </InlineNotice>
      )}

      <form className="space-y-4" onSubmit={handleVerify}>
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">Mã xác thực (6 số)</label>
          <input
            type="text"
            maxLength={6}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Đang kiểm tra..." : "Xác nhận"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Không nhận được mã?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="font-bold text-blue-600 hover:underline disabled:opacity-50"
        >
          Gửi lại mã
        </button>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
