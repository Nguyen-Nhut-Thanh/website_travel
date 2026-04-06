export type AuthRequestUser = {
  sub: number;
  email?: string;
  accountId?: number;
  isStaff?: boolean;
};

export type UpdateProfilePayload = {
  full_name?: string;
  phone?: string | null;
  address?: string | null;
  avatar_url?: string;
  gender?: string;
  number_id?: string | null;
};

export type ChangePasswordPayload = {
  oldPassword?: string;
  newPassword: string;
};

export type AdminLoginPayload = {
  email: string;
  password: string;
};
