"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { AdminBackPageHeader } from "@/components/admin/AdminBackPageHeader";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { ScheduleManagement } from "@/components/admin/ScheduleManagement";
import { TourBasicInfoCard } from "@/components/admin/tour-detail/TourBasicInfoCard";
import { TourDetailsCard } from "@/components/admin/tour-detail/TourDetailsCard";
import { TourSidebar } from "@/components/admin/tour-detail/TourSidebar";
import { useToast } from "@/components/common/Toast";
import { adminFetch } from "@/lib/adminFetch";
import { confirmAction } from "@/lib/admin/confirm";
import {
  getTotalTourBookings,
  normalizeTourDetailForm,
  type LocationOption,
  type TourDetailForm,
  type TransportOption,
} from "@/lib/admin/tourDetail";

export default function AdminTourDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tour, setTour] = useState<TourDetailForm | null>(null);
  const [totalBookings, setTotalBookings] = useState(0);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);

  const updateTour = (updater: (prev: TourDetailForm) => TourDetailForm) => {
    setTour((prev) => (prev ? updater(prev) : prev));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tourResponse, locationResponse, transportResponse] = await Promise.all([
          adminFetch(`/admin/tours/${id}`),
          adminFetch("/admin/locations"),
          adminFetch("/admin/transports"),
        ]);

        if (tourResponse.ok) {
          const tourData = normalizeTourDetailForm((await tourResponse.json()).tour);
          setTour(tourData);
          setTotalBookings(getTotalTourBookings(tourData));
        }

        if (locationResponse.ok) {
          setLocations((await locationResponse.json()).items || []);
        }

        if (transportResponse.ok) {
          setTransports((await transportResponse.json()).items || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id]);

  const handleSave = async () => {
    if (!tour) return;

    if (totalBookings > 0) {
      const shouldSave = confirmAction(
        `CHÚ Ý: Tour này hiện đang có ${totalBookings} đơn đặt chỗ.\n\n` +
          `Việc thay đổi Tên, Thời lượng hoặc Điểm đến có thể làm sai lệch thông tin trong lịch sử đơn hàng của khách cũ.\n\n` +
          `Bạn có chắc chắn muốn lưu các thay đổi này không?`,
      );
      if (!shouldSave) return;
    }

    setSaving(true);
    setSuccess(false);
    try {
      const response = await adminFetch(`/admin/tours/${id}`, {
        method: "PATCH",
        body: JSON.stringify(tour),
      });

      if (response.ok) {
        showSuccess("Lưu thay đổi thành công!");
        router.push("/admin/tours");
      }
    } catch {
      showError("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !tour) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <AdminBackPageHeader
        title={tour.name || ""}
        onBack={() => router.back()}
        meta={
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Mã: <span className="font-bold text-blue-600">{tour.code}</span>
            </span>
            {totalBookings > 0 && (
              <span className="flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-amber-600">
                <AlertTriangle size={12} /> Đang có {totalBookings} khách
              </span>
            )}
          </div>
        }
        actions={
          success ? (
            <span className="animate-in slide-in-from-right-2 flex items-center gap-1.5 text-sm font-bold text-emerald-600 fade-in">
              <CheckCircle2 size={18} /> Đã lưu thành công
            </span>
          ) : null
        }
      />

      {totalBookings > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-700 shadow-sm shadow-amber-50/50">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-500 shadow-sm">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[13px] font-bold uppercase leading-none tracking-tight">
              Tour này đã phát sinh giao dịch
            </p>
            <p className="mt-1.5 text-[11px] font-medium opacity-90">
              Hạn chế thay đổi các thông tin cốt lõi (Tên, Hành trình, Giá) để tránh gây nhầm lẫn
              cho khách hàng đã đặt trước đó. Nếu thay đổi, hãy chủ động thông báo cho khách.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <TourBasicInfoCard
            tour={tour}
            locations={locations}
            transports={transports}
            onTourChange={updateTour}
          />

          <TourDetailsCard tour={tour} onTourChange={updateTour} />
        </div>

        <TourSidebar
          tour={tour}
          saving={saving}
          success={success}
          onSave={handleSave}
          onTourChange={updateTour}
        />
      </div>

      <AdminFormCard bodyClassName="p-8">
        <ScheduleManagement tourId={Number(id)} durationDays={tour.duration_days} />
      </AdminFormCard>
    </div>
  );
}
