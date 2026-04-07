"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { User, Phone, Camera, Save, Loader2, Fingerprint } from "lucide-react";
import { AccountSectionShell } from "@/components/account/AccountSectionShell";
import FormFieldLabel from "@/components/common/FormFieldLabel";
import InlineNotice from "@/components/common/InlineNotice";
import { updateUserProfile, uploadUserAvatar } from "@/lib/authApi";
import type { UserProfile } from "@/types/account";

export const ProfileForm = ({
  user,
  onUpdate,
}: {
  user: UserProfile | null;
  onUpdate: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    number_id: user?.number_id || "",
    gender: user?.gender || "other",
    avatar_url: user?.avatar_url || "",
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File quá lớn. Vui lòng chọn file dưới 2MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const data = await uploadUserAvatar(file);
      setFormData((current) => ({ ...current, avatar_url: data.url }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Không thể upload ảnh",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await updateUserProfile(formData);
      setSuccess("Cập nhật thông tin thành công.");
      onUpdate();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể cập nhật thông tin",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountSectionShell
      title="Thông tin cá nhân"
      description="Cập nhật thông tin để quy trình đặt chỗ và hỗ trợ được thông suốt hơn."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-6 rounded-[1.5rem] border border-slate-100 bg-[linear-gradient(135deg,#f8fbff,#ffffff)] p-5 sm:flex-row">
          <div className="relative">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.5rem] border-4 border-white bg-slate-950 text-white shadow-md">
              {uploading ? (
                <Loader2 size={32} className="animate-spin text-blue-400" />
              ) : formData.avatar_url ? (
                <Image
                  src={formData.avatar_url}
                  alt="Avatar"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <User size={40} className="text-white/60" />
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-[family:var(--font-display)] text-lg font-semibold text-slate-950">
              Ảnh đại diện
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              {uploading
                ? "Đang tải ảnh lên..."
                : "Hỗ trợ JPG, PNG. Kích thước tối đa 2MB."}
            </p>
          </div>
        </div>

        {success && <InlineNotice tone="success">{success}</InlineNotice>}
        {error && <InlineNotice tone="error">{error}</InlineNotice>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <FormFieldLabel>Họ và tên</FormFieldLabel>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                value={formData.full_name}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                placeholder="Nhập họ tên đầy đủ"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <FormFieldLabel>Số điện thoại</FormFieldLabel>
            <div className="relative">
              <Phone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                placeholder="09xx xxx xxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <FormFieldLabel>Số CCCD / Hộ chiếu</FormFieldLabel>
            <div className="relative">
              <Fingerprint
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                value={formData.number_id}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    number_id: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                placeholder="Nhập số định danh"
              />
            </div>
          </div>

          <div className="space-y-2">
            <FormFieldLabel>Giới tính</FormFieldLabel>
            <select
              value={formData.gender}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  gender: event.target.value,
                }))
              }
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-3 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </AccountSectionShell>
  );
};
