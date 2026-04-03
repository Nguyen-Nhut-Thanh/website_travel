const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "https://api.nhutthanh.id.vn";

type PublicFetchOptions = RequestInit;

export type GetPublicToursParams = {
  search?: string;
  destination?: string;
  departure_location?: string;
  date_from?: string;
  min_price?: string | number;
  max_price?: string | number;
  collection?: string;
  take?: string | number;
  skip?: string | number;
};

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function publicFetch<T>(
  path: string,
  options: PublicFetchOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Thêm Token người dùng nếu có
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('user_token');
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Public fetch failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function getPublicTours<T>(
  params: GetPublicToursParams = {},
  options: PublicFetchOptions = {},
): Promise<T> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  const path = queryString ? `/tours/public?${queryString}` : "/tours/public";

  return publicFetch<T>(path, options);
}

export async function getPublicTourDetail<T>(
  tourId: string | number,
  options: PublicFetchOptions = {},
): Promise<T> {
  return publicFetch<T>(`/tours/public/${tourId}`, options);
}
