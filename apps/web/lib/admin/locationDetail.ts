import type { AdminLocationItem } from "@/types/admin-location";

export const LOCATION_LEVEL_LABELS: Record<number, string> = {
  1: "Toàn cầu",
  2: "Nhóm Châu lục",
  3: "Quốc gia",
  4: "Miền",
  5: "Tỉnh / Thành phố",
  6: "Thành phố / Điểm đến",
  7: "Địa điểm tham quan",
};

export function getLocationLevelLabel(levelId: number, fallback = "") {
  return LOCATION_LEVEL_LABELS[levelId] || fallback;
}

export const LOCATION_LEVEL_DESCRIPTIONS: Record<number, string> = {
  3: "Quản lý theo đơn vị Quốc gia (VD: Việt Nam, Nhật Bản)",
  4: "Các vùng kinh tế, địa lý lớn (VD: Miền Bắc, Miền Trung)",
  5: "Các tỉnh thành trực thuộc trung ương hoặc tương đương",
  6: "Các thành phố du lịch, quận huyện trọng điểm",
  7: "Các điểm dừng chân, thắng cảnh, di tích cụ thể",
};

export type LocationDetailForm = {
  name: string;
  slug: string;
  location_type: string;
  level_id: number;
  parent_id: string | number;
  country_code: string;
  note: string;
  image_url: string;
  is_featured: boolean;
  featured_order: number | null;
};

export function createDefaultLocationDetailForm(): LocationDetailForm {
  return {
    name: "",
    slug: "",
    location_type: "city_destination",
    level_id: 3,
    parent_id: "",
    country_code: "VN",
    note: "",
    image_url: "",
    is_featured: false,
    featured_order: null,
  };
}

export function slugifyLocationName(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getLocationHierarchyPreview(params: {
  form: LocationDetailForm;
  level3Id: string;
  level4Id: string;
  level5Id: string;
  level6Id: string;
  level3List: AdminLocationItem[];
  level4List: AdminLocationItem[];
  level5List: AdminLocationItem[];
  level6List: AdminLocationItem[];
}) {
  const { form, level3Id, level4Id, level5Id, level6Id, level3List, level4List, level5List, level6List } = params;

  return {
    level3: level3List.find((item) => String(item.location_id) === level3Id)?.name || "Chưa chọn Quốc gia",
    level4:
      level4List.find((item) => String(item.location_id) === level4Id)?.name ||
      (form.level_id === 4 ? "Tên điểm mới" : "Chưa chọn Miền"),
    level5:
      level5List.find((item) => String(item.location_id) === level5Id)?.name ||
      (form.level_id === 5 ? "Tên điểm mới" : "Chưa chọn Tỉnh"),
    level6:
      level6List.find((item) => String(item.location_id) === level6Id)?.name ||
      (form.level_id === 6 ? "Tên điểm mới" : "Chưa chọn TP"),
    level7: form.name || "Điểm tham quan mới",
  };
}

type AdminLocationFetcher = (path: string) => Promise<Response>;

type LocationHierarchyState = {
  level3Id: string;
  level4Id: string;
  level5Id: string;
  level6Id: string;
  level4List: AdminLocationItem[];
  level5List: AdminLocationItem[];
  level6List: AdminLocationItem[];
};

async function fetchLocationById(
  fetcher: AdminLocationFetcher,
  locationId: string | number,
) {
  const response = await fetcher(`/admin/locations/${locationId}`);
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AdminLocationItem;
}

export async function fetchLocationOptionsByLevel(
  fetcher: AdminLocationFetcher,
  level: number,
  parent?: string | number,
) {
  const url = `/admin/locations/by-level?level_id=${level}${parent ? `&parent_id=${parent}` : ""}`;
  const response = await fetcher(url);

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as AdminLocationItem[];
}

export async function buildLocationHierarchyState(
  fetcher: AdminLocationFetcher,
  currentLevel: number,
  parentId: number,
): Promise<LocationHierarchyState> {
  const initialState: LocationHierarchyState = {
    level3Id: "",
    level4Id: "",
    level5Id: "",
    level6Id: "",
    level4List: [],
    level5List: [],
    level6List: [],
  };

  if (currentLevel === 4) {
    return { ...initialState, level3Id: String(parentId) };
  }

  if (currentLevel === 5) {
    const level4Data = await fetchLocationById(fetcher, parentId);
    if (!level4Data?.parent_id) {
      return initialState;
    }

    return {
      ...initialState,
      level3Id: String(level4Data.parent_id),
      level4Id: String(parentId),
      level4List: await fetchLocationOptionsByLevel(fetcher, 4, level4Data.parent_id),
    };
  }

  if (currentLevel === 6) {
    const level5Data = await fetchLocationById(fetcher, parentId);
    if (!level5Data?.parent_id) {
      return initialState;
    }

    const level4Data = await fetchLocationById(fetcher, level5Data.parent_id);
    if (!level4Data?.parent_id) {
      return initialState;
    }

    const [level4List, level5List] = await Promise.all([
      fetchLocationOptionsByLevel(fetcher, 4, level4Data.parent_id),
      fetchLocationOptionsByLevel(fetcher, 5, level5Data.parent_id),
    ]);

    return {
      ...initialState,
      level3Id: String(level4Data.parent_id),
      level4Id: String(level5Data.parent_id),
      level5Id: String(parentId),
      level4List,
      level5List,
    };
  }

  if (currentLevel === 7) {
    const level6Data = await fetchLocationById(fetcher, parentId);
    if (!level6Data?.parent_id) {
      return initialState;
    }

    const level5Data = await fetchLocationById(fetcher, level6Data.parent_id);
    if (!level5Data?.parent_id) {
      return initialState;
    }

    const level4Data = await fetchLocationById(fetcher, level5Data.parent_id);
    if (!level4Data?.parent_id) {
      return initialState;
    }

    const [level4List, level5List, level6List] = await Promise.all([
      fetchLocationOptionsByLevel(fetcher, 4, level4Data.parent_id),
      fetchLocationOptionsByLevel(fetcher, 5, level5Data.parent_id),
      fetchLocationOptionsByLevel(fetcher, 6, level6Data.parent_id),
    ]);

    return {
      ...initialState,
      level3Id: String(level4Data.parent_id),
      level4Id: String(level5Data.parent_id),
      level5Id: String(level6Data.parent_id),
      level6Id: String(parentId),
      level4List,
      level5List,
      level6List,
    };
  }

  return initialState;
}
