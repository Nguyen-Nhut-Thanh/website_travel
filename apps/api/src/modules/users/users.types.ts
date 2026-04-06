export type CreateStaffPayload = {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
  employee_code?: string;
  position?: string;
};
