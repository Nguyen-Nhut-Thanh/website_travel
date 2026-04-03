export type UserItem = {
  user_id: number;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_staff?: boolean;
  accounts?: {
    email?: string | null;
    status?: number;
    last_login_at?: string | null;
  } | null;
};

export type StaffFormData = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  position: string;
  employee_code: string;
};

export function createDefaultStaffForm(): StaffFormData {
  return {
    email: "",
    password: "",
    full_name: "",
    phone: "",
    position: "Nhân viên",
    employee_code: "",
  };
}

export function matchesUserSearch(user: UserItem, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return true;

  return (
    user.full_name.toLowerCase().includes(normalizedSearch) ||
    (user.accounts?.email || "").toLowerCase().includes(normalizedSearch)
  );
}
