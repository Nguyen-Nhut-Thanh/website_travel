"use client";

import { Info } from "lucide-react";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import FormFieldLabel from "@/components/common/FormFieldLabel";
import type {
  LocationOption,
  TourDetailForm,
  TransportOption,
} from "@/lib/admin/tourDetail";

type Props = {
  tour: TourDetailForm;
  locations: LocationOption[];
  transports: TransportOption[];
  lockCoreFields?: boolean;
  onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};

export function TourBasicInfoCard({
  tour,
  locations,
  transports,
  lockCoreFields = false,
  onTourChange,
}: Props) {
  return (
    <AdminFormCard
      title="Thông tin cơ bản"
      titleClassName="text-sm uppercase tracking-wider"
      icon={
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Info size={18} />
        </div>
      }
      bodyClassName="space-y-6 p-8"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <FormFieldLabel>Tên tour du lịch</FormFieldLabel>
          <input
            disabled={lockCoreFields}
            className={`w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white ${
              lockCoreFields
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-80"
                : ""
            }`}
            value={tour.name || ""}
            onChange={(event) =>
              onTourChange((prev) => ({ ...prev, name: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <FormFieldLabel>Loại tour</FormFieldLabel>
          <select
            disabled={lockCoreFields}
            className={`w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white ${
              lockCoreFields
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-80"
                : ""
            }`}
            value={tour.tour_type || ""}
            onChange={(event) =>
              onTourChange((prev) => ({
                ...prev,
                tour_type: event.target.value,
              }))
            }
          >
            <option value="domestic">Trong nước</option>
            <option value="outbound">Nước ngoài</option>
            <option value="international">Quốc tế</option>
          </select>
        </div>

        <div className="space-y-2">
          <FormFieldLabel>Điểm khởi hành</FormFieldLabel>
          <select
            disabled={lockCoreFields}
            className={`w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white ${
              lockCoreFields
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-80"
                : ""
            }`}
            value={tour.departure_location}
            onChange={(event) =>
              onTourChange((prev) => ({
                ...prev,
                departure_location: Number(event.target.value),
              }))
            }
          >
            {locations.map((location) => (
              <option key={location.location_id} value={location.location_id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <FormFieldLabel>Phương tiện</FormFieldLabel>
          <select
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
            value={tour.transport_id}
            onChange={(event) =>
              onTourChange((prev) => ({
                ...prev,
                transport_id: Number(event.target.value),
              }))
            }
          >
            {transports.map((transport) => (
              <option
                key={transport.transport_id}
                value={transport.transport_id}
              >
                {transport.name} ({transport.transport_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-50 pt-4">
        <div className="flex items-center justify-between">
          <FormFieldLabel>Điểm đến hành trình</FormFieldLabel>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
            Đã chọn: {tour.destinations?.length || 0}
          </span>
        </div>

        <div
          className={`custom-scrollbar grid max-h-[300px] grid-cols-2 gap-3 overflow-y-auto rounded-3xl border p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 ${
            lockCoreFields
              ? "border-slate-200 bg-slate-100 opacity-80"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          {locations
            .filter((location) => {
              const isVietNam = location.country_code === "VN";
              if (tour.tour_type === "domestic") return isVietNam;
              if (tour.tour_type === "outbound") return !isVietNam;
              return true;
            })
            .map((location) => {
              const isSelected = tour.destinations?.includes(
                location.location_id,
              );

              return (
                <label
                  key={location.location_id}
                  className={`group flex items-center gap-2 rounded-xl border p-2 transition-all ${
                    lockCoreFields
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  } ${
                    isSelected
                      ? "border-blue-100 bg-white shadow-sm"
                      : lockCoreFields
                        ? "border-transparent"
                        : "border-transparent hover:bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={lockCoreFields}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={isSelected || false}
                    onChange={(event) => {
                      const currentDestinations = tour.destinations || [];
                      onTourChange((prev) => ({
                        ...prev,
                        destinations: event.target.checked
                          ? [...currentDestinations, location.location_id]
                          : currentDestinations.filter(
                              (id) => id !== location.location_id,
                            ),
                      }));
                    }}
                  />
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      isSelected
                        ? "font-extrabold text-blue-600"
                        : "text-slate-600"
                    }`}
                  >
                    {location.name}
                  </span>
                </label>
              );
            })}
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-50 pt-4">
        <FormFieldLabel>Mô tả hành trình</FormFieldLabel>
        <textarea
          className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
          value={tour.description || ""}
          onChange={(event) =>
            onTourChange((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
        />
      </div>
    </AdminFormCard>
  );
}
