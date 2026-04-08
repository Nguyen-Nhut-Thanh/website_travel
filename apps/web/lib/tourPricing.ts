import type { TourSchedule } from "@/types/tour";

export function getSingleRoomSurchargeTotal(schedule: TourSchedule | null) {
  const hotelRows = schedule?.tour_schedule_hotels ?? [];

  const fromHotels = hotelRows.reduce((total, item) => {
    const nights = Math.max(Number(item.nights || 1), 1);
    const roomPrice = Number(item.hotel_room_types?.base_price || 0);
    return total + roomPrice * nights;
  }, 0);

  if (fromHotels > 0) {
    return fromHotels;
  }

  const legacySingleRoom = schedule?.tour_schedule_prices?.find((item) =>
    ["SINGLE_ROOM", "single_room"].includes(item.passenger_type),
  );

  return legacySingleRoom ? Number(legacySingleRoom.price) : 0;
}
