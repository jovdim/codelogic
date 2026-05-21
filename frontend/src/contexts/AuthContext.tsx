"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsFaceVerification: boolean;
  markFaceVerified: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    passwordConfirm: string,
  ) => Promise<void>;
  updateUser: (user: User) => void;
  updateUserHearts: (hearts: number) => void;
  refreshUser: () => Promise<void>;
}

const FACE_VERIFIED_KEY = "face_verified_session";

function isStudent(u: User | null): boolean {
  return !!u && !u.is_staff;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [faceVerified, setFaceVerified] = useState(false);

  const isAuthenticated = !!user;
  const needsFaceVerification = isStudent(user) && !faceVerified;

  const markFaceVerified = () => {
    sessionStorage.setItem(FACE_VERIFIED_KEY, "1");
    setFaceVerified(true);
  };

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
          // Restore the face-verified flag from sessionStorage so a page
          // reload mid-session doesn't re-prompt. sessionStorage is cleared
          // on tab close, so a fresh tab will still require verification.
          if (sessionStorage.getItem(FACE_VERIFIED_KEY) === "1") {
            setFaceVerified(true);
          }
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { tokens, user: userData } = response.data;

    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    setUser(userData);
    // Staff/superusers skip the face check.
    if (userData.is_staff) {
      sessionStorage.setItem(FACE_VERIFIED_KEY, "1");
      setFaceVerified(true);
    } else {
      sessionStorage.removeItem(FACE_VERIFIED_KEY);
      setFaceVerified(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      // Ignore errors during logout
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      sessionStorage.removeItem(FACE_VERIFIED_KEY);
      setUser(null);
      setFaceVerified(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    passwordConfirm: string,
  ) => {
    await authAPI.register({
      email,
      username,
      password,
      password_confirm: passwordConfirm,
    });
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const updateUserHearts = (hearts: number) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, current_hearts: hearts };
    });
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      // Handle error silently
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        needsFaceVerification,
        markFaceVerified,
        login,
        logout,
        register,
        updateUser,
        updateUserHearts,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
