"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AdminBackPageHeader } from "@/components/admin/AdminBackPageHeader";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { ScheduleManagement } from "@/components/admin/ScheduleManagement";
import { TourBasicInfoCard } from "@/components/admin/tour-detail/TourBasicInfoCard";
import { TourDetailsCard } from "@/components/admin/tour-detail/TourDetailsCard";
import { TourSidebar } from "@/components/admin/tour-detail/TourSidebar";
import { useToast } from "@/components/common/Toast";
import { getAdminTransports } from "@/lib/admin/catalogsApi";
import { getAdminLocations } from "@/lib/admin/locationsApi";
import {
  getTotalTourBookings,
  normalizeTourDetailForm,
  type LocationOption,
  type TourDetailForm,
  type TransportOption,
} from "@/lib/admin/tourDetail";
import { getAdminTourDetail, updateAdminTour } from "@/lib/admin/toursApi";

export default function AdminTourDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tour, setTour] = useState<TourDetailForm | null>(null);
  const [totalBookings, setTotalBookings] = useState(0);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);

  const hasLockedCoreFields = totalBookings > 0;

  const updateTour = (updater: (prev: TourDetailForm) => TourDetailForm) => {
    setTour((prev) => (prev ? updater(prev) : prev));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tourData, locationData, transportData] = await Promise.all([
          getAdminTourDetail<TourDetailForm>(String(id)),
          getAdminLocations<LocationOption>(),
          getAdminTransports<TransportOption>(),
        ]);

        const normalizedTour = normalizeTourDetailForm(tourData.tour);
        setTour(normalizedTour);
        setTotalBookings(getTotalTourBookings(normalizedTour));
        setLocations(locationData.items || []);
        setTransports(transportData.items || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id]);

  const handleSave = async () => {
    if (!tour) return;

    const payload = { ...tour };

    if (hasLockedCoreFields) {
      delete payload.name;
      delete payload.duration_days;
      delete payload.duration_nights;
      delete payload.tour_type;
      delete payload.departure_location;
      delete payload.destinations;
    }

    setSaving(true);
    setSaved(false);
    try {
      await updateAdminTour(String(id), payload);
      setSaved(true);
      showSuccess("Lưu thay đổi thành công!");
      router.push("/admin/tours");
    } catch (requestError) {
      showError(
        requestError instanceof Error ? requestError.message : "Lỗi kết nối server",
      );
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
          </div>
        }
        actions={
          saved ? (
            <span className="flex animate-in items-center gap-1.5 text-sm font-bold text-emerald-600 fade-in slide-in-from-right-2">
              <CheckCircle2 size={18} /> Đã lưu thành công
            </span>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <TourBasicInfoCard
            tour={tour}
            locations={locations}
            transports={transports}
            lockCoreFields={hasLockedCoreFields}
            onTourChange={updateTour}
          />

          <TourDetailsCard tour={tour} onTourChange={updateTour} />
        </div>

        <TourSidebar
          tour={tour}
          saving={saving}
          success={saved}
          lockCoreFields={hasLockedCoreFields}
          onSave={handleSave}
          onTourChange={updateTour}
        />
      </div>

      <AdminFormCard bodyClassName="p-8">
        <ScheduleManagement
          tourId={Number(id)}
          durationDays={tour.duration_days}
        />
      </AdminFormCard>
    </div>
  );
}
