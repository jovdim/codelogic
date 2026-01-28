import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem("access_token", access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Auth API functions
export const authAPI = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
  }) => api.post("/auth/register/", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login/", data),

  logout: (refreshToken: string) =>
    api.post("/auth/logout/", { refresh: refreshToken }),

  verifyEmail: (token: string) => api.post("/auth/verify-email/", { token }),

  resendVerification: (email: string) =>
    api.post("/auth/resend-verification/", { email }),

  getProfile: () => api.get("/auth/profile/"),

  updateProfile: (data: { display_name?: string; bio?: string }) =>
    api.patch("/auth/profile/", data),

  updateAvatar: (avatar: number) =>
    api.patch("/auth/avatar/", { avatar }),

  changePassword: (data: {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => api.post("/auth/password/change/", data),

  requestPasswordReset: (email: string) =>
    api.post("/auth/password/reset/", { email }),

  validateResetToken: (token: string) =>
    api.get(`/auth/password/reset/validate/?token=${token}`),

  confirmPasswordReset: (data: {
    token: string;
    new_password: string;
    new_password_confirm: string;
  }) => api.post("/auth/password/reset/confirm/", data),

  deleteAccount: (data: { password: string; confirm_text: string }) =>
    api.post("/auth/delete-account/", data),

  checkUsername: (username: string) =>
    api.get(`/auth/check-username/?username=${username}`),

  checkEmail: (email: string) => api.get(`/auth/check-email/?email=${email}`),
};
