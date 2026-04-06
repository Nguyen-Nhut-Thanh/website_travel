import { adminFetch } from "@/lib/adminFetch";

type LocationListPayload<T> = {
  items?: T[];
};

async function requestAdminLocations<T>(
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

export function getAdminLocations<T>() {
  return requestAdminLocations<LocationListPayload<T>>(
    "/admin/locations",
    { method: "GET" },
    "Không thể tải danh sách địa điểm.",
  );
}

export function getAdminLocationLevels<T>() {
  return requestAdminLocations<T[]>(
    "/admin/locations/levels",
    { method: "GET" },
    "Không thể tải danh sách cấp độ.",
  );
}

export function getAdminLocationDetail<T>(locationId: string | number) {
  return requestAdminLocations<T>(
    `/admin/locations/${locationId}`,
    { method: "GET" },
    "Không thể tải thông tin địa điểm.",
  );
}

export function deleteAdminLocation(locationId: number) {
  return requestAdminLocations(
    `/admin/locations/${locationId}`,
    { method: "DELETE" },
    "Không thể xóa địa điểm.",
  );
}

export function updateAdminLocation(
  locationId: number,
  body: Record<string, unknown>,
) {
  return requestAdminLocations(
    `/admin/locations/${locationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    "Không thể cập nhật địa điểm.",
  );
}

export function saveAdminLocation(
  locationId: string | number | null,
  body: Record<string, unknown>,
) {
  return requestAdminLocations(
    locationId ? `/admin/locations/${locationId}` : "/admin/locations",
    {
      method: locationId ? "PATCH" : "POST",
      body: JSON.stringify(body),
    },
    "Không thể lưu địa điểm.",
  );
}
