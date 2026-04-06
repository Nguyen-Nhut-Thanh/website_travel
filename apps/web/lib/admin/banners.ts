import { adminFetch } from "@/lib/adminFetch";
import { API_BASE, getToken } from "@/lib/auth";
import type { Banner } from "@/types/banner";

export type AdminBannerPayload = {
  location_name: string;
  header: string;
  description: string;
  image_url: string;
  link_to: string;
  status: number;
};

async function parseJsonResponse<T>(response: Response) {
  return (await response.json()) as T;
}

export async function fetchAdminBanners() {
  const response = await adminFetch("/banners/admin");
  if (!response.ok) {
    throw new Error("Không thể tải danh sách banner");
  }

  return parseJsonResponse<Banner[]>(response);
}

export async function fetchAdminBannerDetail(bannerId: string | number) {
  const response = await adminFetch(`/banners/admin/${bannerId}`);
  if (!response.ok) {
    throw new Error("Không thể tải thông tin banner");
  }

  return parseJsonResponse<Banner>(response);
}

export async function saveAdminBanner(
  payload: AdminBannerPayload,
  bannerId?: string | number,
) {
  const response = await adminFetch(
    bannerId ? `/banners/admin/${bannerId}` : "/banners/admin",
    {
      method: bannerId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Không thể lưu banner");
  }

  return response;
}

export async function deleteAdminBanner(bannerId: string | number) {
  const response = await adminFetch(`/banners/admin/${bannerId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Không thể xóa banner");
  }
}

export async function uploadAdminBannerImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/banners/admin/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Không thể upload ảnh banner");
  }

  return parseJsonResponse<{ url: string }>(response);
}
