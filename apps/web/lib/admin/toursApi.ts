import { adminFetch } from "@/lib/adminFetch";

type ToursListResponse<T> = {
  items?: T[];
};

async function requestAdminTours<T>(
  path: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const response = await adminFetch(path, init);
  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | T
    | null;

  if (!response.ok) {
    throw new Error(
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : fallbackMessage,
    );
  }

  return data as T;
}

export function getAdminTours<T>() {
  return requestAdminTours<ToursListResponse<T>>(
    "/admin/tours",
    { method: "GET" },
    "Không thể tải danh sách tour.",
  );
}

export function getAdminTourDetail<T>(tourId: string | number) {
  return requestAdminTours<{ tour: T }>(
    `/admin/tours/${tourId}`,
    { method: "GET" },
    "Không thể tải thông tin tour.",
  );
}

export function toggleAdminTourStatus(tourId: number) {
  return requestAdminTours(
    `/admin/tours/${tourId}/status`,
    { method: "PATCH" },
    "Không thể cập nhật trạng thái tour.",
  );
}

export function deleteAdminTour(tourId: number) {
  return requestAdminTours(
    `/admin/tours/${tourId}`,
    { method: "DELETE" },
    "Không thể xóa tour.",
  );
}

export function createAdminTour(body: Record<string, unknown>) {
  return requestAdminTours(
    "/admin/tours",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    "Không thể tạo tour.",
  );
}

export function updateAdminTour(
  tourId: string | number,
  body: Record<string, unknown>,
) {
  return requestAdminTours(
    `/admin/tours/${tourId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    "Không thể cập nhật tour.",
  );
}
