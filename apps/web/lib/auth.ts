const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost") return "http://localhost:4000";
  }
  return "https://api.nhutthanh.id.vn";
};

export const API_BASE = getApiBase();

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_token', token);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_token');
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_token');
  }
};

export const fetchMe = async () => {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      removeToken();
      return null;
    }
    return await res.json();
  } catch (error) {
    return null;
  }
};
