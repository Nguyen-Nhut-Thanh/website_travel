"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Loader2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminModalShell } from "@/components/admin/AdminModalShell";
import { adminFetch } from "@/lib/adminFetch";

type AdminBooking = {
  booking_id: number;
  status: string;
  total_amount?: number | string | null;
  note?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  created_at?: string | null;
  tour_schedules?: {
    start_date?: string | null;
    tours?: {
      name?: string | null;
      code?: string | null;
    } | null;
  } | null;
  payments?: Array<{
    status?: string | null;
    method?: string | null;
  }>;
};

type ActionModalState =
  | { type: "approve"; booking: AdminBooking }
  | { type: "reject"; booking: AdminBooking }
  | null;

const statusLabel: Record<string, string> = {
  pending: "Chưa thanh toán",
  paid: "Đã thanh toán",
  cancel_requested: "Yêu cầu hủy",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

function extractCancelReason(note?: string | null) {
  if (!note) return "";
  const match = note.match(
    /\[CUSTOMER_CANCEL_REQUEST\]\s*Ly do:\s*([\s\S]*?)(?:\n\[|$)/i,
  );
  return match?.[1]?.trim() || "";
}

export default function AdminBookingsPage() {
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [modal, setModal] = useState<ActionModalState>(null);
  const [actionNote, setActionNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const loadData = async (currentPage: number) => {
    try {
      setLoading(true);
      setError("");
      const res = await adminFetch(`/bookings/admin/list?page=${currentPage}&limit=10`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Không thể tải danh sách booking.");
      }
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách booking.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const openActionModal = (
    booking: AdminBooking,
    type: "approve" | "reject",
  ) => {
    setModal({ booking, type });
    setActionNote("");
    setRefundAmount("");
  };

  const closeModal = () => {
    if (actingId) return;
    setModal(null);
    setActionNote("");
    setRefundAmount("");
  };

  const runAction = async () => {
    if (!modal) return;

    try {
      setActingId(modal.booking.booking_id);
      const endpoint =
        modal.type === "approve"
          ? `/bookings/admin/${modal.booking.booking_id}/approve-cancel`
          : `/bookings/admin/${modal.booking.booking_id}/reject-cancel`;

      const payload: Record<string, unknown> = {
        note: actionNote.trim() || undefined,
      };

      if (modal.type === "approve" && refundAmount.trim()) {
        const numericRefundAmount = Number(refundAmount.replace(/[^\d]/g, ""));
        if (Number.isNaN(numericRefundAmount)) {
          throw new Error("Số tiền hoàn dự kiến không hợp lệ.");
        }
        payload.refundAmount = numericRefundAmount;
      }

      const res = await adminFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Không thể cập nhật booking.");
      }

      closeModal();
      await loadData();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Không thể cập nhật booking.",
      );
    } finally {
      setActingId(null);
    }
  };

  const reasonPreview = useMemo(
    () => extractCancelReason(modal?.booking.note),
    [modal],
  );

  return (
    <main className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Quản lý booking</h1>
        <p className="mt-2 text-sm text-slate-500">
          Theo dõi thanh toán và xử lý yêu cầu hủy từ khách hàng.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-10 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải booking...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500 uppercase text-[11px] tracking-wider">
                    <th className="px-6 py-4 font-bold w-[10%]">Mã đơn</th>
                    <th className="px-6 py-4 font-bold w-[25%]">Khách hàng</th>
                    <th className="px-6 py-4 font-bold w-[15%]">Mã tour</th>
                    <th className="px-6 py-4 font-bold w-[15%]">Ngày đi</th>
                    <th className="px-6 py-4 font-bold w-[15%]">Tổng tiền</th>
                    <th className="px-6 py-4 font-bold w-[10%]">Trạng thái</th>
                    <th className="px-6 py-4 font-bold w-[10%]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.booking_id} className="align-middle hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-950">
                        #{item.booking_id}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="font-bold text-slate-900">
                          {item.contact_name || "—"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.contact_phone || item.contact_email || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-sky-700 uppercase tracking-tighter text-sm">
                          {item.tour_schedules?.tours?.code || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {item.tour_schedules?.start_date
                          ? new Date(
                              item.tour_schedules.start_date,
                            ).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-950">
                      {Number(item.total_amount || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200 uppercase">
                        {statusLabel[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === "cancel_requested" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openActionModal(item, "approve")}
                            disabled={actingId === item.booking_id}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal(item, "reject")}
                            disabled={actingId === item.booking_id}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 font-medium italic">Không có</span>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      Chưa có dữ liệu đặt tour.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-bold text-slate-900">{items.length}</span> trên tổng số <span className="font-bold text-slate-900">{total}</span> đơn
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-bold text-slate-900">Trang {page}</span>
                <span className="text-sm text-slate-400">/ {totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
        )}
      </div>

      {modal ? (
        <AdminModalShell
          title={
            modal.type === "approve"
              ? "Duyệt hủy booking"
              : "Từ chối yêu cầu hủy"
          }
          icon={
            modal.type === "approve" ? (
              <CircleDollarSign size={18} />
            ) : (
              <XCircle size={18} />
            )
          }
          onClose={closeModal}
          maxWidthClassName="max-w-xl"
          footer={
            <>
              <button
                type="button"
                onClick={closeModal}
                disabled={Boolean(actingId)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => void runAction()}
                disabled={Boolean(actingId)}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
                  modal.type === "approve" ? "bg-emerald-600" : "bg-slate-950"
                }`}
              >
                {actingId
                  ? "Đang xử lý..."
                  : modal.type === "approve"
                    ? "Xác nhận duyệt"
                    : "Xác nhận từ chối"}
              </button>
            </>
          }
        >
          <div className="space-y-5 p-6">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">
                Booking #{modal.booking.booking_id}
              </p>
              <p className="mt-1">
                {modal.booking.tour_schedules?.tours?.name || "Tour"}
              </p>
              {reasonPreview ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Lý do khách gửi
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {reasonPreview}
                  </p>
                </div>
              ) : null}
            </div>

            {modal.type === "approve" ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">
                  Số tiền hoàn dự kiến
                </label>
                <input
                  value={refundAmount}
                  onChange={(event) => setRefundAmount(event.target.value)}
                  inputMode="numeric"
                  placeholder="Ví dụ: 2500000"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
                <p className="text-xs text-slate-500">
                  Không bắt buộc. Giá trị này sẽ được ghi vào ghi chú xử lý
                  booking.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                {modal.type === "approve" ? "Ghi chú xử lý" : "Lý do từ chối"}
              </label>
              <textarea
                value={actionNote}
                onChange={(event) => setActionNote(event.target.value)}
                rows={5}
                placeholder={
                  modal.type === "approve"
                    ? "Ví dụ: Hoàn tiền theo chính sách chuyển/hủy tour của chương trình."
                    : "Ví dụ: Booking đã sát ngày khởi hành, cần liên hệ trực tiếp để xử lý."
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>
        </AdminModalShell>
      ) : null}
    </main>
  );
}
