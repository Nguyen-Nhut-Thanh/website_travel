import { adminFetch } from "../adminFetch";

export type DashboardStats = {
  totalRevenue: number;
  bookingsThisMonth: number;
  activeTours: number;
  newUsers: number;
  recentBookings: Array<{
    id: string;
    customer: string;
    tour: string;
    date: string;
    amount: number;
    status: string;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await adminFetch("/dashboard/stats");
  if (!res.ok) {
    throw new Error("Không thể tải dữ liệu dashboard.");
  }
  return res.json();
}
