"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  TicketPercent,
  UserRound,
  Wallet,
} from "lucide-react";
import InlineNotice from "@/components/common/InlineNotice";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { fetchMe, getToken } from "@/lib/auth";
import { getPublicTourDetail, publicFetch } from "@/lib/publicFetch";
import { formatDate, formatVND } from "@/lib/utils";
import type { PublicTourDetail, TourSchedule } from "@/types/tour";

type TravelerType = "adult" | "child" | "infant";
type PaymentMethod = "vnpay" | "momo" | "bank_transfer";

type TravelerForm = {
  fullName: string;
  gender: "male" | "female";
  type: TravelerType;
  birthday: string;
};

type VoucherValidationResult = {
  voucher_id: number;
  code: string;
  discountAmount: number;
  finalAmount?: number;
};

type VoucherValidationApiResponse = {
  voucher_id: number;
  code: string;
  discount_amount: number;
  final_amount?: number;
};

type UserProfileLite = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
}> = [
  {
    id: "vnpay",
    label: "VNPay",
    description: "Thanh toán online qua ATM, QR ngân hàng, thẻ nội địa.",
    icon: CreditCard,
  },
  {
    id: "momo",
    label: "MoMo",
    description: "Thanh toán nhanh trên điện thoại, phù hợp mobile-first.",
    icon: Wallet,
  },
  {
    id: "bank_transfer",
    label: "Chuyển khoản",
    description: "Giữ chỗ trước, chuyển khoản xác nhận sau.",
    icon: ShieldCheck,
  },
];

function getUnitPrice(schedule: TourSchedule | null, type: TravelerType) {
  const matchedPrice = schedule?.tour_schedule_prices?.find(
    (item) => item.passenger_type === type,
  );

  if (matchedPrice) {
    return Number(matchedPrice.price);
  }

  if (type === "adult") {
    return Number(schedule?.price ?? 0);
  }

  return 0;
}

function buildTravelers(
  adultCount: number,
  childCount: number,
  infantCount: number,
) {
  const travelers: TravelerForm[] = [];

  for (let index = 0; index < adultCount; index += 1) {
    travelers.push({
      fullName: "",
      gender: "male",
      type: "adult",
      birthday: "",
    });
  }

  for (let index = 0; index < childCount; index += 1) {
    travelers.push({
      fullName: "",
      gender: "male",
      type: "child",
      birthday: "",
    });
  }

  for (let index = 0; index < infantCount; index += 1) {
    travelers.push({
      fullName: "",
      gender: "male",
      type: "infant",
      birthday: "",
    });
  }

  return travelers;
}

function getTravelerLabel(type: TravelerType) {
  if (type === "adult") return "Người lớn";
  if (type === "child") return "Trẻ em";
  return "Em bé";
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tourId = searchParams.get("tourId");
  const scheduleIdParam = searchParams.get("scheduleId");

  const [loading, setLoading] = useState(true);
  const [tour, setTour] = useState<PublicTourDetail | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | null>(
    null,
  );
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [travelers, setTravelers] = useState<TravelerForm[]>(
    buildTravelers(1, 0, 0),
  );
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherResult, setVoucherResult] =
    useState<VoucherValidationResult | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("vnpay");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitTone, setSubmitTone] = useState<"error" | "success">("success");

  useEffect(() => {
    if (!tourId) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [tourData, me] = await Promise.all([
          getPublicTourDetail<PublicTourDetail>(tourId),
          fetchMe(),
        ]);

        if (!active) return;

        const scheduleId = scheduleIdParam ? Number(scheduleIdParam) : null;
        const schedule =
          tourData.tour_schedules.find(
            (item) => item.tour_schedule_id === scheduleId,
          ) ??
          tourData.tour_schedules[0] ??
          null;

        setTour(tourData);
        setSelectedSchedule(schedule);

        if (me) {
          const profile = me as UserProfileLite;
          setContactName(profile.full_name || "");
          setContactEmail(profile.email || "");
          setContactPhone(profile.phone || "");
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setTour(null);
          setSelectedSchedule(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [scheduleIdParam, tourId]);

  useEffect(() => {
    setTravelers(buildTravelers(adultCount, childCount, infantCount));
  }, [adultCount, childCount, infantCount]);

  const pricing = useMemo(() => {
    const adultUnitPrice = getUnitPrice(selectedSchedule, "adult");
    const childUnitPrice = getUnitPrice(selectedSchedule, "child");
    const infantUnitPrice = getUnitPrice(selectedSchedule, "infant");
    const subtotal =
      adultUnitPrice * adultCount +
      childUnitPrice * childCount +
      infantUnitPrice * infantCount;
    const discount = voucherResult?.discountAmount || 0;
    const total = Math.max(subtotal - discount, 0);

    return {
      adultUnitPrice,
      childUnitPrice,
      infantUnitPrice,
      subtotal,
      discount,
      total,
    };
  }, [adultCount, childCount, infantCount, selectedSchedule, voucherResult]);

  const seatsLeft = useMemo(() => {
    if (!selectedSchedule) return 0;
    return Math.max(selectedSchedule.quota - selectedSchedule.booked_count, 0);
  }, [selectedSchedule]);

  const totalGuests = adultCount + childCount + infantCount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Nhập mã giảm giá trước khi áp dụng.");
      setVoucherResult(null);
      return;
    }

    try {
      setVoucherLoading(true);
      setVoucherError(null);
      const query = new URLSearchParams({
        code: voucherCode.trim(),
        amount: String(pricing.subtotal),
      });
      const data = await publicFetch<VoucherValidationApiResponse>(
        `/public/vouchers/validate?${query.toString()}`,
      );
      setVoucherResult({
        voucher_id: data.voucher_id,
        code: data.code,
        discountAmount: Number(data.discount_amount || 0),
        finalAmount:
          data.final_amount != null ? Number(data.final_amount) : undefined,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes("Public fetch failed:")
          ? error.message.replace(/^Public fetch failed:\s*\d+\s*/, "")
          : "Không thể áp dụng mã giảm giá.";
      setVoucherResult(null);
      setVoucherError(message);
    } finally {
      setVoucherLoading(false);
    }
  };

  const updateTraveler = (
    index: number,
    field: keyof TravelerForm,
    value: string,
  ) => {
    setTravelers((current) =>
      current.map((traveler, travelerIndex) =>
        travelerIndex === index ? { ...traveler, [field]: value } : traveler,
      ),
    );
  };

  const handleCountChange = (type: TravelerType, delta: number) => {
    if (type === "adult") {
      setAdultCount((current) => Math.max(1, current + delta));
      return;
    }

    if (type === "child") {
      setChildCount((current) => Math.max(0, current + delta));
      return;
    }

    setInfantCount((current) => Math.max(0, current + delta));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmitBooking = async () => {
    if (!selectedSchedule || !tour) return;

    if (seatsLeft < totalGuests) {
      setSubmitTone("error");
      setSubmitMessage(
        "Số khách đang vượt quá chỗ trống của lịch khởi hành này.",
      );
      return;
    }

    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setSubmitTone("error");
      setSubmitMessage(
        "Vui lòng điền đủ thông tin liên hệ trước khi tiếp tục.",
      );
      return;
    }

    const token = getToken();
    if (!token) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          `/booking?tourId=${tour.tour_id}&scheduleId=${selectedSchedule.tour_schedule_id}`,
        )}`,
      );
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMessage(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          tour_schedule_id: selectedSchedule.tour_schedule_id,
          contact_name: contactName,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          adult_count: adultCount,
          child_count: childCount,
          infant_count: infantCount,
          travelers,
          note,
          voucher_code: voucherResult?.code,
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();
      console.log("Booking created response:", data);

      if (response.ok) {
        setSubmitTone("success");
        setSubmitMessage("Đặt tour thành công! Đang khởi tạo thanh toán...");
        
        // Clear draft if any
        sessionStorage.removeItem("booking_draft");

        // Nếu là VNPay, gọi API tạo URL thanh toán
        if (paymentMethod === "vnpay" && (data.booking_id || data.id)) {
          const bId = data.booking_id || data.id;
          console.log("Initializing VNPay for booking:", bId);
          
          try {
            const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/payment/create-url`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                bookingId: bId,
                amount: pricing.total,
              }),
            });
            
            const payData = await payRes.json();
            console.log("VNPay Response:", payData);

            if (payData.paymentUrl) {
              window.location.href = payData.paymentUrl;
              return; // Dừng hoàn toàn để đợi redirect
            } else {
              throw new Error(payData.message || "Không nhận được URL thanh toán");
            }
          } catch (payErr) {
            console.error("Lỗi tạo URL VNPay:", payErr);
            setSubmitTone("error");
            setSubmitMessage("Không thể khởi tạo VNPay. Bạn có thể thanh toán lại trong mục Quản lý đơn hàng.");
            
            // Chỉ redirect về account nếu gặp lỗi khởi tạo thanh toán
            setTimeout(() => router.push("/account"), 3000);
            return;
          }
        }

        // Nếu không phải VNPay (ví dụ chuyển khoản), thông báo thành công rồi mới về account
        setSubmitMessage("Đặt tour thành công! Cảm ơn bạn. Đang chuyển hướng...");
        setTimeout(() => {
          router.push("/account"); 
        }, 2000);
      } else {
        setSubmitTone("error");
        setSubmitMessage(data.message || "Có lỗi xảy ra khi đặt tour. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      setSubmitTone("error");
      setSubmitMessage("Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!tour || !selectedSchedule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            Không có dữ liệu booking phù hợp.
          </p>
          <Link
            href="/tours"
            className="mt-4 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Quay lại danh sách tour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex min-w-0 items-center gap-2 overflow-hidden text-sm font-medium text-slate-500">
          <Link href="/" className="shrink-0 transition hover:text-sky-700">
            Trang chủ
          </Link>
          <span className="shrink-0">/</span>
          <Link
            href="/tours"
            className="shrink-0 transition hover:text-sky-700"
          >
            Tour
          </Link>
          <span className="shrink-0">/</span>
          <Link
            href={`/tours/${tour.tour_id}`}
            className="truncate transition hover:text-sky-700"
          >
            {tour.name}
          </Link>
          <span className="shrink-0">/</span>
          <span className="shrink-0 text-slate-800">Booking</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 md:grid-cols-[300px_minmax(0,1fr)]">
                <ImageWithFallback
                  src={tour.tour_images[0]?.image_url || undefined}
                  alt={tour.name}
                  className="h-full min-h-[220px] w-full object-cover"
                />
                <div className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      Mã tour: {tour.code}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Còn {seatsLeft} chỗ
                    </span>
                  </div>

                  <div>
                    <h1 className="text-[28px] font-bold leading-tight text-slate-900">
                      Xác nhận thông tin đặt tour
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">{tour.name}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Khởi hành
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatDate(selectedSchedule.start_date)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Kết thúc
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatDate(selectedSchedule.end_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!getToken() && (
              <InlineNotice tone="error">
                Bạn chưa đăng nhập. Trang này vẫn cho phép nhập thông tin trước,
                nhưng để giữ chỗ và thanh toán bạn sẽ cần đăng nhập.
              </InlineNotice>
            )}

            {submitMessage && (
              <InlineNotice tone={submitTone}>{submitMessage}</InlineNotice>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Số lượng hành khách
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Chọn đúng cơ cấu khách để hệ thống tính giá chính xác.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
                  <p className="text-xs font-medium text-slate-500">
                    Tổng khách
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {totalGuests}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    type: "adult" as const,
                    count: adultCount,
                    subtitle: formatVND(pricing.adultUnitPrice),
                    ageHint: "Từ 12 tuổi trở lên",
                  },
                  {
                    type: "child" as const,
                    count: childCount,
                    subtitle: formatVND(pricing.childUnitPrice),
                    ageHint: "Từ 2 -> 12 tuổi",
                  },
                  {
                    type: "infant" as const,
                    count: infantCount,
                    subtitle: formatVND(pricing.infantUnitPrice),
                    ageHint: "Dưới 2 tuổi",
                  },
                ].map((item) => (
                  <div
                    key={item.type}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {getTravelerLabel(item.type)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.subtitle}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {item.ageHint}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCountChange(item.type, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-base font-bold text-slate-900">
                          {item.count}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCountChange(item.type, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Thông tin liên hệ
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Người nhận xác nhận booking và cập nhật thanh toán.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="Họ và tên liên hệ"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                />
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="Số điện thoại"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                />
                <input
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="Email nhận xác nhận"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white md:col-span-2"
                />
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Ghi chú thêm cho điều hành tour"
                  className="min-h-[110px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white md:col-span-2"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Danh sách hành khách
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Có thể hoàn thiện sau, nhưng nên nhập trước để giảm thao tác
                  khi chốt booking.
                </p>
              </div>

              <div className="space-y-4">
                {travelers.map((traveler, index) => (
                  <div
                    key={`${traveler.type}-${index}`}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Hành khách {index + 1}
                          </p>
                          <p className="text-xs text-slate-500">
                            {getTravelerLabel(traveler.type)}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {formatVND(
                          getUnitPrice(selectedSchedule, traveler.type),
                        )}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <input
                        value={traveler.fullName}
                        onChange={(event) =>
                          updateTraveler(index, "fullName", event.target.value)
                        }
                        placeholder="Họ và tên"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                      />
                      <select
                        value={traveler.gender}
                        onChange={(event) =>
                          updateTraveler(
                            index,
                            "gender",
                            event.target.value as TravelerForm["gender"],
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                      <input
                        type="date"
                        value={traveler.birthday}
                        onChange={(event) =>
                          updateTraveler(index, "birthday", event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Mã giảm giá và thanh toán
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Kiểm tra voucher trước khi chuyển sang bước thanh toán.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <TicketPercent className="h-4 w-4 text-sky-600" />
                    Mã ưu đãi
                  </label>
                  <div className="flex gap-3">
                    <input
                      value={voucherCode}
                      onChange={(event) => {
                        setVoucherCode(event.target.value);
                        setVoucherError(null);
                        setVoucherResult(null);
                      }}
                      placeholder="Nhập mã voucher"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={voucherLoading}
                      className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {voucherLoading ? "Đang kiểm tra" : "Áp dụng"}
                    </button>
                  </div>

                  {voucherError && (
                    <InlineNotice tone="error">{voucherError}</InlineNotice>
                  )}
                  {voucherResult && (
                    <InlineNotice tone="success">
                      Áp dụng thành công mã{" "}
                      <strong>{voucherResult.code}</strong>, giảm{" "}
                      {formatVND(voucherResult.discountAmount)}.
                    </InlineNotice>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <CalendarDays className="h-4 w-4 text-sky-600" />
                    Phương thức thanh toán
                  </label>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                            paymentMethod === method.id
                              ? "border-sky-300 bg-sky-50/70"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            className="mt-1"
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                          />
                          <Icon className="mt-0.5 h-5 w-5 text-sky-700" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {method.label}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {method.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Tóm tắt đơn hàng
              </h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-500">Tour</span>
                  <span className="max-w-[190px] text-right text-sm font-semibold text-slate-900">
                    {tour.name}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-500">Khởi hành</span>
                  <span className="text-right text-sm font-semibold text-slate-900">
                    {formatDate(selectedSchedule.start_date)}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-500">Số khách</span>
                  <span className="text-right text-sm font-semibold text-slate-900">
                    {totalGuests}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Người lớn x {adultCount}</span>
                      <span>
                        {formatVND(pricing.adultUnitPrice * adultCount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Trẻ em x {childCount}</span>
                      <span>
                        {formatVND(pricing.childUnitPrice * childCount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Em bé x {infantCount}</span>
                      <span>
                        {formatVND(pricing.infantUnitPrice * infantCount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span>{formatVND(pricing.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Giảm giá</span>
                    <span>- {formatVND(pricing.discount)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-base font-bold text-slate-900">
                    <span>Tổng thanh toán</span>
                    <span>{formatVND(pricing.total)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BadgeCheck className="h-4 w-4" />
                )}
                Xác nhận thông tin booking
              </button>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Nhấn xác nhận để tạo đơn hàng. Bạn có thể thanh toán ngay hoặc
                xác nhận chuyển khoản sau trong trang quản lý tài khoản.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
