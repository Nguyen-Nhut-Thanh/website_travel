"use client";

import {
  BadgeCheck,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Users,
} from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import type { UserItem } from "@/lib/admin/users";

type Props = {
  users: UserItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onToggleStatus: (user: UserItem) => void;
  onPageChange: (page: number) => void;
};

export function UsersTable({
  users,
  loading,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onToggleStatus,
  onPageChange,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-bold">Người dùng</th>
              <th className="px-6 py-4 font-bold">Liên hệ</th>
              <th className="px-6 py-4 font-bold">Vai trò</th>
              <th className="px-6 py-4 font-bold">Đăng nhập cuối</th>
              <th className="px-6 py-4 text-center font-bold">Trạng thái</th>
              <th className="px-6 py-4 text-right font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="font-medium text-slate-500">Đang tải dữ liệu...</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <p className="font-medium italic text-slate-400">
                    Không tìm thấy người dùng phù hợp
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.user_id}
                  className="group transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Users size={20} />
                        )}
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 font-bold text-slate-900">
                          {user.full_name}
                          {user.is_staff && <BadgeCheck size={14} className="text-blue-500" />}
                        </p>
                        <p className="text-[11px] text-slate-500">ID: #{user.user_id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {user.accounts?.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {user.is_staff ? (
                      <span className="whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                        Nhân viên
                      </span>
                    ) : (
                      <span className="whitespace-nowrap rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        Người dùng
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {user.accounts?.last_login_at
                      ? new Date(user.accounts.last_login_at).toLocaleDateString("vi-VN")
                      : "---"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {user.accounts?.status === 1 ? (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                          <ShieldCheck size={12} /> Hoạt động
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
                          <ShieldAlert size={12} /> Bị khóa
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => onToggleStatus(user)}
                        title={
                          user.accounts?.status === 1
                            ? "Khóa tài khoản"
                            : "Mở khóa tài khoản"
                        }
                        className={`rounded-lg p-2 transition-colors ${
                          user.accounts?.status === 1
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        {user.accounts?.status === 1 ? (
                          <Lock size={16} />
                        ) : (
                          <Unlock size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && users.length > 0 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          itemLabel="người dùng"
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
