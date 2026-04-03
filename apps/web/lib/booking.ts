import { CreditCard, ShieldCheck, Wallet } from "lucide-react";
import type { TourSchedule } from "@/types/tour";

export type TravelerType = "adult" | "child" | "infant";
export type PaymentMethod = "vnpay" | "momo" | "bank_transfer";

export type TravelerForm = {
  fullName: string;
  gender: "male" | "female";
  type: TravelerType;
  birthday: string;
};

export type VoucherValidationResult = {
  voucher_id: number;
  code: string;
  discountAmount: number;
  finalAmount?: number;
};

export type VoucherValidationApiResponse = {
  voucher_id: number;
  code: string;
  discount_amount: number;
  final_amount?: number;
};

export type UserProfileLite = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
  enabled: boolean;
  badge?: string;
}> = [
  {
    id: "vnpay",
    label: "VNPay",
    description: "Thanh toán online qua ATM, QR ngân hàng, thẻ nội địa.",
    icon: CreditCard,
    enabled: true,
  },
  {
    id: "momo",
    label: "MoMo",
    description: "Thanh toán nhanh trên điện thoại, phù hợp mobile-first.",
    icon: Wallet,
    enabled: false,
    badge: "Sắp có",
  },
  {
    id: "bank_transfer",
    label: "Chuyển khoản",
    description: "Giữ chỗ trước, chuyển khoản xác nhận sau.",
    icon: ShieldCheck,
    enabled: false,
    badge: "Sắp có",
  },
];

export function getUnitPrice(
  schedule: TourSchedule | null,
  type: TravelerType,
) {
  const passengerTypeMap = {
    adult: "ADULT",
    child: "CHILD",
    infant: "INFANT",
  } as const;

  const matchedPrice = schedule?.tour_schedule_prices?.find(
    (item) => item.passenger_type === passengerTypeMap[type],
  );

  if (matchedPrice) {
    return Number(matchedPrice.price);
  }

  return type === "adult" ? Number(schedule?.price ?? 0) : 0;
}

export function createEmptyTraveler(type: TravelerType): TravelerForm {
  return {
    fullName: "",
    gender: "male",
    type,
    birthday: "",
  };
}

export function buildTravelers(
  adultCount: number,
  childCount: number,
  infantCount: number,
) {
  return [
    ...Array.from({ length: adultCount }, () => createEmptyTraveler("adult")),
    ...Array.from({ length: childCount }, () => createEmptyTraveler("child")),
    ...Array.from({ length: infantCount }, () => createEmptyTraveler("infant")),
  ];
}

export function syncTravelers(
  current: TravelerForm[],
  adultCount: number,
  childCount: number,
  infantCount: number,
) {
  const adults = current.filter((traveler) => traveler.type === "adult");
  const children = current.filter((traveler) => traveler.type === "child");
  const infants = current.filter((traveler) => traveler.type === "infant");

  return [
    ...Array.from(
      { length: adultCount },
      (_, index) => adults[index] ?? createEmptyTraveler("adult"),
    ),
    ...Array.from(
      { length: childCount },
      (_, index) => children[index] ?? createEmptyTraveler("child"),
    ),
    ...Array.from(
      { length: infantCount },
      (_, index) => infants[index] ?? createEmptyTraveler("infant"),
    ),
  ];
}

export function getTravelerLabel(type: TravelerType) {
  switch (type) {
    case "adult":
      return "Người lớn";
    case "child":
      return "Trẻ em";
    default:
      return "Em bé";
  }
}
