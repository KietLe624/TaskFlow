// Thông tin user
export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name?: string | null;
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

// Dữ liệu backend trả về khi đăng nhập thành công
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Đổi mật khẩu
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
  iat: number;
  exp: number;
}
