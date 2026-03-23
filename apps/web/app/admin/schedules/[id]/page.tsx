"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AdminBackPageHeader } from "@/components/admin/AdminBackPageHeader";
import { ScheduleBasicInfoCard } from "@/components/admin/schedule-detail/ScheduleBasicInfoCard";
import { ScheduleItinerarySection } from "@/components/admin/schedule-detail/ScheduleItinerarySection";
import { ScheduleSidebar } from "@/components/admin/schedule-detail/ScheduleSidebar";
import { useToast } from "@/components/common/Toast";
import { adminFetch } from "@/lib/adminFetch";
import { API_BASE, getToken } from "@/lib/auth";
import { buildScheduleFormFromResponse, buildSchedulePayload, createDefaultScheduleForm, ensureItineraryDays } from "@/lib/admin/scheduleEditor";
import type { HotelItem, RoomTypeItem, ScheduleDetailResponse, TourInfo, TransportItem } from "@/lib/admin/scheduleDetail";

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

  const fetchRoomTypes = async (hotelId: number) => {
    if (roomTypesMap[hotelId]) return;

    try {
      const response = await adminFetch(`/admin/catalogs/hotels/${hotelId}/room-types`);
      if (!response.ok) return;

      const data = (await response.json()) as RoomTypeItem[];
      setRoomTypesMap((prev) => ({ ...prev, [hotelId]: data }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      setLoading(true);

      try {
        const [hotelResponse, transportResponse] = await Promise.all([
          adminFetch("/admin/catalogs/hotels"),
          adminFetch("/admin/catalogs/transports"),
        ]);

        if (hotelResponse.ok) {
          setHotels((await hotelResponse.json()) as HotelItem[]);
        }

        if (transportResponse.ok) {
          setTransports((await transportResponse.json()) as TransportItem[]);
        }

        let currentTourId = tourId;

        if (!isNew) {
          const scheduleResponse = await adminFetch(`/admin/tours/schedules/${id}`);
          if (scheduleResponse.ok) {
            const data = (await scheduleResponse.json()) as ScheduleDetailResponse;
            currentTourId = data.tour_id ? String(data.tour_id) : currentTourId;

            data.tour_itineraries?.forEach((day) => {
              if (day.hotel_id) {
                void fetchRoomTypes(day.hotel_id);
              }
            });

            setForm(buildScheduleFormFromResponse(data));
          }
        }

        if (currentTourId) {
          const tourResponse = await adminFetch(`/admin/tours/${currentTourId}`);
          if (tourResponse.ok) {
            const nextTourInfo = (await tourResponse.json()).tour as TourInfo;
            const basePrice = Number(nextTourInfo.base_price) || 0;
            const durationDays = nextTourInfo.duration_days || 0;

            setTourInfo(nextTourInfo);
            setForm((prev) => ({
              ...prev,
              price: isNew ? basePrice : prev.price,
              prices: isNew
                ? prev.prices.map((item) =>
                    item.passenger_type === "adult" ? { ...item, price: basePrice } : item,
                  )
                : prev.prices,
              itinerary: ensureItineraryDays(prev.itinerary, durationDays),
            }));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void initPage();
  }, [id, isNew, tourId]);

  const handleSave = async () => {
    if (!form.start_date) {
      showError("Vui lòng chọn ngày khởi hành");
      return;
    }

    setSaving(true);

    try {
      const url = isNew ? `/admin/tours/${tourId}/schedules` : `/admin/tours/schedules/${id}`;
      const method = isNew ? "POST" : "PATCH";
      const payload = buildSchedulePayload(form);

      const response = await adminFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success("Đã lưu dữ liệu thành công!");
        router.push("/admin/schedules");
        return;
      }

      const errorData = await response.json();
      showError(errorData.message || "Lỗi khi lưu");
    } catch {
      showError("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/admin/tours/upload-schedule-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      if (!response.ok) {
        showError("Lỗi upload");
        return;
      }

      const data = await response.json();
      setForm((prev) => ({ ...prev, cover_image_url: data.url }));
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
          <ScheduleBasicInfoCard
            form={form}
            isPast={isPast}
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
