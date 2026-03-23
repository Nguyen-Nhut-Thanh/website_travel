"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  DollarSign,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import InlineNotice from "@/components/common/InlineNotice";
import { useToast } from "@/components/common/Toast";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { ScheduleStartFields } from "@/components/admin/schedule-shared/ScheduleStartFields";
import { adminFetch } from "@/lib/adminFetch";
import { confirmAction } from "@/lib/admin/confirm";
import { formatVND } from "@/lib/utils";
import { PriceInput } from "./PriceInput";

interface Schedule {
  tour_schedule_id: number;
  start_date: string;
  end_date: string;
  price: number;
  quota: number;
  status: number;
  _count?: {
    bookings?: number;
  };
}

function getBookedCount(schedule: Schedule) {
  return schedule._count?.bookings || 0;
}

function isActiveSchedule(schedule: Schedule) {
  return schedule.status === 1 && new Date(schedule.start_date).getTime() >= Date.now();
}

function getUsagePercent(schedule: Schedule) {
  if (!schedule.quota) {
    return 0;
  }

  return Math.min(100, Math.round((getBookedCount(schedule) / schedule.quota) * 100));
}

export const ScheduleManagement = ({
  tourId,
  durationDays = 1,
}: {
  tourId: number;
  durationDays?: number;
}) => {
  const pageSize = 10;
  const { success, error: showError } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    price: 0,
    quota: 20,
  });

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch(`/admin/tours/${tourId}/schedules`);
      if (response.ok) {
        setSchedules(await response.json());
      }
    } catch (fetchError) {
      console.error("Schedule load failed:", fetchError);
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  const filteredSchedules = useMemo(
    () => schedules.filter(isActiveSchedule),
    [schedules],
  );

  const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / pageSize));
  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredSchedules.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleStartDateChange = (dateStr: string) => {
    if (!dateStr) return;

    const startDate = new Date(dateStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (durationDays > 0 ? durationDays - 1 : 0));

    setForm((prev) => ({
      ...prev,
      start_date: dateStr,
      end_date: endDate.toISOString().split("T")[0],
    }));
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await adminFetch(`/admin/tours/${tourId}/schedules`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setIsCreating(false);
        setForm({ start_date: "", end_date: "", price: 0, quota: 20 });
        void loadSchedules();
        return;
      }

      const errorData = await response
        .json()
        .catch(() => ({ message: "Lỗi không xác định" }));
      setError(errorData.message || "Không thể tạo lịch trình");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể tạo lịch trình");
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirmAction("Bạn có chắc chắn muốn xóa lịch trình này?")) {
      return;
    }

    try {
      const response = await adminFetch(`/admin/tours/schedules/${scheduleId}/delete`, {
        method: "POST",
      });

      if (response.ok) {
        success("Đã xóa lịch trình thành công");
        setSchedules((current) =>
          current.filter((schedule) => schedule.tour_schedule_id !== scheduleId),
        );
        return;
      }

      const message = await response.json();
      showError(message.message || "Không thể xóa");
    } catch {
      showError("Lỗi kết nối");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <CalendarDays className="text-blue-600" size={20} />
          Lịch khởi hành
        </h3>
        <button
          onClick={() => setIsCreating((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-all hover:bg-blue-100"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? "Hủy bỏ" : "Thêm lịch mới"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="animate-in slide-in-from-top-2 rounded-2xl border border-slate-200 bg-slate-50 p-6 fade-in duration-300"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-1.5">
              <ScheduleStartFields
                dateValue={form.start_date}
                minDate={new Date().toISOString().split("T")[0]}
                dateLabel="Ngày khởi hành"
                onDateChange={handleStartDateChange}
              />
              {form.end_date && (
                <p className="ml-1 text-[10px] font-bold italic text-slate-400">
                  Ngày về: {new Date(form.end_date).toLocaleDateString("vi-VN")} ({durationDays} ngày)
                </p>
              )}
            </div>

            <div>
              <PriceInput
                label="Giá tour"
                value={form.price}
                onChange={(value) => setForm((prev) => ({ ...prev, price: value }))}
                placeholder="Ví dụ: 1.000.000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Tổng số chỗ
              </label>
              <input
                type="number"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                value={form.quota === 0 ? "" : form.quota}
                placeholder="0"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    quota: event.target.value === "" ? 0 : Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>

          {error && (
            <InlineNotice tone="error" className="mt-3 py-3 text-xs">
              {error}
            </InlineNotice>
          )}

          <div className="mt-6 flex justify-end">
            <button className="rounded-2xl bg-blue-600 px-10 py-3 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700">
              Tạo lịch trình
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-400">
              Chưa có lịch khởi hành đang nhận khách
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Giá vé
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Đã đặt / Tổng chỗ
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Mức lấp đầy
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSchedules.map((schedule) => {
                  const bookedCount = getBookedCount(schedule);
                  const usagePercent = getUsagePercent(schedule);

                  return (
                    <tr key={schedule.tour_schedule_id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          {new Date(schedule.start_date).toLocaleDateString("vi-VN")}
                          <ArrowRight size={12} className="text-slate-300" />
                          {new Date(schedule.end_date).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-blue-600">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-slate-400" />
                          {formatVND(schedule.price)}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-slate-400" />
                          <span className="text-emerald-600">{bookedCount}</span> / {schedule.quota}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="w-full max-w-[180px]">
                          <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span>{usagePercent}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full transition-all duration-1000 ${
                                usagePercent > 80 ? "bg-amber-500" : "bg-blue-500"
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <AdminStatusBadge tone="success">Đang nhận khách</AdminStatusBadge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleDelete(schedule.tour_schedule_id)}
                          className="rounded-xl p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filteredSchedules.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSchedules.length}
            pageSize={pageSize}
            itemLabel="lịch trình"
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
