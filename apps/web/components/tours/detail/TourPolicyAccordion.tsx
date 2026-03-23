"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

const POLICY_GROUPS = [
  {
    id: "included",
    title: "Giá tour bao gồm",
    content: [
      "Xe hoặc phương tiện vận chuyển theo chương trình.",
      "Khách sạn tiêu chuẩn theo số đêm lưu trú.",
      "Các bữa ăn và vé tham quan như lịch trình công bố.",
    ],
  },
  {
    id: "excluded",
    title: "Giá tour không bao gồm",
    content: [
      "Chi phí cá nhân, giặt ủi, điện thoại, minibar.",
      "Thuế VAT và các khoản phát sinh ngoài chương trình.",
      "Tiền tip cho tài xế, hướng dẫn viên và phụ thu phòng đơn.",
    ],
  },
  {
    id: "children",
    title: "Lưu ý giá trẻ em",
    content: [
      "Trẻ em ngủ chung với bố mẹ theo chính sách từng tour.",
      "Mức giá cụ thể thay đổi theo độ tuổi và dịch vụ sử dụng.",
    ],
  },
  {
    id: "payment",
    title: "Điều kiện thanh toán",
    content: [
      "Đặt cọc để giữ chỗ và thanh toán đủ trước ngày khởi hành.",
      "Cọc/hoàn tất thanh toán tùy từng giai đoạn xác nhận dịch vụ.",
    ],
  },
  {
    id: "register",
    title: "Điều kiện đăng ký",
    content: [
      "Cung cấp đầy đủ thông tin hành khách theo yêu cầu.",
      "Hồ sơ giấy tờ phải còn hiệu lực vào ngày khởi hành.",
    ],
  },
  {
    id: "cancel",
    title: "Lưu ý về chuyển hoặc hủy tour",
    content: [
      "Phí hủy và đổi ngày sẽ áp dụng theo thời điểm thông báo.",
      "Một số dịch vụ giữ chỗ trước có thể không hoàn lại.",
    ],
  },
  {
    id: "weekday",
    title: "Các điều kiện hủy tour đối với ngày thường",
    content: [
      "Mức phạt tăng dần theo sát ngày khởi hành.",
      "Vé máy bay, vé tàu và dịch vụ đã xuất giữ theo quy định nhà cung cấp.",
    ],
  },
  {
    id: "holiday",
    title: "Các điều kiện hủy tour đối với ngày lễ, Tết",
    content: [
      "Ngày cao điểm thường áp dụng mức phạt cao hơn ngày thường.",
      "Một số booking không hoàn, không đổi sau khi xác nhận.",
    ],
  },
  {
    id: "force",
    title: "Trường hợp bất khả kháng",
    content: [
      "Thiên tai, dịch bệnh, đình công hoặc cấm vận chuyển có thể làm thay đổi chương trình.",
      "Hai bên sẽ phối hợp xử lý trên cơ sở chi phí thực tế phát sinh.",
    ],
  },
  {
    id: "contact",
    title: "Liên hệ",
    content: [
      "Hotline hỗ trợ và tư vấn luôn sẵn sàng trong giờ làm việc.",
      "Nhân viên sẽ xác nhận lại điều kiện cụ thể trước khi thanh toán.",
    ],
  },
];

export default function TourPolicyAccordion() {
  const [openItem, setOpenItem] = useState<string>("included");

  const [leftColumn, rightColumn] = useMemo(() => {
    return POLICY_GROUPS.reduce<[typeof POLICY_GROUPS, typeof POLICY_GROUPS]>(
      (columns, policy, index) => {
        columns[index % 2].push(policy);
        return columns;
      },
      [[], []],
    );
  }, []);

  const renderPolicyItem = (policy: (typeof POLICY_GROUPS)[number]) => {
    const isOpen = openItem === policy.id;

    return (
      <div
        key={policy.id}
        className="overflow-hidden rounded-[22px] border border-slate-200"
      >
        <button
          type="button"
          onClick={() => setOpenItem((current) => (current === policy.id ? "" : policy.id))}
          className={`flex w-full items-center justify-between px-6 py-5 text-left text-base font-bold text-slate-900 transition ${
            isOpen ? "bg-blue-100" : "bg-[#faf9f7]"
          }`}
        >
          <span>{policy.title}</span>
          <ChevronDown
            className={`h-5 w-5 flex-shrink-0 text-slate-500 transition ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen ? (
          <div className="border-t border-slate-200 bg-white px-6 py-5">
            <ul className="list-disc space-y-2 pl-5 text-base leading-8 text-slate-700">
              {policy.content.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-2xl font-extrabold uppercase text-slate-900">
          Những thông tin cần lưu ý
        </h2>

        <div className="space-y-3 md:hidden">
          {POLICY_GROUPS.map(renderPolicyItem)}
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-2 md:items-start">
          <div className="space-y-3">{leftColumn.map(renderPolicyItem)}</div>
          <div className="space-y-3">{rightColumn.map(renderPolicyItem)}</div>
        </div>
      </div>
    </section>
  );
}
