// Thông tin user
export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name?: string | null;
  phone_number?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  roles?: string[]; // ['admin', 'member', ...]
  created_at?: string;
  updated_at?: string;
}

// đăng ký
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// đăng nhập
export interface LoginRequest {
  loginInput: string; // có thể là email hoặc username
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface MyJwtPayload {
  user_id: number;
  email: string;
  roles: any[];
  username: string;
  full_name: string;
  avatar_url?: string;
  iat: number;
  exp: number;
}


