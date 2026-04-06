"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Loader2, XCircle, ChevronLeft, ChevronRight, Eye, User, Phone, Mail, Calendar, MapPin, Tag, CreditCard, Users, FileText } from "lucide-react";
import { AdminModalShell } from "@/components/admin/AdminModalShell";
import {
  getAdminBookingDetail,
  getAdminBookingList,
  runAdminBookingAction,
} from "@/lib/bookingApi";

type AdminBooking = {
  booking_id: number;
  status: string;
  total_amount?: number | string | null;
  note?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  created_at?: string | null;
  adult_count?: number;
  child_count?: number;
  infant_count?: number;
  adult_unit_price?: number | string;
  child_unit_price?: number | string;
  infant_unit_price?: number | string;
  discount_amount?: number | string;
  tour_schedules?: {
    start_date?: string | null;
    tours?: {
      name?: string | null;
      code?: string | null;
      departure_locations?: { name: string } | null;
    } | null;
  } | null;
  payments?: Array<{
    payment_id: number;
    status?: string | null;
    method?: string | null;
    amount?: number | string;
    transaction_code?: string | null;
    paid_at?: string | null;
  }>;
  booking_travelers?: Array<{
    traveler_id: number;
    full_name: string;
    gender: string;
    dob: string | null;
    traveler_type: string;
  }>;
  vouchers?: {
    code: string;
    discount_value: number | string;
    discount_type: string;
  } | null;
};

type ActionModalState =
  | { type: "approve"; booking: AdminBooking }
  | { type: "reject"; booking: AdminBooking }
  | { type: "detail"; booking: AdminBooking }
  | null;

const statusLabel: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  cancel_requested: "Yêu cầu hủy",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancel_requested: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-50 text-slate-500 border-slate-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
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
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [modal, setModal] = useState<ActionModalState>(null);
  const [actionNote, setActionNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const loadData = async (currentPage: number) => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminBookingList<{
        items: AdminBooking[];
        total: number;
        totalPages: number;
      }>(currentPage, 10);
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
    type: "approve" | "reject" | "detail",
  ) => {
    if (type === "detail") {
      void loadDetail(booking.booking_id);
    } else {
      setModal({ booking, type });
      setActionNote("");
      setRefundAmount("");
    }
  };

  const loadDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const data = await getAdminBookingDetail<AdminBooking>(id);
      setModal({ type: "detail", booking: data });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    if (actingId) return;
    setModal(null);
    setActionNote("");
    setRefundAmount("");
  };

  const runAction = async () => {
    if (!modal || modal.type === "detail") return;

    try {
      setActingId(modal.booking.booking_id);
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

      await runAdminBookingAction(
        modal.booking.booking_id,
        modal.type === "approve" ? "approve-cancel" : "reject-cancel",
        payload,
      );
      closeModal();
      await loadData(page);
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
    () => (modal?.type !== "detail" ? extractCancelReason(modal?.booking.note) : ""),
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
                    <th className="px-6 py-4 font-bold w-[8%]">Mã</th>
                    <th className="px-6 py-4 font-bold w-[22%]">Khách hàng</th>
                    <th className="px-6 py-4 font-bold w-[12%]">Mã tour</th>
                    <th className="px-6 py-4 font-bold w-[12%]">Ngày đi</th>
                    <th className="px-6 py-4 font-bold w-[15%] text-right">Tổng tiền</th>
                    <th className="px-6 py-4 font-bold w-[16%] text-center">Trạng thái</th>
                    <th className="px-6 py-4 font-bold w-[15%] text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.booking_id} className="align-middle hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-950">
                        #{item.booking_id}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="font-bold text-slate-900 truncate max-w-[180px]">
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
                    <td className="px-6 py-4 font-black text-slate-950 text-right">
                      {Number(item.total_amount || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase whitespace-nowrap ${statusColor[item.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {statusLabel[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openActionModal(item, "detail")}
                          disabled={detailLoading}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                          title="Xem chi tiết"
                        >
                          {detailLoading && modal?.booking.booking_id === item.booking_id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                        
                        {item.status === "cancel_requested" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openActionModal(item, "approve")}
                              disabled={actingId === item.booking_id}
                              className="flex h-8 px-3 items-center justify-center rounded-lg bg-emerald-600 text-[10px] font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
                            >
                              Duyệt hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => openActionModal(item, "reject")}
                              disabled={actingId === item.booking_id}
                              className="flex h-8 px-3 items-center justify-center rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
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

      {modal?.type === "detail" && (
        <AdminModalShell
          title={`Chi tiết đơn hàng #${modal.booking.booking_id}`}
          icon={<FileText size={18} />}
          onClose={closeModal}
          maxWidthClassName="max-w-4xl"
        >
          <div className="max-h-[80vh] overflow-y-auto p-6 space-y-8">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Ngày khởi hành</span>
                </div>
                <div className="text-sm font-black text-slate-900">
                  {modal.booking.tour_schedules?.start_date ? new Date(modal.booking.tour_schedules.start_date).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Tag size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Mã Booking</span>
                </div>
                <div className="text-sm font-black text-slate-900">#{modal.booking.booking_id}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <CreditCard size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Trạng thái</span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase ${statusColor[modal.booking.status]}`}>
                  {statusLabel[modal.booking.status]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tour & Contact */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" /> Thông tin Tour
                  </h3>
                  <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Tên tour</div>
                      <div className="text-sm font-bold text-slate-900 leading-snug">{modal.booking.tour_schedules?.tours?.name}</div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Mã tour</div>
                        <div className="text-sm font-black text-blue-600 uppercase">{modal.booking.tour_schedules?.tours?.code}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Khởi hành từ</div>
                        <div className="text-sm font-bold text-slate-900">{modal.booking.tour_schedules?.tours?.departure_locations?.name || "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={16} className="text-blue-600" /> Thông tin liên hệ
                  </h3>
                  <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <User size={14} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Họ và tên</div>
                        <div className="text-sm font-bold text-slate-900">{modal.booking.contact_name}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <Phone size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Số điện thoại</div>
                          <div className="text-sm font-bold text-slate-900">{modal.booking.contact_phone}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                          <Mail size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Email</div>
                          <div className="text-sm font-bold text-slate-900 truncate">{modal.booking.contact_email}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Travelers */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users size={16} className="text-blue-600" /> Danh sách khách đi
                  </h3>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 font-bold text-slate-500 uppercase">Họ tên</th>
                          <th className="px-4 py-2 font-bold text-slate-500 uppercase">Loại</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {modal.booking.booking_travelers?.map((t) => (
                          <tr key={t.traveler_id}>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900 uppercase">{t.full_name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {t.gender === "male" ? "Nam" : t.gender === "female" ? "Nữ" : t.gender}
                                {t.dob ? ` • ${new Date(t.dob).toLocaleDateString("vi-VN")}` : ""}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-black text-[9px] uppercase">
                                {t.traveler_type === "ADULT" ? "Người lớn" : t.traveler_type === "CHILD" ? "Trẻ em" : "Em bé"}
                              </span>
                            </td>
                          </tr>
                        )) || (
                          <tr><td colSpan={2} className="px-4 py-4 text-center text-slate-400 italic">Chưa có thông tin khách đi.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CircleDollarSign size={16} className="text-blue-600" /> Chi tiết thanh toán
                  </h3>
                  <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-200">
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                        <span>Số lượng khách</span>
                        <span className="text-white">
                          {[
                            modal.booking.adult_count ? `${modal.booking.adult_count} người lớn` : null,
                            modal.booking.child_count ? `${modal.booking.child_count} trẻ em` : null,
                            modal.booking.infant_count ? `${modal.booking.infant_count} em bé` : null
                          ].filter(Boolean).join(", ")}
                        </span>
                      </div>
                      <div className="h-px bg-slate-800" />
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-bold uppercase">Tạm tính</span>
                        <span className="font-black">{(Number(modal.booking.total_amount) + Number(modal.booking.discount_amount || 0)).toLocaleString("vi-VN")}đ</span>
                      </div>
                      {modal.booking.discount_amount && Number(modal.booking.discount_amount) > 0 && (
                        <div className="flex justify-between text-xs text-rose-400">
                          <span className="font-bold uppercase">Giảm giá {modal.booking.vouchers ? `(${modal.booking.vouchers.code})` : ""}</span>
                          <span className="font-black">-{Number(modal.booking.discount_amount).toLocaleString("vi-VN")}đ</span>
                        </div>
                      )}
                      <div className="pt-2 flex justify-between items-end border-t border-slate-800">
                        <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Tổng cộng</span>
                        <span className="text-2xl font-black text-white">{Number(modal.booking.total_amount).toLocaleString("vi-VN")}đ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            {modal.booking.note && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4">Ghi chú & Lịch sử xử lý</h3>
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                  {modal.booking.note}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button onClick={closeModal} className="px-6 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">Đóng</button>
          </div>
        </AdminModalShell>
      )}

      {modal?.type === "approve" || modal?.type === "reject" ? (
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
