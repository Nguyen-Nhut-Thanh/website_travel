export const TOUR_POLICY_DEFINITIONS = [
  {
    key: "included",
    title: "Giá tour bao gồm",
    placeholder: "Ví dụ: Xe đưa đón, khách sạn, vé tham quan...",
  },
  {
    key: "excluded",
    title: "Giá tour không bao gồm",
    placeholder: "Ví dụ: Chi phí cá nhân, VAT, tip...",
  },
  {
    key: "children",
    title: "Lưu ý giá trẻ em",
    placeholder: "Ví dụ: Trẻ em ngủ chung với bố mẹ, phụ thu theo độ tuổi...",
  },
  {
    key: "payment",
    title: "Điều kiện thanh toán",
    placeholder: "Ví dụ: Cọc 50%, thanh toán đủ trước ngày khởi hành...",
  },
  {
    key: "register",
    title: "Điều kiện đăng ký",
    placeholder: "Ví dụ: Cung cấp CCCD/hộ chiếu còn hạn...",
  },
  {
    key: "cancel",
    title: "Lưu ý về chuyển hoặc hủy tour",
    placeholder: "Ví dụ: Phí đổi ngày, hoàn hủy theo thời điểm báo...",
  },
  {
    key: "weekday",
    title: "Điều kiện hủy tour đối với ngày thường",
    placeholder: "Ví dụ: Hủy trước 7 ngày mất 30%...",
  },
  {
    key: "holiday",
    title: "Điều kiện hủy tour đối với ngày lễ, Tết",
    placeholder: "Ví dụ: Dịp cao điểm không hoàn hủy sau xác nhận...",
  },
  {
    key: "force",
    title: "Trường hợp bất khả kháng",
    placeholder: "Ví dụ: Thiên tai, dịch bệnh, đình công...",
  },
  {
    key: "contact",
    title: "Liên hệ",
    placeholder: "Ví dụ: Hotline, email, thời gian hỗ trợ...",
  },
] as const;

export type TourPolicyKey = (typeof TOUR_POLICY_DEFINITIONS)[number]["key"];

export type TourPolicyContentMap = Partial<Record<TourPolicyKey, string>>;
