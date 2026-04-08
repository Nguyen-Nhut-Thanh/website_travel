"use client";

import { Car, ChevronDown, Hotel, MapPin, Utensils } from "lucide-react";
import type { ScheduleFormState } from "@/lib/admin/scheduleEditor";
import type { HotelItem, RoomTypeItem, TourInfo, TransportItem } from "@/lib/admin/scheduleDetail";

type Props = {
  form: ScheduleFormState;
  isPast: boolean;
  expandedDay: number | null;
  tourInfo: TourInfo | null;
  hotels: HotelItem[];
  transports: TransportItem[];
  roomTypesMap: Record<number, RoomTypeItem[]>;
  onExpandedDayChange: (value: number | null) => void;
  onFormChange: (updater: (prev: ScheduleFormState) => ScheduleFormState) => void;
  onHotelSelect: (hotelId: number) => void;
};

export function ScheduleItinerarySection({
  form,
  isPast,
  expandedDay,
  tourInfo,
  hotels,
  transports,
  roomTypesMap,
  onExpandedDayChange,
  onFormChange,
  onHotelSelect,
}: Props) {
  const totalDays = Math.max(
    Number(tourInfo?.duration_days ?? 0),
    form.itinerary.length,
  );

  return (
    <div className="space-y-6">
      <h3 className="flex items-center gap-3 px-2 text-lg font-bold text-slate-900">
        <MapPin className={isPast ? "text-slate-300" : "text-blue-600"} size={20} />
        Lịch trình & Dịch vụ ({totalDays} ngày)
      </h3>

      <div className="space-y-4">
        {form.itinerary.map((itineraryDay, index) => (
          <div
            key={itineraryDay.day_number}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300"
          >
            <button
              type="button"
              onClick={() =>
                onExpandedDayChange(
                  expandedDay === itineraryDay.day_number ? null : itineraryDay.day_number,
                )
              }
              className={`flex w-full items-center justify-between px-6 py-5 transition-all ${
                expandedDay === itineraryDay.day_number
                  ? "border-b border-blue-50 bg-blue-50/30"
                  : "hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition-all ${
                    expandedDay === itineraryDay.day_number
                      ? isPast
                        ? "bg-slate-200 text-white"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {itineraryDay.day_number}
                </div>
                <div className="text-left">
                  <span className="mb-1 block text-[10px] font-bold leading-none uppercase tracking-widest text-slate-400">
                    Ngày {itineraryDay.day_number}
                  </span>
                  <span
                    className={`text-base font-bold transition-all ${
                      expandedDay === itineraryDay.day_number
                        ? isPast
                          ? "text-slate-500"
                          : "text-blue-700"
                        : isPast
                          ? "text-slate-400"
                          : "text-slate-700"
                    }`}
                  >
                    {itineraryDay.title || "Chưa đặt tiêu đề hành trình"}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`text-slate-300 transition-transform duration-300 ${
                  expandedDay === itineraryDay.day_number ? "rotate-180 text-blue-500" : ""
                }`}
              />
            </button>

            {expandedDay === itineraryDay.day_number && (
              <div className="animate-in slide-in-from-top-2 space-y-6 p-8 duration-300">
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Tiêu đề ngày
                  </label>
                  <input
                    type="text"
                    disabled={isPast}
                    placeholder="VD: Khám phá vẻ đẹp kỳ vĩ của Vịnh Hạ Long"
                    className={`w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white ${
                      isPast ? "cursor-not-allowed text-slate-400" : ""
                    }`}
                    value={itineraryDay.title || ""}
                    onChange={(event) => {
                      const nextItinerary = [...form.itinerary];
                      nextItinerary[index].title = event.target.value;
                      onFormChange((prev) => ({ ...prev, itinerary: nextItinerary }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    disabled={isPast}
                    placeholder="Mô tả các hoạt động tham quan, trải nghiệm, ăn uống..."
                    className={`min-h-[120px] w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white ${
                      isPast ? "cursor-not-allowed text-slate-400" : ""
                    }`}
                    value={itineraryDay.content || ""}
                    onChange={(event) => {
                      const nextItinerary = [...form.itinerary];
                      nextItinerary[index].content = event.target.value;
                      onFormChange((prev) => ({ ...prev, itinerary: nextItinerary }));
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <Car size={14} className={isPast ? "text-slate-300" : "text-blue-500"} />
                      Phương tiện di chuyển
                    </label>
                    <select
                      disabled={isPast}
                      className={`w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white ${
                        isPast ? "cursor-not-allowed text-slate-400" : ""
                      }`}
                      value={itineraryDay.transport_id || ""}
                      onChange={(event) => {
                        const nextItinerary = [...form.itinerary];
                        nextItinerary[index].transport_id = event.target.value;
                        onFormChange((prev) => ({ ...prev, itinerary: nextItinerary }));
                      }}
                    >
                      <option value="">-- Không gán phương tiện --</option>
                      {transports.map((transport) => (
                        <option key={transport.transport_id} value={transport.transport_id}>
                          {transport.name} ({transport.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <Hotel size={14} className={isPast ? "text-slate-300" : "text-amber-500"} />
                      Khách sạn nghỉ đêm
                    </label>
                    <select
                      disabled={isPast}
                      className={`w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white ${
                        isPast ? "cursor-not-allowed text-slate-400" : ""
                      }`}
                      value={itineraryDay.hotel_id || ""}
                      onChange={(event) => {
                        const nextItinerary = [...form.itinerary];
                        const nextHotelId = event.target.value;
                        nextItinerary[index].hotel_id = nextHotelId;
                        nextItinerary[index].room_type_id = "";
                        onFormChange((prev) => ({ ...prev, itinerary: nextItinerary }));

                        if (nextHotelId) {
                          onHotelSelect(Number(nextHotelId));
                        }
                      }}
                    >
                      <option value="">-- Không gán khách sạn --</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.hotel_id} value={hotel.hotel_id}>
                          {hotel.name} ({hotel.star_rating}★)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Bữa ăn
                    </label>
                    <div
                      className={`flex min-h-[56px] items-center gap-3 rounded-2xl border bg-slate-50 px-5 py-3 text-xs font-bold ${
                        isPast
                          ? "border-slate-100 text-slate-300"
                          : "border-slate-100 text-slate-600 transition-all hover:border-blue-100 hover:bg-white"
                      }`}
                    >
                      <Utensils
                        size={16}
                        className={
                          isPast
                            ? "text-slate-300"
                            : "text-orange-400 transition-transform group-hover:scale-110"
                        }
                      />
                      <input
                        type="text"
                        disabled={isPast}
                        placeholder="VD: Sáng, Trưa, Tối"
                        className={`w-full border-none bg-transparent font-black outline-none placeholder:text-slate-300 ${
                          isPast ? "cursor-not-allowed text-slate-300" : "text-blue-600"
                        }`}
                        value={itineraryDay.meals || ""}
                        onChange={(event) => {
                          const nextItinerary = [...form.itinerary];
                          nextItinerary[index].meals = event.target.value;
                          onFormChange((prev) => ({ ...prev, itinerary: nextItinerary }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Loại phòng khách sạn
                    </label>
                    <select
                      disabled={isPast || !itineraryDay.hotel_id}
                      className={`w-full appearance-none rounded-2xl border px-4 py-3 font-bold outline-none transition-all focus:border-blue-500 focus:bg-white ${
                        isPast
                          ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                          : itineraryDay.hotel_id
                            ? "border-blue-100 bg-blue-50 text-slate-900"
                            : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                      }`}
                      value={itineraryDay.room_type_id || ""}
                      onChange={(event) => {
                        const nextItinerary = [...form.itinerary];
                        nextItinerary[index].room_type_id = event.target.value;
                        onFormChange((prev) => ({ ...prev, itinerary: nextItinerary }));
                      }}
                    >
                      <option value="">
                        {itineraryDay.hotel_id
                          ? "-- Chọn loại phòng --"
                          : "-- Chọn khách sạn trước --"}
                      </option>
                      {roomTypesMap[Number(itineraryDay.hotel_id)]?.map((roomType) => (
                        <option key={roomType.room_type_id} value={roomType.room_type_id}>
                          {roomType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
