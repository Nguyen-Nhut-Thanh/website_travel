"use client";

import React, { useState } from "react";
import { Lock, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { AccountSectionShell } from "@/components/account/AccountSectionShell";
import FormFieldLabel from "@/components/common/FormFieldLabel";
import InlineNotice from "@/components/common/InlineNotice";
import { changeUserPassword } from "@/lib/authApi";
import type { UserProfile } from "@/types/account";

export const PasswordForm = ({ user }: { user: UserProfile | null }) => {
  const hasPassword = user?.accounts?.hasPassword;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    try {
      await changeUserPassword({
        oldPassword: hasPassword ? formData.oldPassword : undefined,
        newPassword: formData.newPassword,
      });

      setSuccess(
        hasPassword
          ? "Đổi mật khẩu thành công."
          : "Thiết lập mật khẩu thành công.",
      );
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => window.location.reload(), 2000);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể cập nhật mật khẩu",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountSectionShell
      title={hasPassword ? "Đổi mật khẩu" : "Thiết lập mật khẩu"}
      description={
        hasPassword
          ? "Sử dụng mật khẩu mạnh để bảo vệ tài khoản của bạn."
          : "Tạo mật khẩu để có thể đăng nhập bằng email thay vì chỉ dùng Google."
      }
      contentClassName="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {success && <InlineNotice tone="success">{success}</InlineNotice>}
        {error && <InlineNotice tone="error">{error}</InlineNotice>}

        {hasPassword && (
          <div className="space-y-2">
            <FormFieldLabel>Mật khẩu hiện tại</FormFieldLabel>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type={showPass ? "text" : "password"}
                value={formData.oldPassword}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    oldPassword: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                placeholder="........"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <FormFieldLabel>{hasPassword ? "Mật khẩu mới" : "Nhập mật khẩu"}</FormFieldLabel>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
            <input
              type={showPass ? "text" : "password"}
              value={formData.newPassword}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="........"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormFieldLabel>Xác nhận mật khẩu mới</FormFieldLabel>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
            <input
              type={showPass ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
              placeholder="........"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-3 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {hasPassword ? "Đổi mật khẩu" : "Lưu mật khẩu"}
          </button>
        </div>
      </form>
    </AccountSectionShell>
  );
};
