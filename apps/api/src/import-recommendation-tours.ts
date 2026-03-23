import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TOUR_PREFIX = 'AIREC';

type TourFamily = {
  key: string;
  title: string;
  departureLocation: number;
  destinationIds: number[];
  basePrice: number;
  durationDays: number;
  tourType: 'domestic' | 'outbound';
  transportId: number;
  theme: string;
  audience: string;
  bestTime: string;
};

type Variant = {
  suffix: string;
  label: string;
  summaryTone: string;
  style: string;
  priceMultiplier: number;
  durationDelta: number;
  promo: string;
};

const TOUR_FAMILIES: TourFamily[] = [
  {
    key: 'HN',
    title: 'Ha Noi pho co va van hoa thu do',
    departureLocation: 33,
    destinationIds: [6],
    basePrice: 3790000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 1,
    theme: 'van hoa, am thuc, city break',
    audience: 'cap doi, gia dinh nho, nhom ban',
    bestTime: 'mua thu va mua xuan',
  },
  {
    key: 'HL',
    title: 'Ha Long nghi duong va du thuyen',
    departureLocation: 6,
    destinationIds: [15],
    basePrice: 4690000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 3,
    theme: 'bien, nghi duong, check-in',
    audience: 'cap doi, gia dinh',
    bestTime: 'thang 3 den thang 8',
  },
  {
    key: 'SP',
    title: 'Sa Pa san may va nui rung',
    departureLocation: 6,
    destinationIds: [12],
    basePrice: 4290000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 3,
    theme: 'nui, san may, van hoa ban dia',
    audience: 'nhom ban, cap doi',
    bestTime: 'thang 9 den thang 4',
  },
  {
    key: 'CB',
    title: 'Cao Bang thac Ban Gioc va dia chat',
    departureLocation: 6,
    destinationIds: [7],
    basePrice: 4890000,
    durationDays: 4,
    tourType: 'domestic',
    transportId: 7,
    theme: 'thien nhien, kham pha, nui',
    audience: 'nhom ban, nguoi tre',
    bestTime: 'thang 9 den thang 11',
  },
  {
    key: 'NB',
    title: 'Ninh Binh non nuoc huu tinh',
    departureLocation: 6,
    destinationIds: [20],
    basePrice: 3290000,
    durationDays: 2,
    tourType: 'domestic',
    transportId: 3,
    theme: 'van hoa, canh dep, check-in',
    audience: 'cap doi, gia dinh',
    bestTime: 'thang 1 den thang 5',
  },
  {
    key: 'TH',
    title: 'Sam Son Thanh Hoa nghi he ngan ngay',
    departureLocation: 6,
    destinationIds: [21],
    basePrice: 2990000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 9,
    theme: 'bien, nghi he, gia tot',
    audience: 'gia dinh, cong ty',
    bestTime: 'thang 4 den thang 8',
  },
  {
    key: 'NA',
    title: 'Cua Lo Nghe An bien va am thuc',
    departureLocation: 6,
    destinationIds: [22],
    basePrice: 3390000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 9,
    theme: 'bien, am thuc, he',
    audience: 'gia dinh, nhom ban',
    bestTime: 'thang 5 den thang 8',
  },
  {
    key: 'HUE',
    title: 'Hue co do va di san mien Trung',
    departureLocation: 33,
    destinationIds: [25, 26],
    basePrice: 4590000,
    durationDays: 4,
    tourType: 'domestic',
    transportId: 1,
    theme: 'di san, van hoa, am thuc',
    audience: 'cap doi, nguoi trung nien',
    bestTime: 'thang 2 den thang 8',
  },
  {
    key: 'DAD',
    title: 'Da Nang ba ngay nang bien',
    departureLocation: 33,
    destinationIds: [26, 25],
    basePrice: 4390000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 1,
    theme: 'bien, city break, check-in',
    audience: 'cap doi, nhom ban, gia dinh',
    bestTime: 'thang 3 den thang 8',
  },
  {
    key: 'QNG',
    title: 'Quang Ngai bien dao va nhiep anh',
    departureLocation: 33,
    destinationIds: [27],
    basePrice: 4090000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 1,
    theme: 'bien dao, check-in, kham pha',
    audience: 'nhom ban, cap doi',
    bestTime: 'thang 4 den thang 8',
  },
  {
    key: 'GL',
    title: 'Gia Lai dai ngan va hoang hon nui lua',
    departureLocation: 33,
    destinationIds: [28],
    basePrice: 4190000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 1,
    theme: 'cao nguyen, kham pha, van hoa',
    audience: 'nhom ban, nguoi tre',
    bestTime: 'thang 11 den thang 3',
  },
  {
    key: 'NT',
    title: 'Nha Trang bien xanh resort va vui choi',
    departureLocation: 33,
    destinationIds: [29],
    basePrice: 4990000,
    durationDays: 4,
    tourType: 'domestic',
    transportId: 1,
    theme: 'bien, resort, gia dinh',
    audience: 'gia dinh, cap doi',
    bestTime: 'thang 2 den thang 8',
  },
  {
    key: 'DL',
    title: 'Da Lat nghi mat va san suong',
    departureLocation: 33,
    destinationIds: [31],
    basePrice: 3890000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 3,
    theme: 'nui, nghi mat, check-in',
    audience: 'cap doi, nhom ban',
    bestTime: 'quanh nam',
  },
  {
    key: 'DLK',
    title: 'Dak Lak trai nghiem Tay Nguyen',
    departureLocation: 33,
    destinationIds: [30],
    basePrice: 4290000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 1,
    theme: 'cao nguyen, trai nghiem, van hoa',
    audience: 'nhom ban, nguoi tre',
    bestTime: 'thang 12 den thang 4',
  },
  {
    key: 'HCM',
    title: 'Sai Gon do thi va nhiep song tre',
    departureLocation: 6,
    destinationIds: [33],
    basePrice: 3590000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 1,
    theme: 'thanh pho, mua sam, am thuc',
    audience: 'nhom ban, cap doi',
    bestTime: 'quanh nam',
  },
  {
    key: 'TN',
    title: 'Tay Ninh nui Ba va hanh huong',
    departureLocation: 33,
    destinationIds: [34],
    basePrice: 2690000,
    durationDays: 2,
    tourType: 'domestic',
    transportId: 3,
    theme: 'hanh huong, gan thanh pho, de di',
    audience: 'gia dinh, nguoi lon tuoi',
    bestTime: 'thang 11 den thang 5',
  },
  {
    key: 'DT',
    title: 'Dong Thap mua nuoc noi va lang hoa',
    departureLocation: 33,
    destinationIds: [35, 36],
    basePrice: 2890000,
    durationDays: 2,
    tourType: 'domestic',
    transportId: 7,
    theme: 'mien Tay, am thuc, nhan hoa',
    audience: 'gia dinh, nhom ban',
    bestTime: 'thang 8 den thang 11',
  },
  {
    key: 'VL',
    title: 'Vinh Long nha vuon va ben song',
    departureLocation: 33,
    destinationIds: [36, 38],
    basePrice: 2790000,
    durationDays: 2,
    tourType: 'domestic',
    transportId: 7,
    theme: 'mien Tay, thu gian, am thuc',
    audience: 'gia dinh, cap doi',
    bestTime: 'quanh nam',
  },
  {
    key: 'AG',
    title: 'An Giang nui rung va tam linh',
    departureLocation: 33,
    destinationIds: [37],
    basePrice: 3490000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 7,
    theme: 'tam linh, nui rung, van hoa',
    audience: 'gia dinh, nhom ban',
    bestTime: 'thang 9 den thang 4',
  },
  {
    key: 'CT',
    title: 'Can Tho cho noi va song nuoc',
    departureLocation: 33,
    destinationIds: [38, 36],
    basePrice: 3190000,
    durationDays: 2,
    tourType: 'domestic',
    transportId: 7,
    theme: 'mien Tay, song nuoc, am thuc',
    audience: 'gia dinh, cap doi',
    bestTime: 'quanh nam',
  },
  {
    key: 'CM',
    title: 'Ca Mau cuc Nam va rung ngap man',
    departureLocation: 33,
    destinationIds: [39],
    basePrice: 3790000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 7,
    theme: 'thien nhien, check-in, trai nghiem',
    audience: 'nhom ban, gia dinh',
    bestTime: 'thang 12 den thang 4',
  },
  {
    key: 'DNG',
    title: 'Dong Nai cuoi tuan xanh va nghi duong gan',
    departureLocation: 33,
    destinationIds: [32],
    basePrice: 2590000,
    durationDays: 2,
    tourType: 'domestic',
    transportId: 4,
    theme: 'gan thanh pho, nghi duong, gia dinh',
    audience: 'gia dinh, cap doi',
    bestTime: 'quanh nam',
  },
  {
    key: 'MTR',
    title: 'Mien Tay tong hop song nuoc va am thuc',
    departureLocation: 33,
    destinationIds: [38, 35, 36],
    basePrice: 3590000,
    durationDays: 3,
    tourType: 'domestic',
    transportId: 7,
    theme: 'song nuoc, am thuc, trai nghiem',
    audience: 'gia dinh, nhom ban',
    bestTime: 'quanh nam',
  },
  {
    key: 'CAM',
    title: 'Campuchia city break va van hoa Angkor',
    departureLocation: 33,
    destinationIds: [981],
    basePrice: 8990000,
    durationDays: 4,
    tourType: 'outbound',
    transportId: 5,
    theme: 'quoc te, van hoa, city break',
    audience: 'cap doi, nhom ban',
    bestTime: 'thang 11 den thang 3',
  },
  {
    key: 'CHN',
    title: 'Trung Quoc pho thi co tran va check-in',
    departureLocation: 6,
    destinationIds: [982],
    basePrice: 10990000,
    durationDays: 5,
    tourType: 'outbound',
    transportId: 2,
    theme: 'quoc te, check-in, city break',
    audience: 'cap doi, nhom ban',
    bestTime: 'mua thu va mua xuan',
  },
];

const VARIANTS: Variant[] = [
  {
    suffix: 'M',
    label: 'Tieu chuan',
    summaryTone: 'de tiep can',
    style: 'can bang nghi duong va trai nghiem',
    priceMultiplier: 1,
    durationDelta: 0,
    promo: 'phu hop nguoi dat lan dau va nhom khach muon gia hop ly',
  },
  {
    suffix: 'C1',
    label: 'Nghi duong',
    summaryTone: 'thoai mai va de chot don',
    style: 'nghi duong, lich nhe, nhieu thoi gian tu do',
    priceMultiplier: 1.16,
    durationDelta: 1,
    promo: 'uu tien khach cap doi va gia dinh muon nhip di cham hon',
  },
  {
    suffix: 'C2',
    label: 'Kham pha',
    summaryTone: 'giau trai nghiem va noi dung',
    style: 'kham pha, check-in, di chuyen nhieu hon',
    priceMultiplier: 0.94,
    durationDelta: 0,
    promo: 'phu hop nhom ban, nguoi tre va user hay tim tour trai nghiem',
  },
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function scheduleCode(tourCode: string, index: number) {
  return `${tourCode}-S${index}`;
}

function imageUrl(seed: string, index: number) {
  return `https://picsum.photos/seed/${seed}-${index}/1200/800`;
}

function buildDescription(
  family: TourFamily,
  variant: Variant,
  durationDays: number,
) {
  return [
    `${family.title} phien ban ${variant.label.toLowerCase()} tap trung vao ${variant.style}.`,
    `Lich trinh ${durationDays} ngay nay duoc tao de he goi y co them du lieu theo cum san pham, budget va muc dich di chuyen.`,
    `Chu de noi bat: ${family.theme}. Doi tuong phu hop: ${family.audience}.`,
    `Mua dep: ${family.bestTime}. Ghi chu ban hang: ${variant.promo}.`,
  ].join(' ');
}

function buildSummary(family: TourFamily, variant: Variant) {
  return `${family.title} ${variant.label.toLowerCase()} voi nhip di ${variant.summaryTone}, hop cho user thich ${family.theme}.`;
}

function buildBestFor(family: TourFamily, variant: Variant) {
  return `${family.audience}; phong cach ${variant.style}`;
}

function buildItinerary(day: number, family: TourFamily, variant: Variant) {
  if (day === 1) {
    return {
      title: `Ngay ${day} - Khoi hanh va vao vibe ${family.title}`,
      content: `Don khach, di chuyen toi diem den chinh, nhan phong va bat dau chuoi trai nghiem ${variant.style}.`,
      meals: 'Sang, Trua',
    };
  }

  return {
    title: `Ngay ${day} - Trai nghiem ${family.theme}`,
    content: `Tap trung vao ${family.theme}, tang kha nang check-in, am thuc va kham pha theo phien ban ${variant.label.toLowerCase()}.`,
    meals: day % 2 === 0 ? 'Sang, Toi' : 'Sang, Trua, Toi',
  };
}

async function seedFamily(
  prisma: PrismaClient,
  family: TourFamily,
  familyIndex: number,
) {
  let toursCreated = 0;
  let schedulesCreated = 0;

  for (const [variantIndex, variant] of VARIANTS.entries()) {
    const durationDays = family.durationDays + variant.durationDelta;
    const durationNights = Math.max(durationDays - 1, 1);
    const code = `${TOUR_PREFIX}-${String(familyIndex + 1).padStart(2, '0')}-${variant.suffix}`;
    const basePrice = Math.round(family.basePrice * variant.priceMultiplier);

    const tour = await prisma.tours.upsert({
      where: { code },
      update: {
        name: `${family.title} ${variant.label}`,
        summary: buildSummary(family, variant),
        description: buildDescription(family, variant, durationDays),
        duration_days: durationDays,
        duration_nights: durationNights,
        base_price: basePrice,
        tour_type: family.tourType,
        departure_location: family.departureLocation,
        transport_id: family.transportId,
        status: 1,
        sightseeing_summary: family.theme,
        cuisine_info: family.theme,
        best_for: buildBestFor(family, variant),
        best_time: family.bestTime,
        transport_info: `Van chuyen chinh bang transport #${family.transportId}`,
        promotion_info: variant.promo,
        cut_off_hours: 24,
      },
      create: {
        code,
        name: `${family.title} ${variant.label}`,
        summary: buildSummary(family, variant),
        description: buildDescription(family, variant, durationDays),
        duration_days: durationDays,
        duration_nights: durationNights,
        base_price: basePrice,
        tour_type: family.tourType,
        departure_location: family.departureLocation,
        transport_id: family.transportId,
        status: 1,
        sightseeing_summary: family.theme,
        cuisine_info: family.theme,
        best_for: buildBestFor(family, variant),
        best_time: family.bestTime,
        transport_info: `Van chuyen chinh bang transport #${family.transportId}`,
        promotion_info: variant.promo,
        cut_off_hours: 24,
      },
    });

    toursCreated += 1;

    await prisma.tour_destinations.deleteMany({
      where: { tour_id: tour.tour_id },
    });

    await prisma.tour_destinations.createMany({
      data: family.destinationIds.map((locationId, index) => ({
        tour_id: tour.tour_id,
        location_id: locationId,
        visit_order: index + 1,
        note: index === 0 ? 'Diem den chinh' : 'Diem ghep them cho route',
      })),
    });

    await prisma.tour_images.deleteMany({
      where: { tour_id: tour.tour_id },
    });

    await prisma.tour_images.createMany({
      data: Array.from({ length: 3 }).map((_, imageIndex) => ({
        tour_id: tour.tour_id,
        image_url: imageUrl(code, imageIndex + 1),
        is_cover: imageIndex === 0 ? 1 : 0,
        sort_order: imageIndex + 1,
      })),
    });

    for (let scheduleIndex = 1; scheduleIndex <= 2; scheduleIndex += 1) {
      const startDate = addDays(
        new Date(),
        7 + familyIndex * 3 + variantIndex * 5 + scheduleIndex * 18,
      );
      const endDate = addDays(startDate, durationDays - 1);
      const adultPrice = Math.round(
        basePrice * (scheduleIndex === 1 ? 1 : 1.05),
      );
      const quota = 18 + ((familyIndex + variantIndex + scheduleIndex) % 4) * 6;
      const bookedCount = 0;
      const codeSchedule = scheduleCode(code, scheduleIndex);

      const schedule = await prisma.tour_schedules.upsert({
        where: { code: codeSchedule },
        update: {
          tour_id: tour.tour_id,
          start_date: startDate,
          end_date: endDate,
          price: adultPrice,
          quota,
          booked_count: bookedCount,
          cover_image_url: imageUrl(codeSchedule, 1),
          status: 1,
        },
        create: {
          tour_id: tour.tour_id,
          start_date: startDate,
          end_date: endDate,
          price: adultPrice,
          quota,
          booked_count: bookedCount,
          cover_image_url: imageUrl(codeSchedule, 1),
          status: 1,
          code: codeSchedule,
        },
      });

      schedulesCreated += 1;

      await prisma.tour_schedule_prices.deleteMany({
        where: { tour_schedule_id: schedule.tour_schedule_id },
      });

      await prisma.tour_schedule_prices.createMany({
        data: [
          {
            tour_schedule_id: schedule.tour_schedule_id,
            passenger_type: 'adult',
            price: adultPrice,
            currency: 'VND',
            note: 'Gia nguoi lon',
          },
          {
            tour_schedule_id: schedule.tour_schedule_id,
            passenger_type: 'child',
            price: Math.round(adultPrice * 0.75),
            currency: 'VND',
            note: 'Gia tre em',
          },
          {
            tour_schedule_id: schedule.tour_schedule_id,
            passenger_type: 'infant',
            price: Math.round(adultPrice * 0.15),
            currency: 'VND',
            note: 'Gia em be',
          },
        ],
      });

      await prisma.tour_itineraries.deleteMany({
        where: { tour_schedule_id: schedule.tour_schedule_id },
      });

      await prisma.tour_itineraries.createMany({
        data: Array.from({ length: durationDays }).map((_, dayIndex) => {
          const itinerary = buildItinerary(dayIndex + 1, family, variant);
          return {
            tour_schedule_id: schedule.tour_schedule_id,
            day_number: dayIndex + 1,
            title: itinerary.title,
            content: itinerary.content,
            meals: itinerary.meals,
          };
        }),
      });

      const shouldHaveFlashDeal =
        scheduleIndex === 1 && (familyIndex + variantIndex) % 4 === 0;
      if (shouldHaveFlashDeal) {
        await prisma.flash_deals.upsert({
          where: { tour_schedule_id: schedule.tour_schedule_id },
          update: {
            discount_type: 'percentage',
            discount_value: 12,
            start_date: addDays(new Date(), -1),
            end_date: addDays(new Date(), 14),
            status: 1,
          },
          create: {
            tour_schedule_id: schedule.tour_schedule_id,
            discount_type: 'percentage',
            discount_value: 12,
            start_date: addDays(new Date(), -1),
            end_date: addDays(new Date(), 14),
            status: 1,
          },
        });
      } else {
        await prisma.flash_deals.deleteMany({
          where: { tour_schedule_id: schedule.tour_schedule_id },
        });
      }
    }
  }

  return { toursCreated, schedulesCreated };
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL not found');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log(`[${TOUR_PREFIX}] Start seeding recommendation tours`);

    let totalTours = 0;
    let totalSchedules = 0;

    for (const [familyIndex, family] of TOUR_FAMILIES.entries()) {
      const result = await seedFamily(prisma, family, familyIndex);
      totalTours += result.toursCreated;
      totalSchedules += result.schedulesCreated;
      console.log(
        `[${TOUR_PREFIX}] ${family.key} -> ${result.toursCreated} tours, ${result.schedulesCreated} schedules`,
      );
    }

    const [tourCount, scheduleCount] = await Promise.all([
      prisma.tours.count({
        where: { code: { startsWith: TOUR_PREFIX } },
      }),
      prisma.tour_schedules.count({
        where: { code: { startsWith: TOUR_PREFIX } },
      }),
    ]);

    console.log(
      `[${TOUR_PREFIX}] Done. Processed ${totalTours} tours / ${totalSchedules} schedules. Current DB totals: ${tourCount} tours / ${scheduleCount} schedules`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`[${TOUR_PREFIX}] Failed`, error);
  process.exit(1);
});
