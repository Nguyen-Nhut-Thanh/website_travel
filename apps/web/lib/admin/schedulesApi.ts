import { adminFetch } from "@/lib/adminFetch";

async function requestAdminSchedules<T>(
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

export function getTourSchedules<T>(tourId: number) {
  return requestAdminSchedules<T[]>(
    `/admin/tours/${tourId}/schedules`,
    { method: "GET" },
    "Không thể tải lịch trình.",
  );
}

export function createTourSchedule(
  tourId: number,
  body: Record<string, unknown>,
) {
  return requestAdminSchedules(
    `/admin/tours/${tourId}/schedules`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    "Không thể tạo lịch trình.",
  );
}

export function deleteTourSchedule(scheduleId: number) {
  return requestAdminSchedules(
    `/admin/tours/schedules/${scheduleId}/delete`,
    { method: "POST" },
    "Không thể xóa lịch trình.",
  );
}

export function getAdminScheduleDetail<T>(scheduleId: string | number) {
  return requestAdminSchedules<T>(
    `/admin/tours/schedules/${scheduleId}`,
    { method: "GET" },
    "Không thể tải chi tiết lịch khởi hành.",
  );
}

export function saveAdminSchedule(
  path: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
) {
  return requestAdminSchedules(
    path,
    {
      method,
      body: JSON.stringify(body),
    },
    "Không thể lưu lịch khởi hành.",
  );
}

export function deleteAdminSchedule(scheduleId: number) {
  return requestAdminSchedules(
    `/admin/tours/schedules/${scheduleId}`,
    { method: "DELETE" },
    "Không thể xóa lịch khởi hành.",
  );
}

export function updateAdminScheduleStatus(scheduleId: number, status: number) {
  return requestAdminSchedules(
    `/admin/tours/schedules/${scheduleId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    "Không thể cập nhật trạng thái lịch khởi hành.",
  );
}
