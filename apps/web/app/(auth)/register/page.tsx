"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/auth";
import InlineNotice from "@/components/common/InlineNotice";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      setError(getErrorMessage(error, "Đăng ký thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900">
          Đăng ký tài khoản
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Trở thành thành viên của Travol
        </p>
      </div>

      {error && (
        <InlineNotice tone="error" className="px-4 py-3">
          {error}
        </InlineNotice>
      )}

      <form className="space-y-4" onSubmit={handleRegister}>
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            Họ và tên
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Nguyễn Văn A"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            Mật khẩu
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Ít nhất 6 ký tự"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng ký ngay"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Bạn đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
