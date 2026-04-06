import { adminFetch } from "@/lib/adminFetch";

async function requestAdminCatalog<T>(
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

type ListPayload<T> = {
  items?: T[];
};

export function getAdminHotels<T>() {
  return requestAdminCatalog<T[]>(
    "/admin/catalogs/hotels",
    { method: "GET" },
    "Không thể tải danh sách khách sạn.",
  );
}

export function getAdminCatalogTransports<T>() {
  return requestAdminCatalog<T[]>(
    "/admin/catalogs/transports",
    { method: "GET" },
    "Không thể tải danh sách phương tiện.",
  );
}

export function getHotelRoomTypes<T>(hotelId: number) {
  return requestAdminCatalog<T[]>(
    `/admin/catalogs/hotels/${hotelId}/room-types`,
    { method: "GET" },
    "Không thể tải loại phòng.",
  );
}

export function getAdminTransports<T>() {
  return requestAdminCatalog<ListPayload<T>>(
    "/admin/transports",
    { method: "GET" },
    "Không thể tải danh sách phương tiện.",
  );
}
