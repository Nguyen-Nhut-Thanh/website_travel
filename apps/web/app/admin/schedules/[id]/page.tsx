"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AdminBackPageHeader } from "@/components/admin/AdminBackPageHeader";
import { ScheduleBasicInfoCard } from "@/components/admin/schedule-detail/ScheduleBasicInfoCard";
import { ScheduleItinerarySection } from "@/components/admin/schedule-detail/ScheduleItinerarySection";
import { ScheduleSidebar } from "@/components/admin/schedule-detail/ScheduleSidebar";
import { useToast } from "@/components/common/Toast";
import { uploadAuthenticatedFile } from "@/lib/uploadApi";
import { API_BASE, getToken } from "@/lib/auth";
import {
  getAdminCatalogTransports,
  getAdminHotels,
  getHotelRoomTypes,
} from "@/lib/admin/catalogsApi";
import {
  buildScheduleFormFromResponse,
  buildSchedulePayload,
  createDefaultScheduleForm,
  ensureItineraryDays,
} from "@/lib/admin/scheduleEditor";
import { getAdminScheduleDetail, saveAdminSchedule } from "@/lib/admin/schedulesApi";
import type {
  HotelItem,
  RoomTypeItem,
  ScheduleDetailResponse,
  TourInfo,
  TransportItem,
} from "@/lib/admin/scheduleDetail";
import { getAdminTourDetail } from "@/lib/admin/toursApi";

export default function AdminScheduleDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const isNew = id === "new";
  const tourId = searchParams.get("tourId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tourInfo, setTourInfo] = useState<TourInfo | null>(null);
  const [hasBookings, setHasBookings] = useState(false);
  const [bookedCount, setBookedCount] = useState(0);
  const [originalQuota, setOriginalQuota] = useState(0);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [transports, setTransports] = useState<TransportItem[]>([]);
  const [roomTypesMap, setRoomTypesMap] = useState<Record<number, RoomTypeItem[]>>({});
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [form, setForm] = useState(createDefaultScheduleForm);

  const isPast = useMemo(() => {
    if (isNew || !form.start_date) return false;

    try {
      const startDt = new Date(`${form.start_date}T${form.start_time || "00:00"}:00`);
      return startDt.getTime() < Date.now();
    } catch {
      return false;
    }
  }, [form.start_date, form.start_time, isNew]);

  const fetchRoomTypes = useCallback(async (hotelId: number) => {
    try {
      const data = await getHotelRoomTypes<RoomTypeItem>(hotelId);
      setRoomTypesMap((prev) =>
        prev[hotelId] ? prev : { ...prev, [hotelId]: data },
      );
    } catch {
      // Ignore room-type lookup failures; the rest of the form still works.
    }
  }, []);

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);

      try {
        const [hotelData, transportData] = await Promise.all([
          getAdminHotels<HotelItem>(),
          getAdminCatalogTransports<TransportItem>(),
        ]);

        setHotels(hotelData);
        setTransports(transportData);

        let currentTourId = tourId;
        let scheduleData: ScheduleDetailResponse | null = null;

        if (!isNew) {
          scheduleData = await getAdminScheduleDetail<ScheduleDetailResponse>(String(id));
          currentTourId = scheduleData.tour_id ? String(scheduleData.tour_id) : currentTourId;
          setHasBookings(Boolean(scheduleData.hasBookings ?? Number(scheduleData.booked_count || 0) > 0));
          setBookedCount(Number(scheduleData.booked_count || 0));
          setOriginalQuota(Number(scheduleData.quota || 0));

          scheduleData.tour_itineraries?.forEach((day) => {
            if (day.hotel_id) {
              void fetchRoomTypes(day.hotel_id);
            }
          });

          setForm(buildScheduleFormFromResponse(scheduleData));
        } else {
          setForm(createDefaultScheduleForm());
        }

        if (currentTourId) {
          const tourData = await getAdminTourDetail<TourInfo>(currentTourId);
          setTourInfo(tourData.tour);
        }
      } finally {
        setLoading(false);
      }
    };

    void initPage();
  }, [fetchRoomTypes, id, isNew, tourId]);

  useEffect(() => {
    if (!tourInfo) return;

    const basePrice = Number(tourInfo.base_price ?? 0) || 0;
    const durationDays = Number(tourInfo.duration_days ?? 0) || 0;

    setForm((prev) => {
      const nextPrices = prev.prices.map((item) =>
        item.passenger_type === "adult" && Number(item.price) <= 0 && basePrice > 0
          ? { ...item, price: basePrice }
          : item,
      );

      return {
        ...prev,
        price: prev.price > 0 ? prev.price : basePrice,
        prices: nextPrices,
        itinerary: ensureItineraryDays(prev.itinerary, durationDays),
      };
    });
  }, [tourInfo]);

  const handleSave = async () => {
    if (!form.start_date) {
      showError("Vui lòng chọn ngày khởi hành");
      return;
    }

    const selectedStartDate = new Date(`${form.start_date}T${form.start_time || "00:00"}:00`);
    const cutOffHours = Number(tourInfo?.cut_off_hours || 0);
    const minAllowedDateTime = new Date(Date.now() + cutOffHours * 60 * 60 * 1000);

    if (selectedStartDate.getTime() < minAllowedDateTime.getTime()) {
      showError(
        `Ngày khởi hành phải sau thời điểm hiện tại ít nhất ${cutOffHours} giờ theo giờ chốt khách của tour.`,
      );
      return;
    }

    setSaving(true);

    try {
      const data = (await saveAdminSchedule(
        isNew ? `/admin/tours/${tourId}/schedules` : `/admin/tours/schedules/${id}`,
        isNew ? "POST" : "PATCH",
        buildSchedulePayload(form),
      )) as ScheduleDetailResponse;

      success(
        data.notificationSent
          ? "Đã cập nhật lịch khởi hành và gửi email thông báo cho khách."
          : "Đã lưu dữ liệu thành công!",
      );
      router.push("/admin/schedules");
    } catch (requestError) {
      showError(requestError instanceof Error ? requestError.message : "Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const token = getToken();
    if (!token) {
      showError("Bạn chưa đăng nhập");
      return;
    }

    setUploading(true);

    try {
      const data = await uploadAuthenticatedFile(
        `${API_BASE}/admin/tours/upload-schedule-image`,
        token,
        file,
        "Lỗi upload",
      );
      setForm((prev) => ({ ...prev, cover_image_url: data?.url || "" }));
      success("Tải ảnh lên thành công");
    } catch {
      showError("Lỗi upload");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <AdminBackPageHeader
        title={isNew ? "Thiết lập lịch mới" : "Chỉnh sửa lịch khởi hành"}
        description={tourInfo?.name || ""}
        onBack={() => router.back()}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {hasBookings && !isPast ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
              Đợt khởi hành này đã có {bookedCount} khách đặt. Bạn vẫn có thể cập nhật ảnh,
              giá áp dụng cho đơn mới, quota theo hướng tăng, và lịch trình theo ngày. Nếu đổi
              ngày hoặc giờ khởi hành, hệ thống sẽ gửi email thông báo đến khách hàng.
            </div>
          ) : null}

          <ScheduleBasicInfoCard
            form={form}
            isPast={isPast}
            hasBookings={hasBookings}
            bookedCount={bookedCount}
            originalQuota={originalQuota}
            tourInfo={tourInfo}
            onFormChange={setForm}
          />

          <ScheduleItinerarySection
            form={form}
            isPast={isPast}
            expandedDay={expandedDay}
            tourInfo={tourInfo}
            hotels={hotels}
            transports={transports}
            roomTypesMap={roomTypesMap}
            onExpandedDayChange={setExpandedDay}
            onFormChange={setForm}
            onHotelSelect={(hotelId) => void fetchRoomTypes(hotelId)}
          />
        </div>

        <ScheduleSidebar
          form={form}
          isPast={isPast}
          saving={saving}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onSave={handleSave}
          onFileUpload={handleFileUpload}
          onFormChange={setForm}
        />
      </div>
    </div>
  );
}
