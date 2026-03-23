"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!status) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/account");
    }
  }, [countdown, router]);

  if (!status) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isSuccess = status === "success";

  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/50">
      <div className={`p-8 text-center ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
          {isSuccess ? (
            <CheckCircle2 className="h-10 w-10 text-white" />
          ) : (
            <XCircle className="h-10 w-10 text-white" />
          )}
        </div>
        <h1 className="mt-6 text-2xl font-black text-white">
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h1>
        <p className="mt-2 text-sm font-medium text-white/80">
          Mã đơn hàng: #{orderId}
        </p>
      </div>

      <div className="p-8 text-center">
        <p className="mb-6 text-slate-600">
          {isSuccess 
            ? "Cảm ơn bạn đã sử dụng dịch vụ của TRAVOL. Chi tiết chuyến đi và vé điện tử sẽ được gửi vào email của bạn trong ít phút tới." 
            : "Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý. Đơn hàng của bạn vẫn được lưu lại dưới dạng chờ thanh toán."}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/account"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800"
          >
            Quản lý đơn hàng
            <ArrowRight size={16} />
          </Link>
          {!isSuccess && (
            <Link
              href="/tours"
              className="flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-4 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200"
            >
              Xem tour khác
            </Link>
          )}
        </div>
        
        <p className="mt-6 text-xs text-slate-400">
          Tự động chuyển hướng sau <strong className="text-slate-700">{countdown}s</strong>...
        </p>
      </div>
    </div>
  );
}

export default function BookingResultPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 flex items-center justify-center">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      }>
        <ResultContent />
      </Suspense>
    </main>
  );
}
