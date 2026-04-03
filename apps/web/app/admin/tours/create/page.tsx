"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  Ticket,
  Utensils,
} from "lucide-react";
import { AdminBackPageHeader } from "@/components/admin/AdminBackPageHeader";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PriceInput } from "@/components/admin/PriceInput";
import { useToast } from "@/components/common/Toast";
import FormFieldLabel from "@/components/common/FormFieldLabel";
import { adminFetch } from "@/lib/adminFetch";

type LocationOption = {
  location_id: number;
  name: string;
  country_code?: string | null;
};

type TransportOption = {
  transport_id: number;
  name: string;
  transport_type: string;
};

export default function AdminTourCreatePage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    duration_days: 1,
    duration_nights: 0,
    base_price: 0,
    departure_location: 0,
    transport_id: 0,
    tour_type: "domestic",
    images: [] as string[],
    destinations: [] as number[],
    best_time: "",
    cuisine_info: "",
    promotion_info: "",
    best_for: "",
    policy_contents: {},
    cut_off_hours: "" as number | "",
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const [locationResponse, transportResponse] = await Promise.all([
          adminFetch("/admin/locations"),
          adminFetch("/admin/transports"),
        ]);

        if (locationResponse.ok) {
          const locationData = await locationResponse.json();
          setLocations(locationData.items || []);
          if (locationData.items?.length > 0) {
            setForm((prev) => ({
              ...prev,
              departure_location: locationData.items[0].location_id,
            }));
          }
        }

        if (transportResponse.ok) {
          const transportData = await transportResponse.json();
          setTransports(transportData.items || []);
          if (transportData.items?.length > 0) {
            setForm((prev) => ({
              ...prev,
              transport_id: transportData.items[0].transport_id,
            }));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void loadOptions();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.code.trim()) {
      showError("Vui lòng nhập mã tour (VD: VN-MB-001)");
      return;
    }

    if (!form.name.trim()) {
      showError("Vui lòng nhập tên tour du lịch");
      return;
    }

    if (!form.description.trim()) {
      showError("Vui lòng nhập mô tả cho tour");
      return;
    }

    if (form.base_price <= 0) {
      showError("Vui lòng nhập giá cơ bản cho tour du lịch");
      return;
    }

    if (form.destinations.length === 0) {
      showError("Vui lòng chọn ít nhất một điểm đến cho hành trình");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        cut_off_hours:
          form.cut_off_hours === "" ? undefined : Number(form.cut_off_hours),
      };

      const response = await adminFetch("/admin/tours", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success("Đã tạo tour mới thành công!");
        router.push("/admin/tours");
        return;
      }

      const errorData = await response
        .json()
        .catch(() => ({ message: "Lỗi không xác định" }));
      showError(errorData.message || "Lỗi khi tạo tour");
    } catch {
      showError("Lỗi kết nối server");
    } finally {
      setSaving(false);
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
        title="Thêm Tour Mới"
        description="Khởi tạo hành trình du lịch mới cho khách hàng."
        onBack={() => router.push("/admin/tours")}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <AdminFormCard
            title="Thông tin cơ bản"
            icon={
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Info size={18} />
              </div>
            }
            bodyClassName="space-y-6 p-8"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <FormFieldLabel>Mã Tour</FormFieldLabel>
                <input
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                  placeholder="VD: VN-MB-001"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <FormFieldLabel>Loại Tour</FormFieldLabel>
                <select
                  className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                  value={form.tour_type}
                  onChange={(e) =>
                    setForm({ ...form, tour_type: e.target.value })
                  }
                >
                  <option value="domestic">Trong nước</option>
                  <option value="outbound">Nước ngoài</option>
                  <option value="international">Quốc tế</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <FormFieldLabel>Tên Tour</FormFieldLabel>
                <input
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                  placeholder="VD: Hà Nội - Hạ Long 3N2Đ"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <FormFieldLabel>Điểm khởi hành</FormFieldLabel>
                <select
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                  value={form.departure_location}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      departure_location: Number(e.target.value),
                    })
                  }
                >
                  {locations.map((location) => (
                    <option
                      key={location.location_id}
                      value={location.location_id}
                    >
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <FormFieldLabel>Phương tiện</FormFieldLabel>
                <select
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
                  value={form.transport_id}
                  onChange={(e) =>
                    setForm({ ...form, transport_id: Number(e.target.value) })
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
                <FormFieldLabel>Các điểm đến</FormFieldLabel>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                  Đã chọn: {form.destinations.length}
                </span>
              </div>

              <div className="custom-scrollbar grid max-h-[250px] grid-cols-2 gap-3 overflow-y-auto rounded-3xl border border-slate-100 bg-slate-50 p-6 sm:grid-cols-3 md:grid-cols-4">
                {locations
                  .filter((location) => {
                    const isVietnam = location.country_code === "VN";

                    if (form.tour_type === "domestic") {
                      return isVietnam;
                    }

                    if (form.tour_type === "outbound") {
                      return !isVietnam;
                    }

                    return true;
                  })
                  .map((location) => {
                    const isSelected = form.destinations.includes(
                      location.location_id,
                    );

                    return (
                      <label
                        key={location.location_id}
                        className={`group flex cursor-pointer items-center gap-2 rounded-xl border p-2 transition-all ${
                          isSelected
                            ? "border-blue-100 bg-white shadow-sm"
                            : "border-transparent hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                destinations: [
                                  ...form.destinations,
                                  location.location_id,
                                ],
                              });
                              return;
                            }

                            setForm({
                              ...form,
                              destinations: form.destinations.filter(
                                (id) => id !== location.location_id,
                              ),
                            });
                          }}
                        />
                        <span
                          className={`text-[11px] font-medium text-slate-600 ${
                            isSelected ? "font-extrabold text-blue-600" : ""
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
                className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-medium outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Giới thiệu sơ lược về tour du lịch này..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </AdminFormCard>

          <AdminFormCard bodyClassName="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Sparkles size={16} className="text-blue-500" /> Thời gian lý
                tưởng
              </h3>
              <textarea
                placeholder="VD: Tháng 3 - tháng 8, mùa khô rất thuận tiện..."
                className="min-h-[80px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                value={form.best_time}
                onChange={(e) =>
                  setForm({ ...form, best_time: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Utensils size={16} className="text-emerald-500" /> Ẩm thực
              </h3>
              <textarea
                placeholder="Thông tin về các bữa ăn, đặc sản..."
                className="min-h-[80px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                value={form.cuisine_info}
                onChange={(e) =>
                  setForm({ ...form, cuisine_info: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Ticket size={16} className="text-amber-500" /> Khuyến mãi
              </h3>
              <textarea
                placeholder="Các ưu đãi đi kèm..."
                className="min-h-[80px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                value={form.promotion_info}
                onChange={(e) =>
                  setForm({ ...form, promotion_info: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <MapPin size={16} className="text-rose-500" /> Phù hợp với
              </h3>
              <textarea
                placeholder="VD: Gia đình, cặp đôi..."
                className="min-h-[80px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                value={form.best_for}
                onChange={(e) =>
                  setForm({ ...form, best_for: e.target.value })
                }
              />
            </div>
          </AdminFormCard>
        </div>

        <div className="space-y-8">
          <AdminFormCard
            title="Hình ảnh quảng bá"
            icon={
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <ImageIcon size={18} />
              </div>
            }
            bodyClassName="p-6"
          >
            <ImageUpload
              multiple
              maxFiles={5}
              label="Thêm ảnh tour"
              value={form.images}
              onChange={(urls) => setForm({ ...form, images: urls as string[] })}
            />
          </AdminFormCard>

          <AdminFormCard bodyClassName="space-y-6 p-6">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-blue-600">
                <Clock size={16} /> Thời lượng
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Số ngày
                  </span>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:bg-white"
                    value={form.duration_days === 0 ? "" : form.duration_days}
                    placeholder="1"
                    onChange={(e) => {
                      const value = Math.max(1, Number(e.target.value));
                      setForm({ ...form, duration_days: value });
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Số đêm
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:bg-white"
                    value={form.duration_nights === 0 ? "" : form.duration_nights}
                    placeholder="0"
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value));
                      setForm({ ...form, duration_nights: value });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-50 pt-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-red-600">
                <AlertTriangle size={16} /> Quản lý chốt khách
              </h3>
              <div className="space-y-1">
                <span className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                  Chốt trước (giờ)
                </span>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 pl-9 text-sm font-bold outline-none transition-all focus:border-rose-300 focus:bg-white"
                    value={form.cut_off_hours}
                    placeholder="24"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cut_off_hours:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <p className="ml-1 mt-1 text-[10px] italic text-slate-400">
                  * Tour sẽ tự động ẩn trên website trước giờ khởi hành X tiếng.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-50 pt-6">
              <PriceInput
                label="Giá cơ bản"
                value={form.base_price}
                onChange={(value) => setForm({ ...form, base_price: value })}
                placeholder="Ví dụ: 5.000.000"
              />
            </div>
          </AdminFormCard>

          <button
            onClick={handleCreate}
            disabled={saving}
            className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            <span>Hoàn tất & Tạo Tour</span>
          </button>
        </div>
      </div>

    </div>
  );
}
