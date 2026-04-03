"use client";

import { Loader2, Save, X } from "lucide-react";
import type { StaffFormData } from "@/lib/admin/users";

type Props = {
  open: boolean;
  saving: boolean;
  formData: StaffFormData;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onFormChange: (updater: (prev: StaffFormData) => StaffFormData) => void;
};

export function CreateStaffModal({
  open,
  saving,
  formData,
  onClose,
  onSubmit,
  onFormChange,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg animate-in zoom-in fade-in overflow-hidden rounded-2xl bg-white shadow-xl duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900">Thêm nhân viên mới</h3>
          <button onClick={onClose} className="text-slate-400 transition-colors hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Họ và tên</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nguyễn Văn A"
                value={formData.full_name}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, full_name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="staff@example.com"
                value={formData.email}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Mật khẩu</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
                value={formData.password}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, password: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Số điện thoại</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="09xx xxx xxx"
                value={formData.phone}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Vị trí</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Ví dụ: Nhân viên điều hành"
                value={formData.position}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, position: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-500">Mã nhân viên</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Ví dụ: NV001"
                value={formData.employee_code}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, employee_code: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Tạo tài khoản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
