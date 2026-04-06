"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InlineNotice from "@/components/common/InlineNotice";
import { registerUser } from "@/lib/authApi";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(formData);
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Đăng ký thất bại",
      );
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
            onChange={(event) =>
              setFormData({ ...formData, full_name: event.target.value })
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
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
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
            onChange={(event) =>
              setFormData({ ...formData, password: event.target.value })
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
