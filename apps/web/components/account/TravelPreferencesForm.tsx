"use client";

import { useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { AccountSectionShell } from "@/components/account/AccountSectionShell";
import InlineNotice from "@/components/common/InlineNotice";
import { updateRecommendationProfile } from "@/lib/authApi";
import type { RecommendationProfile } from "@/types/account";

const STYLE_OPTIONS = [
  "Nghỉ dưỡng",
  "Khám phá",
  "Mạo hiểm",
  "Check-in",
  "Gia đình",
];

const THEME_OPTIONS = ["Biển", "Núi", "Thành phố", "Văn hóa", "Ẩm thực"];

function TogglePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

export function TravelPreferencesForm({
  profile,
  onUpdate,
}: {
  profile: RecommendationProfile | null;
  onUpdate: () => void;
}) {
  const initialState = useMemo(
    () => ({
      travel_scope: profile?.travel_scope || "mixed",
      preferred_styles: profile?.preferred_styles || [],
      preferred_themes: profile?.preferred_themes || [],
      budget_band: profile?.budget_band || "5-10tr",
      preferred_duration_band: profile?.preferred_duration_band || "trung-binh",
      preferred_group_type: profile?.preferred_group_type || "couple",
      preferred_departure: profile?.preferred_departure || "TP. Hồ Chí Minh",
      adventure_level: profile?.adventure_level || "vừa phải",
      allow_behavior_tracking: profile?.allow_behavior_tracking ?? true,
      allow_chat_signals: profile?.allow_chat_signals ?? true,
    }),
    [profile],
  );

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const toggleArrayValue = (
    field: "preferred_styles" | "preferred_themes",
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await updateRecommendationProfile(form);
      setSuccess("Đã lưu hồ sơ gợi ý du lịch.");
      onUpdate();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu sở thích.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountSectionShell
      title="Gu Du Lịch AI"
      description="Khai báo thêm gu du lịch để hệ gợi ý hiểu bạn tốt hơn, không cần phụ thuộc hoàn toàn vào lịch sử xem."
    >
      {success ? <InlineNotice tone="success">{success}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Phạm vi du lịch
            </span>
            <select
              value={form.travel_scope}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  travel_scope: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="mixed">Cả trong nước và quốc tế</option>
              <option value="domestic">Ưu tiên trong nước</option>
              <option value="outbound">Ưu tiên quốc tế</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Ngân sách mỗi chuyến
            </span>
            <select
              value={form.budget_band}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  budget_band: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="duoi-5tr">Dưới 5 triệu</option>
              <option value="5-10tr">5 - 10 triệu</option>
              <option value="10-20tr">10 - 20 triệu</option>
              <option value="tren-20tr">Trên 20 triệu</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Kiểu chuyến đi
            </span>
            <select
              value={form.preferred_duration_band}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  preferred_duration_band: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="ngan-ngay">Ngắn ngày</option>
              <option value="trung-binh">Trung bình</option>
              <option value="dai-ngay">Dài ngày</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Đồng hành
            </span>
            <select
              value={form.preferred_group_type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  preferred_group_type: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="solo">Đi một mình</option>
              <option value="couple">Cặp đôi</option>
              <option value="family">Gia đình</option>
              <option value="friends">Nhóm bạn</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Điểm khởi hành thường dùng
            </span>
            <input
              value={form.preferred_departure}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  preferred_departure: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
              placeholder="Ví dụ: TP. Hồ Chí Minh"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Mức mạo hiểm
            </span>
            <select
              value={form.adventure_level}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  adventure_level: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="nhẹ nhàng">Nhẹ nhàng</option>
              <option value="vừa phải">Vừa phải</option>
              <option value="cao">Mạo hiểm cao</option>
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Phong cách thích</p>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((item) => (
              <TogglePill
                key={item}
                active={form.preferred_styles.includes(item)}
                label={item}
                onClick={() => toggleArrayValue("preferred_styles", item)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Chủ đề yêu thích</p>
          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map((item) => (
              <TogglePill
                key={item}
                active={form.preferred_themes.includes(item)}
                label={item}
                onClick={() => toggleArrayValue("preferred_themes", item)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 md:grid-cols-2">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.allow_behavior_tracking}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  allow_behavior_tracking: event.target.checked,
                }))
              }
              className="mt-1"
            />
            <span className="text-sm text-slate-600">
              Cho phép hệ thống dùng lịch sử xem / click / yêu thích để gợi ý tốt hơn.
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.allow_chat_signals}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  allow_chat_signals: event.target.checked,
                }))
              }
              className="mt-1"
            />
            <span className="text-sm text-slate-600">
              Cho phép dùng tín hiệu đã chuẩn hóa từ chatbot, không dùng raw chat history.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-8 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Lưu hồ sơ gợi ý
        </button>
      </form>
    </AccountSectionShell>
  );
}
