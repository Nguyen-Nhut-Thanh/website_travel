import { API_BASE, getToken } from "@/lib/auth";
import type { RecommendationProfile } from "@/types/account";
import type {
  AccountBooking,
  AccountStats,
  FavoriteTourItem,
} from "@/types/account";

type LoginResponse = {
  access_token: string;
};

type UploadResponse = {
  url: string;
};

type JsonInit = Omit<RequestInit, "body"> & {
  body?: unknown;
  requireAuth?: boolean;
  fallbackMessage: string;
};

function buildHeaders(
  headers: HeadersInit | undefined,
  requireAuth: boolean,
  hasJsonBody: boolean,
) {
  const nextHeaders = new Headers(headers);

  if (hasJsonBody && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (requireAuth) {
    nextHeaders.set("Authorization", `Bearer ${getToken() || ""}`);
  }

  return nextHeaders;
}

async function requestJson<T>(path: string, init: JsonInit): Promise<T> {
  const { requireAuth = false, fallbackMessage, body, headers, ...rest } = init;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: buildHeaders(headers, requireAuth, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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

export function loginUser(email: string, password: string) {
  return requestJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    fallbackMessage: "Đăng nhập thất bại",
  });
}

export function loginWithGoogle(token: string | undefined) {
  return requestJson<LoginResponse>("/auth/google", {
    method: "POST",
    body: { token },
    fallbackMessage: "Đăng nhập Google thất bại",
  });
}

export function registerUser(payload: {
  email: string;
  password: string;
  full_name: string;
}) {
  return requestJson("/auth/register", {
    method: "POST",
    body: payload,
    fallbackMessage: "Đăng ký thất bại",
  });
}

export function verifyEmailCode(email: string | null, code: string) {
  return requestJson("/auth/verify-email", {
    method: "POST",
    body: { email, code },
    fallbackMessage: "Xác thực thất bại",
  });
}

export function resendVerificationCode(email: string) {
  return requestJson("/auth/resend-verification", {
    method: "POST",
    body: { email },
    fallbackMessage: "Không thể gửi lại mã",
  });
}

export function updateUserProfile(body: Record<string, unknown>) {
  return requestJson("/auth/update-profile", {
    method: "POST",
    body,
    requireAuth: true,
    fallbackMessage: "Không thể cập nhật thông tin",
  });
}

export function changeUserPassword(body: {
  oldPassword?: string;
  newPassword: string;
}) {
  return requestJson("/auth/change-password", {
    method: "POST",
    body,
    requireAuth: true,
    fallbackMessage: "Không thể cập nhật mật khẩu",
  });
}

export function updateRecommendationProfile(body: RecommendationProfile) {
  return requestJson("/recommendation-profile/me", {
    method: "PUT",
    body,
    requireAuth: true,
    fallbackMessage: "Không thể lưu sở thích.",
  });
}

export function getRecommendationProfile() {
  return requestJson<RecommendationProfile>("/recommendation-profile/me", {
    method: "GET",
    requireAuth: true,
    fallbackMessage: "Không thể tải sở thích.",
  });
}

export function getAccountStats() {
  return requestJson<AccountStats>("/bookings/stats", {
    method: "GET",
    requireAuth: true,
    fallbackMessage: "Không thể tải thống kê tài khoản.",
  });
}

export function getMyBookings() {
  return requestJson<AccountBooking[]>("/bookings/my", {
    method: "GET",
    requireAuth: true,
    fallbackMessage: "Không thể tải danh sách booking.",
  });
}

export function getMyFavoriteTours() {
  return requestJson<FavoriteTourItem[]>("/favorites/my", {
    method: "GET",
    requireAuth: true,
    fallbackMessage: "Không thể tải danh sách yêu thích.",
  });
}

export function getFavoriteIds() {
  return requestJson<{ items?: number[] }>("/favorites/ids", {
    method: "GET",
    requireAuth: true,
    fallbackMessage: "Không thể tải danh sách yêu thích.",
  });
}

export function addFavoriteTour(tourId: number) {
  return requestJson(`/favorites/${tourId}`, {
    method: "POST",
    requireAuth: true,
    fallbackMessage: "Không thể cập nhật danh sách yêu thích.",
  });
}

export function removeFavoriteTour(tourId: number) {
  return requestJson(`/favorites/${tourId}`, {
    method: "DELETE",
    requireAuth: true,
    fallbackMessage: "Không thể cập nhật danh sách yêu thích.",
  });
}

export async function uploadUserAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/auth/upload-avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
    },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string; url?: string }
    | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.message || "Không thể upload ảnh");
  }

  return data as UploadResponse;
}
