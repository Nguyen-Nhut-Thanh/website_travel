"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { CreateStaffModal } from "@/components/admin/users/CreateStaffModal";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { useToast } from "@/components/common/Toast";
import { adminFetch } from "@/lib/adminFetch";
import { confirmAction } from "@/lib/admin/confirm";
import {
  createDefaultStaffForm,
  matchesUserSearch,
  StaffFormData,
  UserItem,
} from "@/lib/admin/users";

export default function AdminUsersPage() {
  const pageSize = 10;
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>(createDefaultStaffForm);
  const { success, error: showError } = useToast();

  const loadUsers = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setLoading(true);
      }

      try {
        const response = await adminFetch("/admin/users");

        if (response.ok) {
          setUsers(await response.json());
        }
      } catch {
        showError("Lỗi tải danh sách người dùng");
      } finally {
        if (isInitial) {
          setLoading(false);
        }
      }
    },
    [showError],
  );

  useEffect(() => {
    void loadUsers(true);
  }, [loadUsers]);

  const handleToggleStatus = async (user: UserItem) => {
    const currentStatus = user.accounts?.status;
    const newStatus = currentStatus === 1 ? 0 : 1;
    const oldUsers = [...users];

    setUsers((current) =>
      current.map((item) =>
        item.user_id === user.user_id
          ? { ...item, accounts: { ...item.accounts, status: newStatus } }
          : item,
      ),
    );

    try {
      const response = await adminFetch(`/admin/users/${user.user_id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        success(newStatus === 1 ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
      } else {
        setUsers(oldUsers);
        showError("Lỗi khi cập nhật trạng thái");
      }
    } catch {
      setUsers(oldUsers);
      showError("Lỗi kết nối");
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirmAction("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        success("Đã xóa người dùng thành công");
        setUsers((current) => current.filter((user) => user.user_id !== userId));
        return;
      }

      const data = await response.json();
      showError(data.message || "Lỗi khi xóa người dùng");
    } catch {
      showError("Lỗi kết nối");
    }
  };

  const handleCreateStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await adminFetch("/admin/users/staff", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        success("Tạo tài khoản nhân viên thành công");
        setIsModalOpen(false);
        setFormData(createDefaultStaffForm());
        void loadUsers();
      } else {
        const message = Array.isArray(data.message) ? data.message[0] : data.message;
        showError(message || "Lỗi khi tạo tài khoản");
      }
    } catch {
      showError("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => matchesUserSearch(user, search));
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Người dùng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý tài khoản khách hàng và nhân viên hệ thống.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <UserPlus size={18} />
          Thêm nhân viên
        </button>
      </div>

      <AdminSearchInput
        value={search}
        onChange={setSearch}
        placeholder="Tìm theo tên hoặc email..."
        roundedClassName="rounded-lg"
      />

      <UsersTable
        users={paginatedUsers}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        pageSize={pageSize}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        onPageChange={setCurrentPage}
      />

      <CreateStaffModal
        open={isModalOpen}
        saving={saving}
        formData={formData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStaff}
        onFormChange={setFormData}
      />
    </div>
  );
}
