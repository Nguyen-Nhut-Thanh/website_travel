"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Save, ScrollText } from "lucide-react";
import { AdminBackPageHeader } from "@/components/admin/AdminBackPageHeader";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { TourPoliciesAccordionEditor } from "@/components/admin/tour-detail/TourPoliciesAccordionEditor";
import { useToast } from "@/components/common/Toast";
import {
  normalizeTourDetailForm,
  type TourDetailForm,
} from "@/lib/admin/tourDetail";
import { getAdminTourDetail, updateAdminTour } from "@/lib/admin/toursApi";

export default function AdminTourPoliciesPage() {
  const { id } = useParams();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tour, setTour] = useState<TourDetailForm | null>(null);

  useEffect(() => {
    const loadTour = async () => {
      setLoading(true);
      try {
        const data = await getAdminTourDetail<TourDetailForm>(String(id));
        setTour(normalizeTourDetailForm(data.tour));
      } catch (requestError) {
        showError(
          requestError instanceof Error ? requestError.message : "Lỗi kết nối server",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadTour();
  }, [id, showError]);

  const handleSave = async () => {
    if (!tour) return;

    setSaving(true);
    setSaved(false);
    try {
      await updateAdminTour(String(id), {
        policy_contents: tour.policy_contents || {},
      });
      setSaved(true);
      showSuccess("Đã lưu lưu ý tour");
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
        title="Lưu ý tour"
        description={`Thiết lập nội dung hiển thị cho tour ${tour.name || ""}.`}
        onBack={() => router.push("/admin/tours")}
        actions={
          saved ? (
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
              <CheckCircle2 size={18} /> Đã lưu
            </span>
          ) : null
        }
      />

      <AdminFormCard
        title={tour.name || "Lưu ý tour"}
        icon={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ScrollText size={18} />
          </div>
        }
        bodyClassName="space-y-6 p-6"
      >
        <TourPoliciesAccordionEditor
          value={tour.policy_contents}
          onChange={(policy_contents) =>
            setTour((prev) => (prev ? { ...prev, policy_contents } : prev))
          }
        />
      </AdminFormCard>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Lưu lưu ý tour
        </button>
      </div>
    </div>
  );
}
