import { API_BASE } from "@/lib/auth";
import { adminFetch } from "@/lib/adminFetch";

type AdminLoginResponse = {
  access_token: string;
};

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_BASE}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | AdminLoginResponse
    | null;

  if (!response.ok) {
    throw new Error(
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : "Tài khoản hoặc mật khẩu không chính xác",
    );
  }

  return data as AdminLoginResponse;
}

export async function getAdminMe() {
  const response = await adminFetch("/admin/auth/me");

  if (response.ok) {
    return { status: "authorized" as const, message: "" };
  }

  if (response.status === 401) {
    return {
      status: "unauthorized" as const,
      message: "Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập.",
    };
  }

  if (response.status === 403) {
    return {
      status: "unauthorized" as const,
      message: "Tài khoản của bạn không có quyền truy cập khu vực quản trị.",
    };
  }

  return {
    status: "error" as const,
    message: "Đã xảy ra lỗi trong quá trình xác thực quyền hạn.",
  };
}
