import { adminFetch } from "@/lib/adminFetch";
import type { StaffFormData, UserItem } from "@/lib/admin/users";

async function requestAdminUsers<T>(
  path: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const response = await adminFetch(path, init);
  const data = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | T
    | null;

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      data.message
        ? Array.isArray(data.message)
          ? data.message[0]
          : data.message
        : fallbackMessage;

    throw new Error(message);
  }

  return data as T;
}

export function getAdminUsers() {
  return requestAdminUsers<UserItem[]>(
    "/admin/users",
    { method: "GET" },
    "Không thể tải danh sách người dùng.",
  );
}

export function updateAdminUserStatus(userId: number, status: number) {
  return requestAdminUsers(
    `/admin/users/${userId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    "Không thể cập nhật trạng thái tài khoản.",
  );
}

export function createAdminStaff(body: StaffFormData) {
  return requestAdminUsers(
    "/admin/users/staff",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    "Không thể tạo tài khoản nhân viên.",
  );
}
