"use client";

import React, { useState } from "react";
import { MapPin, Save, Loader2 } from "lucide-react";
import { API_BASE, getToken } from "@/lib/auth";
import FormFieldLabel from "@/components/common/FormFieldLabel";
import InlineNotice from "@/components/common/InlineNotice";
import type { UserProfile } from "@/types/account";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const AddressForm = ({
  user,
  onUpdate,
}: {
  user: UserProfile | null;
  onUpdate: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState(user?.address || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ address }),
      });

      if (!res.ok) throw new Error("Không thể cập nhật địa chỉ");

      setSuccess("Cập nhật địa chỉ thành công.");
      onUpdate();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Không thể cập nhật địa chỉ"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.05)] backdrop-blur">
      <div className="mb-8">
        <h2 className="font-[family:var(--font-display)] text-2xl font-semibold text-slate-950">
          Thông tin liên hệ
        </h2>
        <p className="mt-1 text-slate-500">
          Địa chỉ của bạn sẽ được dùng cho các khâu gửi vé và hỗ trợ khi cần.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {success && <InlineNotice tone="success">{success}</InlineNotice>}
        {error && <InlineNotice tone="error">{error}</InlineNotice>}

        <div className="space-y-2">
          <FormFieldLabel>Địa chỉ chi tiết</FormFieldLabel>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="Nhập địa chỉ nhận vé hoặc địa chỉ cư trú của bạn"
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-3 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Cập nhật địa chỉ
          </button>
        </div>
      </form>
    </div>
  );
};
