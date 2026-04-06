"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getPublicTourDetail } from "@/lib/publicFetch";
import type { PublicTourDetail, TourSchedule } from "@/types/tour";
import TourDetailHero from "@/components/tours/detail/TourDetailHero";
import TourBookingSidebar from "@/components/tours/detail/TourBookingSidebar";
import TourQuickInfo from "@/components/tours/detail/TourQuickInfo";
import TourDepartureCalendar from "@/components/tours/detail/TourDepartureCalendar";
import TourItineraryAccordion from "@/components/tours/detail/TourItineraryAccordion";
import TourPolicyAccordion from "@/components/tours/detail/TourPolicyAccordion";
import RelatedTours from "@/components/tours/detail/RelatedTours";
import { trackRecommendationEvent } from "@/lib/recommendationTracker";

export default function TourDetailPage() {
  const { id } = useParams();
  const [tour, setTour] = useState<PublicTourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!id) return;

    let active = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const tourId = id.toString().split("-")[0];
        const data = await getPublicTourDetail<PublicTourDetail>(tourId);

        if (!active) return;

        setTour(data);
        setSelectedScheduleId(data.tour_schedules?.[0]?.tour_schedule_id ?? null);
      } catch {
        if (active) {
          setTour(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!tour) return;

    void trackRecommendationEvent({
      event_type: "tour_view",
      source: "tour_detail",
      tour_id: tour.tour_id,
      destination: tour.tour_destinations?.[0]?.name || undefined,
      metadata: {
        duration_days: tour.duration_days,
        duration_nights: tour.duration_nights,
        departure_location: tour.departure_locations?.name || null,
        tour_type: tour.tour_type,
      },
    });
  }, [tour]);

  const selectedSchedule = useMemo<TourSchedule | null>(() => {
    if (!tour?.tour_schedules?.length) return null;

    return (
      tour.tour_schedules.find(
        (schedule) => schedule.tour_schedule_id === selectedScheduleId,
      ) ?? tour.tour_schedules[0]
    );
  }, [selectedScheduleId, tour]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            Không tìm thấy thông tin tour.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:px-8">
        <div className="min-w-0">
          <div className="mb-5">
            <nav className="flex min-w-0 items-center gap-2 overflow-hidden text-[15px] font-semibold text-slate-700">
              <Link href="/" className="shrink-0 transition hover:text-[#0b63b6]">
                Trang chủ
              </Link>
              <span className="shrink-0">/</span>
              <Link
                href="/tours"
                className="shrink-0 transition hover:text-[#0b63b6]"
              >
                Tour
              </Link>
              <span className="shrink-0">/</span>
              <span className="truncate font-bold text-[#0b63b6]">{tour.name}</span>
            </nav>
          </div>

          <TourDetailHero tour={tour} selectedSchedule={selectedSchedule} />
          <TourDepartureCalendar
            schedules={tour.tour_schedules}
            selectedScheduleId={selectedSchedule?.tour_schedule_id ?? null}
            onSelect={setSelectedScheduleId}
          />
          <TourQuickInfo tour={tour} />
          <TourItineraryAccordion
            key={selectedSchedule?.tour_schedule_id ?? "empty"}
            itinerary={selectedSchedule?.tour_itineraries ?? []}
          />
          <TourPolicyAccordion policies={tour.tour_policies} />
        </div>

        <div className="mt-8 lg:mt-[148px]">
          <TourBookingSidebar tour={tour} selectedSchedule={selectedSchedule} />
        </div>
      </div>

      <RelatedTours currentTourId={tour.tour_id} />
    </main>
  );
}
