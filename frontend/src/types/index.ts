export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar: number; // 1-5 preset avatars
  bio: string;
  is_email_verified: boolean;
  date_joined: string;
  member_since: string;
  days_since_joined: number;
  last_active: string;
  xp: number;
  level: number;
  current_hearts: number;
  max_hearts: number;
  current_streak: number;
  longest_streak: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  message: string;
  tokens: AuthTokens;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface ApiError {
  error?: string;
  message?: string;
  code?: string;
  [key: string]: string | string[] | undefined;
}
