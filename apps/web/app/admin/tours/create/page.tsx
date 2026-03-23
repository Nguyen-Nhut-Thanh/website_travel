"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";
import { 
  Save, 
  MapPin, 
  Clock, 
  Info, 
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Utensils,
  Ticket,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PriceInput } from "@/components/admin/PriceInput";
import { AdminBackPageHeader } from "@/components/admin/AdminBackPageHeader";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { useToast } from "@/components/common/Toast";
import FormFieldLabel from "@/components/common/FormFieldLabel";

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
    sightseeing_summary: "",
    cuisine_info: "",
    promotion_info: "",
    best_for: "",
    cut_off_hours: "" as number | ""
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const [lRes, trRes] = await Promise.all([
          adminFetch("/admin/locations"),
          adminFetch("/admin/transports")
        ]);

        if (lRes.ok) {
          const lData = await lRes.json();
          setLocations(lData.items || []);
          if (lData.items?.length > 0) setForm(f => ({...f, departure_location: lData.items[0].location_id}));
        }
        if (trRes.ok) {
          const trData = await trRes.json();
          setTransports(trData.items || []);
          if (trData.items?.length > 0) setForm(f => ({...f, transport_id: trData.items[0].transport_id}));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation đẹp mắt
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
        cut_off_hours: form.cut_off_hours === "" ? undefined : Number(form.cut_off_hours),
      };

      const res = await adminFetch("/admin/tours", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        success("Đã tạo tour mới thành công!");
        router.push("/admin/tours");
      } else {
        const errorData = await res.json().catch(() => ({ message: "Lỗi không xác định" }));
        showError(errorData.message || "Lỗi khi tạo tour");
      }
    } catch {
      showError("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      <AdminBackPageHeader
        title="Thêm Tour Mới"
        description="Khởi tạo hành trình du lịch mới cho khách hàng."
        onBack={() => router.push("/admin/tours")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General Info Card */}
          <AdminFormCard
            title="Thông tin cơ bản"
            icon={
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Info size={18} />
              </div>
            }
            bodyClassName="p-8 space-y-6"
          >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormFieldLabel>Mã Tour</FormFieldLabel>
                  <input 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="VD: VN-MB-001"
                    value={form.code}
                    onChange={e => setForm({...form, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <FormFieldLabel>Loại Tour</FormFieldLabel>
                  <select 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium appearance-none"
                    value={form.tour_type}
                    onChange={e => setForm({...form, tour_type: e.target.value})}
                  >
                    <option value="domestic">Trong nước</option>
                    <option value="outbound">Nước ngoài</option>
                    <option value="international">Quốc tế</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <FormFieldLabel>Tên Tour</FormFieldLabel>
                  <input 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="VD: Tour Đà Lạt 3N2Đ - Khám phá Cao Nguyên"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <FormFieldLabel>Điểm khởi hành</FormFieldLabel>
                  <select 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                    value={form.departure_location}
                    onChange={e => setForm({...form, departure_location: Number(e.target.value)})}
                  >
                    {locations.map(l => (
                      <option key={l.location_id} value={l.location_id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <FormFieldLabel>Phương tiện</FormFieldLabel>
                  <select 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                    value={form.transport_id}
                    onChange={e => setForm({...form, transport_id: Number(e.target.value)})}
                  >
                    {transports.map(t => (
                      <option key={t.transport_id} value={t.transport_id}>{t.name} ({t.transport_type})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destinations Selection */}
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <FormFieldLabel>Các điểm đến</FormFieldLabel>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Đã chọn: {form.destinations.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {locations
                    .filter(loc => {
                      const isVN = loc.country_code === 'VN';
                      
                      if (form.tour_type === 'domestic') {
                        return isVN; // Chỉ Việt Nam
                      } else if (form.tour_type === 'outbound') {
                        return !isVN; // Chỉ Nước ngoài (không VN)
                      } else {
                        return true; // Quốc tế -> Hiện hết
                      }
                    })
                    .map((loc) => {
                      const isSelected = form.destinations.includes(loc.location_id);
                      return (
                        <label key={loc.location_id} className={`flex items-center gap-2 cursor-pointer group p-2 rounded-xl transition-all border ${isSelected ? 'bg-white border-blue-100 shadow-sm' : 'border-transparent hover:bg-white'}`}>
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({...form, destinations: [...form.destinations, loc.location_id]});
                              } else {
                                setForm({...form, destinations: form.destinations.filter(id => id !== loc.location_id)});
                              }
                            }}
                          />
                          <span className={`text-[11px] font-medium text-slate-600 ${isSelected ? 'text-blue-600 font-extrabold' : ''}`}>
                            {loc.name}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-50">
                <FormFieldLabel>Mô tả hành trình</FormFieldLabel>
                <textarea 
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none font-medium min-h-[120px] resize-none"
                  placeholder="Giới thiệu sơ lược về tour du lịch này..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
          </AdminFormCard>

          {/* Details Section */}
          <AdminFormCard bodyClassName="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-blue-500" /> Điểm nổi bật
              </h3>
              <textarea 
                placeholder="Tóm tắt những điểm tham quan chính..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none text-sm min-h-[80px]"
                value={form.sightseeing_summary}
                onChange={e => setForm({...form, sightseeing_summary: e.target.value})}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Utensils size={16} className="text-emerald-500" /> Ẩm thực
              </h3>
              <textarea 
                placeholder="Thông tin về các bữa ăn, đặc sản..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none text-sm min-h-[80px]"
                value={form.cuisine_info}
                onChange={e => setForm({...form, cuisine_info: e.target.value})}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Ticket size={16} className="text-amber-500" /> Khuyến mãi
              </h3>
              <textarea 
                placeholder="Các ưu đãi đi kèm..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none text-sm min-h-[80px]"
                value={form.promotion_info}
                onChange={e => setForm({...form, promotion_info: e.target.value})}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={16} className="text-rose-500" /> Phù hợp với
              </h3>
              <input 
                placeholder="VD: Gia đình, Cặp đôi..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 outline-none text-sm"
                value={form.best_for}
                onChange={e => setForm({...form, best_for: e.target.value})}
              />
            </div>
          </AdminFormCard>
        </div>

        <div className="space-y-8">
          {/* Images Card */}
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
                onChange={(urls) => setForm({...form, images: urls as string[]})}
              />
          </AdminFormCard>

          {/* Pricing & Duration Card */}
          <AdminFormCard bodyClassName="space-y-6 p-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm text-blue-600">
                <Clock size={16} /> Thời lượng
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Số ngày</span>
                  <input 
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white outline-none"
                    value={form.duration_days === 0 ? "" : form.duration_days}
                    placeholder="1"
                    onChange={e => {
                      const val = Math.max(1, Number(e.target.value));
                      setForm({...form, duration_days: val});
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Số đêm</span>
                  <input 
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white outline-none"
                    value={form.duration_nights === 0 ? "" : form.duration_nights}
                    placeholder="0"
                    onChange={e => {
                      const val = Math.max(0, Number(e.target.value));
                      setForm({...form, duration_nights: val});
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
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
                    onChange={e => setForm({
                      ...form,
                      cut_off_hours: e.target.value === "" ? "" : Number(e.target.value),
                    })}
                  />
                </div>
                <p className="ml-1 mt-1 text-[10px] italic text-slate-400">
                  * Tour sẽ tự động ẩn trên website trước giờ khởi hành X tiếng.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <PriceInput 
                label="Giá cơ bản"
                value={form.base_price}
                onChange={val => setForm({...form, base_price: val})}
                placeholder="Ví dụ: 5.000.000"
              />
            </div>
          </AdminFormCard>

          {/* Action Button */}
          <button 
            onClick={handleCreate}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 group"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            <span>Hoàn tất & Tạo Tour</span>
          </button>
        </div>
      </div>
    </div>
  );
}
