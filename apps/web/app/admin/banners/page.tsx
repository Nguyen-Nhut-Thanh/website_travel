"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AdminTable } from "@/components/admin/AdminTable";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useToast } from "@/components/common/Toast";
import { adminFetch } from "@/lib/adminFetch";
import { confirmAction } from "@/lib/admin/confirm";

type BannerItem = {
  banner_id: number;
  location_name?: string | null;
  header?: string | null;
  description?: string | null;
  image_url?: string | null;
  status: number;
};

export default function AdminBannersPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BannerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/banners/admin");
      if (res.ok) {
        setItems(await res.json());
      }
    } catch {
      showError("Lỗi tải danh sách banner");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (item: BannerItem) => {
    if (!confirmAction("Bạn có chắc chắn muốn xóa banner này?")) {
      return;
    }

    try {
      const res = await adminFetch(`/banners/admin/${item.banner_id}`, { method: "DELETE" });
      if (res.ok) {
        success("Đã xóa banner thành công");
        setItems((current) => current.filter((banner) => banner.banner_id !== item.banner_id));
      } else {
        showError("Không thể xóa banner.");
      }
    } catch {
      showError("Lỗi kết nối máy chủ");
    }
  };

  const normalizedSearch = searchTerm.toLowerCase();
  const filteredItems = items.filter(
    (item) =>
      (item.header?.toLowerCase() || "").includes(normalizedSearch) ||
      (item.location_name?.toLowerCase() || "").includes(normalizedSearch),
  );

  const columns = [
    {
      header: "STT",
      render: (_: BannerItem, index: number) => (
        <span className="font-medium text-slate-400">{String(index + 1).padStart(2, "0")}</span>
      ),
    },
    {
      header: "Hình ảnh",
      render: (item: BannerItem) => (
        <div className="h-12 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
          <ImageWithFallback
            src={item.image_url || undefined}
            alt={item.header || "Banner"}
            className="h-full w-full object-cover"
          />
        </div>
      ),
    },
    {
      header: "Nội dung",
      render: (item: BannerItem) => (
        <div className="flex max-w-xs flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            {item.location_name}
          </span>
          <span className="line-clamp-1 font-bold text-slate-900">{item.header}</span>
          <span className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.description}</span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      align: "center" as const,
      render: (item: BannerItem) =>
        item.status === 1 ? (
          <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            <Eye size={12} /> Hiển thị
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <EyeOff size={12} /> Đang ẩn
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý Banners"
        description="Banners quảng bá trên trang chủ và các trang đích."
        primaryAction={{
          label: "Thêm banner mới",
          onClick: () => router.push("/admin/banners/new"),
        }}
      />

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm tên banner hoặc địa điểm..."
      />

      <AdminTable
        items={filteredItems}
        columns={columns}
        loading={loading}
        rowKey={(item) => item.banner_id}
        onEdit={(item) => router.push(`/admin/banners/${item.banner_id}`)}
        onDelete={handleDelete}
        emptyMessage="Không tìm thấy banner nào phù hợp"
      />
    </div>
  );
}
