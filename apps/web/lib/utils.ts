/**
 * Định dạng số thành chuỗi phân cách hàng nghìn, dùng cho ô nhập liệu.
 * Ví dụ: 1000000 -> 1.000.000
 */
export const formatCurrencyInput = (val: number | string) => {
  if (val === undefined || val === null || val === "" || val === 0) return "";
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Chuyển chuỗi định dạng tiền tệ về số nguyên thuần túy.
 * Ví dụ: "1.000.000" -> 1000000
 */
export const parseCurrencyInput = (val: string) => {
  const cleanValue = val.replace(/\D/g, "");
  return cleanValue === "" ? 0 : Number(cleanValue);
};

export function normalizeImageSrc(src?: string | null) {
  if (!src || !src.trim()) {
    return null;
  }

  const value = src.trim();

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

/**
 * Định dạng tiền tệ VND.
 * Ví dụ: 1000000 -> 1.000.000 đ
 */
export function formatVND(value?: number | string | null) {
  if (value == null || value === "") return "Liên hệ";
  const num = Number(value);
  if (isNaN(num)) return "Liên hệ";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num).replace("₫", "đ");
}

/**
 * Định dạng ngày tháng kiểu Việt Nam (dd/mm/yyyy).
 */
export function formatDate(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Xóa dấu tiếng Việt để phục vụ tìm kiếm hoặc tạo slug.
 */
export function stripVietnamese(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toLowerCase();
}

/**
 * Tạo slug từ chuỗi. Ví dụ: Hà Nội -> ha-noi
 */
export function slugify(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ảnh placeholder mặc định.
 */
export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";

export function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = `${today.getMonth() + 1}`.padStart(2, "0");
  const dd = `${today.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
