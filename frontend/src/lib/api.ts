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

  updateAvatar: (avatar: number) => api.patch("/auth/avatar/", { avatar }),

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

// Game API functions
export const gameAPI = {
  // Get all categories
  getCategories: () => api.get("/game/categories/"),

  // Get topic details and user progress
  getTopic: (categorySlug: string, topicSlug: string) =>
    api.get(`/game/topics/${categorySlug}/${topicSlug}/`),

  // Get quiz questions for a level
  getQuizQuestions: (categorySlug: string, topicSlug: string, level: number) =>
    api.get(`/game/quiz/${categorySlug}/${topicSlug}/${level}/`),

  // Submit an answer
  submitAnswer: (data: {
    question_id: string;
    answer: number;
    attempt_id: string;
  }) => api.post("/game/answer/", data),

  // Complete a quiz
  completeQuiz: (data: {
    category_slug: string;
    topic_slug: string;
    level: number;
    score: number;
    total_questions: number;
    hearts_lost: number;
  }) => api.post("/game/complete/", data),

  // Get leaderboard
  getLeaderboard: () => api.get("/game/leaderboard/"),

  // Get user stats
  getUserStats: () => api.get("/game/stats/"),

  // Get daily stats and challenges
  getDailyStats: () => api.get("/game/daily-stats/"),

  // Get user certificates (completed topics)
  getCertificates: () => api.get("/game/certificates/"),

  // Learning resources
  getResources: (params?: {
    search?: string;
    category?: string;
    difficulty?: string;
    language?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params?.language) queryParams.append("language", params.language);
    const queryString = queryParams.toString();
    return api.get(`/game/resources/${queryString ? `?${queryString}` : ""}`);
  },

  getResource: (slug: string) => api.get(`/game/resources/${slug}/`),
};
