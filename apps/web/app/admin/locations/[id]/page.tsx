"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AdminBackPageHeader } from "@/components/admin/AdminBackPageHeader";
import { LocationDetailsCard } from "@/components/admin/location-detail/LocationDetailsCard";
import { LocationHierarchyCard } from "@/components/admin/location-detail/LocationHierarchyCard";
import { LocationImageSidebar } from "@/components/admin/location-detail/LocationImageSidebar";
import { LocationLevelSelector } from "@/components/admin/location-detail/LocationLevelSelector";
import InlineNotice from "@/components/common/InlineNotice";
import { useToast } from "@/components/common/Toast";
import { uploadAuthenticatedFile } from "@/lib/uploadApi";
import { adminFetch } from "@/lib/adminFetch";
import { API_BASE, getToken } from "@/lib/auth";
import {
  getAdminLocationDetail,
  saveAdminLocation,
} from "@/lib/admin/locationsApi";
import {
  LOCATION_LEVEL_LABELS,
  buildLocationHierarchyState,
  createDefaultLocationDetailForm,
  fetchLocationOptionsByLevel,
  slugifyLocationName,
  type LocationDetailForm,
} from "@/lib/admin/locationDetail";
import type { AdminLocationItem } from "@/types/admin-location";

export default function AdminLocationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const isNew = id === "new";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<LocationDetailForm>(
    createDefaultLocationDetailForm,
  );
  const [level3Id, setLevel3Id] = useState("");
  const [level4Id, setLevel4Id] = useState("");
  const [level5Id, setLevel5Id] = useState("");
  const [level6Id, setLevel6Id] = useState("");
  const [level3List, setLevel3List] = useState<AdminLocationItem[]>([]);
  const [level4List, setLevel4List] = useState<AdminLocationItem[]>([]);
  const [level5List, setLevel5List] = useState<AdminLocationItem[]>([]);
  const [level6List, setLevel6List] = useState<AdminLocationItem[]>([]);
  const [loadingL3, setLoadingL3] = useState(false);
  const [loadingL4, setLoadingL4] = useState(false);
  const [loadingL5, setLoadingL5] = useState(false);
  const [loadingL6, setLoadingL6] = useState(false);
  const [usageSummary, setUsageSummary] =
    useState<AdminLocationItem["usage_summary"]>(null);

  useEffect(() => {
    if (form.name && isNew) {
      setForm((prev) => ({ ...prev, slug: slugifyLocationName(form.name) }));
    }
  }, [form.name, isNew]);

  useEffect(() => {
    if (level3Id && form.level_id > 3) {
      const country = level3List.find(
        (item) => String(item.location_id) === level3Id,
      );
      if (country?.country_code) {
        setForm((prev) => ({
          ...prev,
          country_code: country.country_code || prev.country_code,
        }));
      }
    }
  }, [level3Id, form.level_id, level3List]);

  const fetchByLevel = (level: number, parent?: string | number) => {
    return fetchLocationOptionsByLevel(adminFetch, level, parent);
  };

  const applyHierarchyState = (
    state: Awaited<ReturnType<typeof buildLocationHierarchyState>>,
  ) => {
    setLevel3Id(state.level3Id);
    setLevel4Id(state.level4Id);
    setLevel5Id(state.level5Id);
    setLevel6Id(state.level6Id);
    setLevel4List(state.level4List);
    setLevel5List(state.level5List);
    setLevel6List(state.level6List);
  };

  useEffect(() => {
    const init = async () => {
      setLoadingL3(true);
      setLevel3List(await fetchByLevel(3));
      setLoadingL3(false);

      if (!isNew) {
        try {
          const data = await getAdminLocationDetail<{
            name?: string;
            slug?: string;
            location_type?: string;
            level_id?: number;
            parent_id?: string | number;
            country_code?: string;
            note?: string;
            image_url?: string;
            is_featured?: boolean;
            featured_order?: number | null;
            usage_summary?: AdminLocationItem["usage_summary"];
          }>(String(id));

          setForm({
            name: data.name || "",
            slug: data.slug || "",
            location_type: data.location_type || "city_destination",
            level_id: data.level_id || 3,
            parent_id: data.parent_id || "",
            country_code: data.country_code || "VN",
            note: data.note || "",
            image_url: data.image_url || "",
            is_featured: data.is_featured || false,
            featured_order: data.featured_order || null,
          });
          setUsageSummary(data.usage_summary || null);

          if (data.parent_id) {
            applyHierarchyState(
              await buildLocationHierarchyState(
                adminFetch,
                data.level_id || 3,
                Number(data.parent_id),
              ),
            );
          }
        } catch {}
      }

      setLoading(false);
    };

    void init();
  }, [id, isNew]);

  useEffect(() => {
    if (level3Id && form.level_id >= 5) {
      setLoadingL4(true);
      void fetchByLevel(4, level3Id).then((items) => {
        setLevel4List(items);
        setLoadingL4(false);
      });
    } else if (form.level_id !== 4) {
      setLevel4List([]);
      setLevel4Id("");
    }
  }, [level3Id, form.level_id]);

  useEffect(() => {
    if (level4Id && form.level_id >= 6) {
      setLoadingL5(true);
      void fetchByLevel(5, level4Id).then((items) => {
        setLevel5List(items);
        setLoadingL5(false);
      });
    } else if (form.level_id !== 5) {
      setLevel5List([]);
      setLevel5Id("");
    }
  }, [level4Id, form.level_id]);

  useEffect(() => {
    if (level5Id && form.level_id >= 7) {
      setLoadingL6(true);
      void fetchByLevel(6, level5Id).then((items) => {
        setLevel6List(items);
        setLoadingL6(false);
      });
    } else if (form.level_id !== 6) {
      setLevel6List([]);
      setLevel6Id("");
    }
  }, [level5Id, form.level_id]);

  useEffect(() => {
    if (form.level_id === 3) setForm((prev) => ({ ...prev, parent_id: "" }));
    else if (form.level_id === 4)
      setForm((prev) => ({ ...prev, parent_id: level3Id }));
    else if (form.level_id === 5)
      setForm((prev) => ({ ...prev, parent_id: level4Id }));
    else if (form.level_id === 6)
      setForm((prev) => ({ ...prev, parent_id: level5Id }));
    else if (form.level_id === 7)
      setForm((prev) => ({ ...prev, parent_id: level6Id }));
  }, [form.level_id, level3Id, level4Id, level5Id, level6Id]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        `${API_BASE}/admin/locations/upload`,
        token,
        file,
        "Lỗi khi upload ảnh",
      );
      setForm((prev) => ({ ...prev, image_url: data?.url || "" }));
    } catch {
      showError("Lỗi kết nối upload");
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    if (!form.name) {
      showError("Vui lòng nhập tên địa điểm");
      return false;
    }
    if (form.level_id > 3) {
      if (!level3Id) {
        showError("Vui lòng chọn Quốc gia");
        return false;
      }
      if (form.level_id >= 5 && !level4Id) {
        showError("Vui lòng chọn Miền");
        return false;
      }
      if (form.level_id >= 6 && !level5Id) {
        showError("Vui lòng chọn Tỉnh / Thành phố");
        return false;
      }
      if (form.level_id >= 7 && !level6Id) {
        showError("Vui lòng chọn Thành phố / Điểm đến");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await saveAdminLocation(isNew ? null : String(id), form);
      success("Đã lưu dữ liệu thành công!");
      router.push("/admin/locations");
    } catch (requestError) {
      showError(
        requestError instanceof Error
          ? requestError.message
          : "Lỗi kết nối server",
      );
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
        title={isNew ? "Thêm địa điểm mới" : "Cập nhật địa điểm"}
        onBack={() => router.push("/admin/locations")}
        meta={
          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-600">
              <Layers size={10} />
              {LOCATION_LEVEL_LABELS[form.level_id]}
            </div>
            {!isNew && (
              <span className="text-[10px] font-bold text-slate-400">
                ID: {id}
              </span>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          {!isNew && usageSummary && !usageSummary.can_change_structure && (
            <InlineNotice tone="error">
              Địa điểm này đang được ràng buộc dữ liệu nên không thể đổi cấp,
              đổi cha, mã quốc gia hoặc loại địa điểm. Bạn vẫn có thể cập nhật
              tên, mô tả, ảnh và trạng thái nổi bật.
            </InlineNotice>
          )}

          <LocationLevelSelector
            form={form}
            onLevelChange={(level) => {
              setForm((prev) => ({ ...prev, level_id: level, parent_id: "" }));
              setLevel3Id("");
              setLevel4Id("");
              setLevel5Id("");
              setLevel6Id("");
            }}
          />

          {form.level_id > 3 && (
            <LocationHierarchyCard
              form={form}
              level3Id={level3Id}
              level4Id={level4Id}
              level5Id={level5Id}
              level6Id={level6Id}
              level3List={level3List}
              level4List={level4List}
              level5List={level5List}
              level6List={level6List}
              loadingL3={loadingL3}
              loadingL4={loadingL4}
              loadingL5={loadingL5}
              loadingL6={loadingL6}
              onLevel3Change={setLevel3Id}
              onLevel4Change={setLevel4Id}
              onLevel5Change={setLevel5Id}
              onLevel6Change={setLevel6Id}
            />
          )}

          <LocationDetailsCard
            form={form}
            isNew={isNew}
            level3Id={level3Id}
            level3List={level3List}
            onFormChange={setForm}
          />
        </div>

        <div className="space-y-8 lg:col-span-4">
          <LocationImageSidebar
            form={form}
            uploading={uploading}
            saving={saving}
            fileInputRef={fileInputRef}
            onFormChange={setForm}
            onFileUpload={handleFileUpload}
            onCancel={() => router.push("/admin/locations")}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
