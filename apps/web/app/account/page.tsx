"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { fetchMe, getToken } from "@/lib/auth";
import {
  getAccountStats,
  getMyBookings,
  getMyFavoriteTours,
  getRecommendationProfile,
} from "@/lib/authApi";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountOverview } from "@/components/account/AccountOverview";
import { RecentBookings } from "@/components/account/RecentBookings";
import { FavoriteTours } from "@/components/account/FavoriteTours";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AddressForm } from "@/components/account/AddressForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { TravelPreferencesForm } from "@/components/account/TravelPreferencesForm";
import type {
  AccountBooking,
  AccountStats,
  FavoriteTourItem,
  RecommendationProfile,
  UserProfile,
} from "@/types/account";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [favorites, setFavorites] = useState<FavoriteTourItem[]>([]);
  const [recommendationProfile, setRecommendationProfile] =
    useState<RecommendationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const userData = await fetchMe();
      if (!userData) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      setUser(userData as UserProfile);

      const [statsData, bookingsData, favoritesData, recommendationProfileData] =
        await Promise.all([
        getAccountStats(),
        getMyBookings(),
        getMyFavoriteTours(),
        getRecommendationProfile(),
      ]);

      setStats(statsData);
      setBookings(bookingsData);
      setFavorites(favoritesData);
      setRecommendationProfile(recommendationProfileData);
    } catch {
      setError("Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    initData();
  }, [initData]);

  const handleUpdateSuccess = () => {
    initData();
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_45%,#eef2ff_100%)] px-4">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 px-10 py-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="font-medium text-slate-600">
            Đang chuẩn bị không gian tài khoản của bạn...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_45%,#eef2ff_100%)] px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 font-[family:var(--font-display)] text-2xl font-semibold text-slate-900">
            Đã có lỗi xảy ra
          </h2>
          <p className="mb-6 text-slate-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition-all hover:bg-slate-800"
          >
            Thử lại ngay
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <AccountOverview
            user={user}
            stats={stats}
            bookings={bookings}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        );
      case "bookings":
        return <RecentBookings bookings={bookings} loading={loading} />;
      case "favorites":
        return (
          <FavoriteTours
            favorites={favorites}
            loading={loading}
            onRefresh={initData}
          />
        );
      case "preferences":
        return (
          <TravelPreferencesForm
            profile={recommendationProfile}
            onUpdate={handleUpdateSuccess}
          />
        );
      case "profile":
        return <ProfileForm user={user} onUpdate={handleUpdateSuccess} />;
      case "address":
        return <AddressForm user={user} onUpdate={handleUpdateSuccess} />;
      case "password":
        return <PasswordForm user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_30%,#f6f8fc_100%)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col gap-6 py-4 lg:flex-row lg:items-start lg:gap-8">
          <aside className="w-full flex-shrink-0 lg:sticky lg:top-20 lg:w-[300px] xl:w-80">
            <AccountSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
            />
          </aside>

          <main className="min-w-0 flex-grow">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
