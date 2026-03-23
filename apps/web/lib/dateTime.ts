export function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLocalTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatLocalDateTime(date: Date) {
  return `${formatLocalDate(date)}T${formatLocalTime(date)}`;
}

export function parseDateOnly(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`) : new Date();
}

export function formatShortDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
