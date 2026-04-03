"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { ScheduleEmptyState } from "@/components/admin/schedule-overview/ScheduleEmptyState";
import { ScheduleTablePanel } from "@/components/admin/schedule-overview/ScheduleTablePanel";
import { TourListPanel } from "@/components/admin/schedule-overview/TourListPanel";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/common/Toast";
import { adminFetch } from "@/lib/adminFetch";
import { confirmAction } from "@/lib/admin/confirm";
import {
  matchesScheduleStatusFilter,
  matchesTourSearch,
  matchesTourStatusFilter,
} from "@/lib/admin/tourManagement";

type Tour = {
  tour_id: number;
  code: string;
  name: string;
  duration_days: number;
  base_price: string | number;
  status: number;
};

type Schedule = {
  tour_schedule_id: number;
  start_date: string;
  end_date: string;
  price: string | number;
  quota: number;
  status: number;
  _count?: {
    bookings: number;
  };
};

export default function AdminSchedulesPage() {
  const pageSize = 10;
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tourStatusFilter, setTourStatusFilter] = useState<string>("all");
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<string>("upcoming");
  const [tourPage, setTourPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);
  const [pendingDeleteScheduleId, setPendingDeleteScheduleId] = useState<number | null>(null);

  const selectedTour = tours.find((tour) => tour.tour_id === selectedTourId);

  useEffect(() => {
    async function loadTours() {
      setLoadingTours(true);
      try {
        const response = await adminFetch("/admin/tours");
        if (response.ok) {
          const data = await response.json();
          setTours(data.items || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingTours(false);
      }
    }

    void loadTours();
  }, []);

  useEffect(() => {
    if (!selectedTourId) return;

    async function loadSchedules() {
      setLoadingSchedules(true);
      try {
        const response = await adminFetch(`/admin/tours/${selectedTourId}/schedules`);
        if (response.ok) {
          setSchedules(await response.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSchedules(false);
      }
    }

    void loadSchedules();
  }, [selectedTourId]);

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      const response = await adminFetch(`/admin/tours/schedules/${scheduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        success("Đã xóa lịch khởi hành thành công");
        setSchedules((current) =>
          current.filter((schedule) => schedule.tour_schedule_id !== scheduleId),
        );
        setPendingDeleteScheduleId(null);
        return;
      }

      const data = await response.json().catch(() => null);
      showError(data?.message || "Không thể xóa lịch khởi hành");
    } catch {
      showError("Lỗi khi xóa dữ liệu");
    }
  };

  const handleToggleStatus = async (
    scheduleId: number,
    currentStatus: number,
    bookedCount: number,
  ) => {
    if (currentStatus === 1 && bookedCount > 0) {
      const confirmHide = confirmAction(
        `CẢNH BÁO: Đợt khởi hành này đã có ${bookedCount} khách đặt chỗ.\n\n` +
          `Việc ẩn sẽ khiến tour không còn hiển thị trên website cho người mới.\n\n` +
          `Bạn có chắc chắn muốn ngừng nhận khách cho đợt này không?`,
      );
      if (!confirmHide) return;
    }

    const nextStatus = currentStatus === 1 ? 0 : 1;
    try {
      const response = await adminFetch(`/admin/tours/schedules/${scheduleId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (response.ok) {
        success(`Đã ${nextStatus === 1 ? "hiện" : "ẩn"} lịch khởi hành`);
        setSchedules((current) =>
          current.map((schedule) =>
            schedule.tour_schedule_id === scheduleId
              ? { ...schedule, status: nextStatus }
              : schedule,
          ),
        );
      }
    } catch {
      showError("Lỗi khi cập nhật trạng thái");
    }
  };

  const filteredTours = tours.filter(
    (tour) =>
      matchesTourSearch(tour, searchTerm) &&
      matchesTourStatusFilter(tour, tourStatusFilter),
  );
  const filteredSchedules = schedules.filter((schedule) =>
    matchesScheduleStatusFilter(schedule, scheduleStatusFilter),
  );

  const tourTotalPages = Math.max(1, Math.ceil(filteredTours.length / pageSize));
  const scheduleTotalPages = Math.max(1, Math.ceil(filteredSchedules.length / pageSize));
  const paginatedTours = filteredTours.slice(
    (tourPage - 1) * pageSize,
    tourPage * pageSize,
  );
  const paginatedSchedules = filteredSchedules.slice(
    (schedulePage - 1) * pageSize,
    schedulePage * pageSize,
  );

  useEffect(() => {
    setTourPage(1);
  }, [searchTerm, tourStatusFilter]);

  useEffect(() => {
    setSchedulePage(1);
  }, [selectedTourId, scheduleStatusFilter]);

  useEffect(() => {
    if (tourPage > tourTotalPages) {
      setTourPage(tourTotalPages);
    }
  }, [tourPage, tourTotalPages]);

  useEffect(() => {
    if (schedulePage > scheduleTotalPages) {
      setSchedulePage(scheduleTotalPages);
    }
  }, [schedulePage, scheduleTotalPages]);

  return (
    <div className="relative mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-slate-900">
            Quản lý lịch khởi hành
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Thiết lập ngày đi, giá và dịch vụ chi tiết cho từng hành trình.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <TourListPanel
          loading={loadingTours}
          tours={paginatedTours}
          selectedTourId={selectedTourId}
          searchTerm={searchTerm}
          tourStatusFilter={tourStatusFilter}
          currentPage={tourPage}
          totalPages={tourTotalPages}
          totalItems={filteredTours.length}
          pageSize={pageSize}
          onSearchChange={setSearchTerm}
          onFilterChange={setTourStatusFilter}
          onSelectTour={setSelectedTourId}
          onPageChange={setTourPage}
        />

        <div className="lg:col-span-8">
          {!selectedTourId ? (
            <ScheduleEmptyState />
          ) : (
            <ScheduleTablePanel
              selectedTourId={selectedTourId}
              selectedTour={selectedTour}
              schedules={paginatedSchedules}
              loading={loadingSchedules}
              scheduleStatusFilter={scheduleStatusFilter}
              currentPage={schedulePage}
              totalPages={scheduleTotalPages}
              totalItems={filteredSchedules.length}
              pageSize={pageSize}
              onFilterChange={setScheduleStatusFilter}
              onCreate={() => router.push(`/admin/schedules/new?tourId=${selectedTourId}`)}
              onEdit={(scheduleId) => router.push(`/admin/schedules/${scheduleId}`)}
              onDelete={setPendingDeleteScheduleId}
              onToggleStatus={handleToggleStatus}
              onPageChange={setSchedulePage}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteScheduleId !== null}
        icon={<AlertTriangle size={32} />}
        title="Xóa lịch khởi hành?"
        description="Đợt khởi hành này sẽ bị xóa nếu chưa có khách đặt. Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        onConfirm={() => {
          if (pendingDeleteScheduleId !== null) {
            void handleDeleteSchedule(pendingDeleteScheduleId);
          }
        }}
        onCancel={() => setPendingDeleteScheduleId(null)}
      />
    </div>
  );
}
