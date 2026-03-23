"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Loader2,
  ReceiptText,
  ShieldCheck,
  TicketPercent,
  UserRound,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { API_BASE, getToken } from "@/lib/auth";
import { formatDate, formatVND } from "@/lib/utils";

type Traveler = {
  full_name?: string | null;
  traveler_type?: string | null;
  gender?: string | null;
  dob?: string | null;
};

type PaymentRecord = {
  method?: string | null;
  status?: string | null;
  transaction_code?: string | null;
};

type VoucherRecord = {
  code?: string | null;
};

type BookingDetail = {
  booking_id: number;
  status: string;
  total_amount?: number | string | null;
  discount_amount?: number | string | null;
  adult_count: number;
  child_count: number;
  infant_count: number;
  adult_unit_price?: number | string | null;
  child_unit_price?: number | string | null;
  infant_unit_price?: number | string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  note?: string | null;
  created_at?: string | null;
  paid_at?: string | null;
  tour_schedules?: {
    start_date?: string | null;
    end_date?: string | null;
    tours?: {
      name?: string | null;
      code?: string | null;
      duration_days?: number | null;
      duration_nights?: number | null;
      departure_location?: string | number | null;
      departure_locations?: {
        name?: string | null;
      } | null;
    } | null;
  } | null;
  booking_travelers?: Traveler[];
  payments?: PaymentRecord[];
  vouchers?: VoucherRecord | null;
};

type StatusMeta = {
  label: string;
  className: string;
  icon: LucideIcon;
};

const statusConfig: Record<string, StatusMeta> = {
  pending: {
    label: "Chờ thanh toán",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: WalletCards,
  },
  paid: {
    label: "Đã thanh toán",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: ShieldCheck,
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    icon: ShieldCheck,
  },
  cancelled: {
    label: "Đã hủy",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: ReceiptText,
  },
  completed: {
    label: "Hoàn thành",
    className: "border-slate-200 bg-slate-100 text-slate-700",
    icon: ReceiptText,
  },
};

function getTravelerTypeLabel(type?: string | null) {
  if (type === "ADULT") return "Người lớn";
  if (type === "CHILD") return "Trẻ em";
  if (type === "INFANT") return "Em bé";
  return "Hành khách";
}

function getGenderLabel(gender?: string | null) {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  return "Chưa cập nhật";
}

function getPaymentMethodLabel(method?: string | null) {
  if (method === "vnpay") return "VNPay";
  if (method === "momo") return "MoMo";
  if (method === "bank_transfer") return "Chuyển khoản";
  return "Đang cập nhật";
}

function formatDateTime(value?: string | null) {
  if (!value) return "Đang cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-100 px-6 py-6 sm:px-8">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="font-[family:var(--font-display)] text-lg font-semibold text-slate-950">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function LabelValue({
  label,
  value,
  strong = false,
  className = "",
}: {
  label: string;
  value: string;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-slate-50 px-4 py-4 ${className}`}>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-2 text-sm ${strong ? "font-semibold text-slate-950" : "text-slate-700"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      const token = getToken();
      if (!token) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Không thể tải chi tiết booking.");

        setBooking((await res.json()) as BookingDetail);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Đã xảy ra lỗi khi tải dữ liệu.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) void fetchDetail();
  }, [bookingId, router]);

  const summary = useMemo(() => {
    if (!booking) return null;

    const adultTotal =
      Number(booking.adult_unit_price || 0) * Number(booking.adult_count || 0);
    const childTotal =
      Number(booking.child_unit_price || 0) * Number(booking.child_count || 0);
    const infantTotal =
      Number(booking.infant_unit_price || 0) * Number(booking.infant_count || 0);
    const subtotal = adultTotal + childTotal + infantTotal;
    const discount = Number(booking.discount_amount || 0);
    const payment = booking.payments?.[0];
    const isPaid =
      booking.status === "paid" ||
      booking.status === "completed" ||
      !!booking.paid_at ||
      payment?.status === "completed";

    return {
      adultTotal,
      childTotal,
      infantTotal,
      subtotal,
      discount,
      finalTotal: Number(booking.total_amount || 0),
      payment,
      isPaid,
    };
  }, [booking]);

  const handleRepay = async () => {
    if (!booking) return;

    const token = getToken();
    if (!token) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    try {
      setPaying(true);
      const res = await fetch(`${API_BASE}/payment/create-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.booking_id,
          amount: Number(booking.total_amount || 0),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.message || "Không tạo được link thanh toán.");
      }

      window.location.href = data.paymentUrl;
    } catch (payError) {
      setError(
        payError instanceof Error
          ? payError.message
          : "Không thể khởi tạo thanh toán.",
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error || !booking || !summary) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-semibold text-slate-950">
            {error || "Không tìm thấy booking."}
          </p>
          <Link
            href="/account"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={16} />
            Về account
          </Link>
        </div>
      </div>
    );
  }

  const statusMeta = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = statusMeta.icon;
  const tour = booking.tour_schedules?.tours;
  const schedule = booking.tour_schedules;
  const departureName =
    tour?.departure_locations?.name ||
    (typeof tour?.departure_location === "string" &&
    Number.isNaN(Number(tour.departure_location))
      ? tour.departure_location
      : null) ||
    "Đang cập nhật";
  const voucherCode = booking.vouchers?.code;
  const canPay =
    !summary.isPaid &&
    (booking.status === "pending" || booking.status === "confirmed");

  return (
    <main className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#f3f6fb_100%)] pb-16">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/account"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách booking
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#334155_100%)] px-6 py-6 text-white sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/55">
                  Chi tiết booking
                </p>
                <h1 className="mt-2 font-[family:var(--font-display)] text-2xl font-semibold">
                  {tour?.name || "Booking detail"}
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Mã booking #{booking.booking_id}
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusMeta.className}`}
              >
                <StatusIcon size={16} />
                {statusMeta.label}
              </div>
            </div>
          </div>

          <Section
            icon={CalendarDays}
            title="Thông tin tour"
            subtitle="Các thông tin cơ bản của tour và lịch khởi hành."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="md:col-span-2 xl:col-span-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-5 sm:px-5">
                  <div className="min-w-0">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Tên tour
                    </p>
                    <p className="mt-2 break-words font-[family:var(--font-display)] text-xl font-semibold leading-tight text-slate-950">
                      {tour?.name || "Đang cập nhật"}
                    </p>
                  </div>
                </div>
              </div>

              <LabelValue label="Mã tour" value={tour?.code || "Đang cập nhật"} strong />
              <LabelValue
                label="Ngày khởi hành"
                value={formatDate(schedule?.start_date)}
                strong
              />
              <LabelValue
                label="Thời gian"
                value={`${tour?.duration_days || 0} ngày ${tour?.duration_nights || 0} đêm`}
                strong
              />
              <LabelValue
                label="Điểm khởi hành"
                value={departureName}
                strong
                className="border border-slate-100"
              />
            </div>
          </Section>

          <Section
            icon={UserRound}
            title="Thông tin người đặt tour"
            subtitle="Người nhận thông báo, xác nhận và liên hệ khi cần."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <LabelValue label="Họ và tên" value={booking.contact_name || "Đang cập nhật"} strong />
              <LabelValue label="Số điện thoại" value={booking.contact_phone || "Đang cập nhật"} strong />
              <div className="md:col-span-2">
                <LabelValue label="Email" value={booking.contact_email || "Đang cập nhật"} />
              </div>
              {booking.note ? (
                <div className="md:col-span-2">
                  <LabelValue label="Ghi chú" value={booking.note} />
                </div>
              ) : null}
            </div>
          </Section>

          <Section
            icon={Users}
            title="Danh sách hành khách"
            subtitle="Thông tin từng hành khách đi cùng trong booking này."
          >
            {booking.booking_travelers && booking.booking_travelers.length > 0 ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] bg-slate-50 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <p>Họ tên</p>
                  <p>Loại khách</p>
                  <p>Giới tính</p>
                  <p>Ngày sinh</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {booking.booking_travelers.map((traveler, index) => (
                    <div
                      key={`${traveler.full_name || "traveler"}-${index}`}
                      className="grid grid-cols-1 gap-2 px-4 py-4 text-sm text-slate-700 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-4"
                    >
                      <p className="font-semibold text-slate-950">
                        {traveler.full_name || `Hành khách ${index + 1}`}
                      </p>
                      <p>{getTravelerTypeLabel(traveler.traveler_type)}</p>
                      <p>{getGenderLabel(traveler.gender)}</p>
                      <p>{formatDate(traveler.dob)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Chưa có thông tin hành khách chi tiết.
              </div>
            )}
          </Section>

          <Section
            icon={TicketPercent}
            title="Chi tiết hóa đơn"
            subtitle="Cấu trúc giá theo số lượng khách, ưu đãi và tổng thanh toán."
          >
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                <div className="grid grid-cols-[1.6fr_0.8fr_1fr_1fr] bg-slate-50 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <p>Hạng mục</p>
                  <p>Số lượng</p>
                  <p>Đơn giá</p>
                  <p className="text-right">Thành tiền</p>
                </div>
                <div className="divide-y divide-slate-100 text-sm">
                  <div className="grid grid-cols-1 gap-2 px-4 py-4 md:grid-cols-[1.6fr_0.8fr_1fr_1fr] md:gap-4">
                    <p className="font-medium text-slate-900">Người lớn</p>
                    <p>{booking.adult_count}</p>
                    <p>{formatVND(booking.adult_unit_price)}</p>
                    <p className="font-semibold text-slate-950 md:text-right">
                      {formatVND(summary.adultTotal)}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 px-4 py-4 md:grid-cols-[1.6fr_0.8fr_1fr_1fr] md:gap-4">
                    <p className="font-medium text-slate-900">Trẻ em</p>
                    <p>{booking.child_count}</p>
                    <p>{formatVND(booking.child_unit_price)}</p>
                    <p className="font-semibold text-slate-950 md:text-right">
                      {formatVND(summary.childTotal)}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 px-4 py-4 md:grid-cols-[1.6fr_0.8fr_1fr_1fr] md:gap-4">
                    <p className="font-medium text-slate-900">Em bé</p>
                    <p>{booking.infant_count}</p>
                    <p>{formatVND(booking.infant_unit_price)}</p>
                    <p className="font-semibold text-slate-950 md:text-right">
                      {formatVND(summary.infantTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4">
                  <LabelValue
                    label="Ưu đãi / giảm giá"
                    value={
                      summary.discount > 0
                        ? `Giảm ${formatVND(summary.discount)}`
                        : "Không có ưu đãi áp dụng"
                    }
                  />
                  <LabelValue
                    label="Voucher"
                    value={voucherCode || "Không sử dụng voucher"}
                  />
                </div>

                <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Tạm tính</span>
                      <span>{formatVND(summary.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Giảm giá</span>
                      <span>- {formatVND(summary.discount)}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Giá lúc thanh toán
                          </p>
                          <p className="mt-2 text-3xl font-bold tracking-tight text-sky-700">
                            {formatVND(summary.finalTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Thanh toán bằng</span>
                        <span className="font-semibold text-slate-950">
                          {getPaymentMethodLabel(summary.payment?.method)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-slate-500">Trạng thái</span>
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                        >
                          <StatusIcon size={14} />
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-slate-500">
                        <span>Ngày tạo đơn</span>
                        <span>{formatDateTime(booking.created_at)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-slate-500">
                        <span>Giao dịch</span>
                        <span>{summary.payment?.transaction_code || "Đang cập nhật"}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-slate-500">
                        <span>Ghi nhận thanh toán</span>
                        <span>
                          {summary.isPaid
                            ? booking.paid_at
                              ? formatDateTime(booking.paid_at)
                              : "Đã thanh toán"
                            : "Chưa thanh toán"}
                        </span>
                      </div>
                    </div>

                    {canPay ? (
                      <button
                        type="button"
                        onClick={handleRepay}
                        disabled={paying}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
                      >
                        {paying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        Thanh toán ngay
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
