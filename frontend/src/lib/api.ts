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

// Module-scoped state for the refresh flow:
//   - `refreshPromise` deduplicates concurrent refreshes so 5 parallel 401s
//     don't each try (and blacklist!) the refresh token.
//   - Without this dedupe, the first refresh rotates+blacklists the token
//     and the rest fail with 401 → user gets logged out mid-session.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }
  const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
    refresh: refreshToken,
  });
  const { access, refresh: newRefresh } = response.data;
  localStorage.setItem("access_token", access);
  // Django SimpleJWT is configured with ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION,
  // so every refresh returns a NEW refresh token and invalidates the old one.
  // We must persist the new one - otherwise the next refresh hits a blacklisted
  // token and the user gets auto-logged-out.
  if (newRefresh) {
    localStorage.setItem("refresh_token", newRefresh);
  }
  return access;
}

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url: string = originalRequest?.url || "";

    // A 401 from these endpoints means "credentials rejected" - NOT
    // "access token expired". Letting the refresh-then-redirect path run
    // would hard-reload the page and erase the inline error the form just
    // rendered (e.g. "Invalid email or password. 2 attempts left").
    const isCredentialEndpoint =
      url.includes("/auth/login/") ||
      url.includes("/auth/register/") ||
      url.includes("/auth/token/refresh/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isCredentialEndpoint
    ) {
      originalRequest._retry = true;

      try {
        // Share a single in-flight refresh among all 401s that fire at once.
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const access = await refreshPromise;

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login - but only if
        // we're not already on /login (avoids the hard-reload that wipes
        // the inline error message on the login form itself).
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
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

  requestUnlock: (email: string) =>
    api.post("/auth/request-unlock/", { email }),

  getProfile: () => api.get("/auth/profile/"),

  updateProfile: (data: { display_name?: string; bio?: string }) =>
    api.patch("/auth/profile/", data),

  updateAvatar: (avatar: number) => api.patch("/auth/avatar/", { avatar }),

  // Upload the post-login face-verification snapshot. Multipart; the
  // backend overwrites the previous photo on the user record.
  loginFaceVerify: (photo: Blob) => {
    const form = new FormData();
    form.append("photo", photo, "login_face.jpg");
    return api.post("/auth/login/face-verify/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

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

  // Start a quiz: returns the questions + attempt_id.
  getQuizQuestions: (categorySlug: string, topicSlug: string, level: number) =>
    api.get(`/game/quiz/${categorySlug}/${topicSlug}/${level}/`),

  // Per-question timer expired without an answer. Backend deducts a heart
  // and bumps the attempt's hearts_lost counter; no UserAnswer is created
  // so the user can still answer on the retry timer.
  registerTimeout: (data: { attempt_id: string }) =>
    api.post("/game/timeout/", data),

  // Submit an answer. Use `answer` (int) for multiple-choice (option index)
  // or find-error (1-based line number). Use `answer_text` for fill-blank
  // and output (the typed answer string). Server is authoritative.
  submitAnswer: (data: {
    question_id: string;
    answer?: number;
    answer_text?: string;
    attempt_id: string;
  }) => api.post("/game/answer/", data),

  // Complete a quiz. Backend recomputes score and stars from persisted answers.
  completeQuiz: (data: {
    attempt_id: string;
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
