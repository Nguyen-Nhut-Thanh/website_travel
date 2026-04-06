import { adminFetch } from "@/lib/adminFetch";
import type {
  FlashDealForm,
  FlashDealSchedule,
} from "@/lib/admin/flashDeals";
import type { Voucher, VoucherForm } from "@/lib/admin/vouchers";

async function requestAdminJson<T>(
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

export function getAdminVouchers() {
  return requestAdminJson<Voucher[]>(
    "/admin/marketing/vouchers",
    { method: "GET" },
    "Không thể tải danh sách voucher.",
  );
}

export function createAdminVoucher(payload: VoucherForm | Record<string, unknown>) {
  return requestAdminJson(
    "/admin/marketing/vouchers",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Không thể lưu voucher.",
  );
}

export function deleteAdminVoucher(voucherId: number) {
  return requestAdminJson(
    `/admin/marketing/vouchers/${voucherId}`,
    { method: "DELETE" },
    "Không thể xóa voucher.",
  );
}

export function getAdminFlashDeals() {
  return requestAdminJson<FlashDealSchedule[]>(
    "/admin/marketing/flash-deals",
    { method: "GET" },
    "Không thể tải danh sách lịch trình.",
  );
}

export function saveAdminFlashDeal(
  path: string,
  method: "POST" | "PATCH",
  payload: FlashDealForm | Record<string, unknown>,
) {
  return requestAdminJson(
    path,
    {
      method,
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật flash deal.",
  );
}
