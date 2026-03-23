"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";
import { getToken, API_BASE } from "@/lib/auth";
import { useToast } from "@/components/common/Toast";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Camera, 
  X,
  Globe,
  Type,
  AlignLeft,
  ToggleLeft
} from "lucide-react";

export default function AdminBannerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const isNew = id === "new";
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    location_name: "",
    header: "",
    description: "",
    image_url: "",
    link_to: "",
    status: 1
  });

  useEffect(() => {
    if (!isNew) {
      const loadData = async () => {
        try {
          const res = await adminFetch(`/banners/admin/${id}`);
          if (res.ok) {
            const data = await res.json();
            setForm({
              location_name: data.location_name || "",
              header: data.header || "",
              description: data.description || "",
              image_url: data.image_url || "",
              link_to: data.link_to || "",
              status: data.status || 1
            });
          }
        } catch (error) {
          console.error(error);
          showError("Lỗi tải thông tin banner");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, isNew, showError]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/banners/admin/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken() || ""}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, image_url: data.url }));
        success("Tải ảnh lên thành công");
      } else {
        showError("Lỗi khi upload ảnh");
      }
    } catch {
      showError("Lỗi kết nối upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isNew ? "/banners/admin" : `/banners/admin/${id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(form),
      });
      if (res.ok) {
        success(isNew ? "Đã tạo banner mới thành công" : "Đã cập nhật banner");
        router.push("/admin/banners");
      } else {
        showError("Lỗi khi lưu dữ liệu");
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header - Dashboard Standard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/admin/banners")}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isNew ? "Thêm Banner Mới" : "Chỉnh sửa Banner"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Cấu hình nội dung và hình ảnh hiển thị trên trang chủ.</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || !form.header || !form.image_url}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />}
          {isNew ? "Hoàn tất & Lưu" : "Lưu thay đổi"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-4">Nội dung hiển thị</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Globe size={14} className="text-slate-400" /> Tên địa điểm
                </label>
                <input 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="VD: Vịnh Hạ Long"
                  value={form.location_name}
                  onChange={e => setForm({...form, location_name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Type size={14} className="text-slate-400" /> Tiêu đề chính
                </label>
                <input 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="VD: Khám phá kỳ quan thế giới"
                  value={form.header}
                  onChange={e => setForm({...form, header: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <AlignLeft size={14} className="text-slate-400" /> Mô tả ngắn
              </label>
              <textarea 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-h-[120px] resize-none"
                placeholder="Nội dung mô tả banner..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-4">Hình ảnh</h2>
            
            <div 
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative aspect-[16/9] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${form.image_url ? 'border-transparent' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-300'}`}
            >
              {form.image_url ? (
                <>
                  <img src={form.image_url} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <>
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  ) : (
                    <>
                      <Camera className="text-slate-400 mb-2" size={32} />
                      <span className="text-xs font-bold text-slate-500">Tải ảnh lên</span>
                      <p className="text-[10px] text-slate-400 mt-1">Khuyên dùng tỷ lệ 16:9</p>
                    </>
                  )}
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            {form.image_url && (
              <button 
                onClick={() => setForm({...form, image_url: ""})}
                className="w-full py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-rose-100"
              >
                <X size={14} /> Gỡ bỏ ảnh hiện tại
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-4">Cài đặt hiển thị</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <ToggleLeft size={14} className="text-slate-400" /> Trạng thái
              </label>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none appearance-none"
                value={form.status}
                onChange={e => setForm({...form, status: Number(e.target.value)})}
              >
                <option value={1}>Đang hiển thị</option>
                <option value={0}>Đang ẩn</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
