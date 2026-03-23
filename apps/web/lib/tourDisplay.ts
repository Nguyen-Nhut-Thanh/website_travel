export function getTourPriceValue(basePrice?: number | string | null, schedulePrice?: number | string | null) {
  if (schedulePrice != null && schedulePrice !== "") {
    return Number(schedulePrice);
  }

  return Number(basePrice ?? 0);
}

export function getTransportCategory(type?: string | null) {
  const value = (type || "").toLowerCase();

  if (value.includes("bay") || value.includes("plane") || value.includes("hàng không")) {
    return "plane";
  }

  if (value.includes("tàu") || value.includes("train")) {
    return "train";
  }

  return "bus";
}

export function getTransportLabel(type?: string | null) {
  const category = getTransportCategory(type);

  if (category === "plane") return "Máy bay";
  if (category === "train") return "Tàu hỏa";
  return "Xe du lịch";
}
