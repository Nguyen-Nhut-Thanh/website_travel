export type TourLike = {
  code?: string | null;
  name?: string | null;
  status: number;
  tour_type?: string | null;
};

export type ScheduleLike = {
  start_date: string;
  quota: number;
  status: number;
  _count?: {
    bookings?: number;
  };
};

export const TOUR_TYPE_OPTIONS = [
  { id: "all", label: "Tất cả" },
  { id: "domestic", label: "Trong nước" },
  { id: "outbound", label: "Nước ngoài" },
  { id: "international", label: "Quốc tế" },
] as const;

export const TOUR_STATUS_OPTIONS = [
  { id: "all", label: "Tất cả trạng thái" },
  { id: "active", label: "Đang hoạt động" },
  { id: "hidden", label: "Đang ẩn" },
] as const;

export function getTourTypeLabel(type: string | null | undefined) {
  if (!type) return "Trong nước";

  switch (type.toLowerCase()) {
    case "domestic":
      return "Trong nước";
    case "outbound":
    case "cross_border":
      return "Nước ngoài";
    case "international":
      return "Quốc tế";
    default:
      return "Trong nước";
  }
}

export function getTourTypeBadgeClass(type: string | null | undefined) {
  if (type === "international") {
    return "bg-purple-50 text-purple-600 border-purple-100";
  }

  if (type === "outbound" || type === "cross_border") {
    return "bg-amber-50 text-amber-600 border-amber-100";
  }

  return "bg-blue-50 text-blue-600 border-blue-100";
}

export function matchesTourSearch(tour: TourLike, searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) return true;

  return (
    tour.name?.toLowerCase().includes(normalizedSearch) ||
    tour.code?.toLowerCase().includes(normalizedSearch)
  );
}

export function matchesTourTypeFilter(tour: TourLike, filterType: string) {
  return filterType === "all" || tour.tour_type === filterType;
}

export function matchesTourStatusFilter(tour: TourLike, filterType: string) {
  return (
    filterType === "all" ||
    (filterType === "active" && tour.status === 1) ||
    (filterType === "hidden" && tour.status === 0)
  );
}

export function getScheduleBookedCount(schedule: ScheduleLike) {
  return schedule._count?.bookings || 0;
}

export function isSchedulePast(schedule: ScheduleLike) {
  return new Date(schedule.start_date) < new Date();
}

export function isScheduleFull(schedule: ScheduleLike) {
  return getScheduleBookedCount(schedule) >= schedule.quota;
}

export function getScheduleUsagePercent(schedule: ScheduleLike) {
  if (!schedule.quota) return 0;
  return (getScheduleBookedCount(schedule) / schedule.quota) * 100;
}

export function getScheduleStatusMeta(
  schedule: ScheduleLike,
  options?: { isParentHidden?: boolean },
) {
  const past = isSchedulePast(schedule);
  const full = isScheduleFull(schedule);
  const isParentHidden = options?.isParentHidden ?? false;

  if (past) return { label: "Đã khởi hành", tone: "muted" as const };
  if (schedule.status === 0) return { label: "Tạm khóa", tone: "warning" as const };
  if (isParentHidden) return { label: "Bị ẩn theo tour gốc", tone: "muted" as const };
  if (full) return { label: "Đã hết chỗ", tone: "warning" as const };
  return { label: "Đang hoạt động", tone: "success" as const };
}

export function matchesScheduleStatusFilter(
  schedule: ScheduleLike,
  filterType: string,
) {
  const past = isSchedulePast(schedule);
  const full = isScheduleFull(schedule);

  if (filterType === "upcoming") return !past && schedule.status === 1;
  if (filterType === "past") return past;
  if (filterType === "full") return full && !past;
  if (filterType === "hidden") return schedule.status === 0;
  return true;
}
