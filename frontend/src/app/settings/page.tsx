"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import Sidebar from "@/components/layout/Sidebar";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  Calendar,
  Mail,
  Shield,
  Eye,
  EyeOff,
  X,
  ChevronRight,
  Clock,
} from "lucide-react";
import { AxiosError } from "axios";

type Tab = "profile" | "password" | "account";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  if (!user) return null;

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="min-h-screen pb-8">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Settings Tabs */}
              <div className="w-full md:w-48 shrink-0">
                <nav className="flex md:flex-col gap-2 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors whitespace-nowrap ${
                      activeTab === "profile"
                        ? "bg-purple-500/20 text-purple-400 border-l-2 border-purple-500"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === "password"
                        ? "bg-purple-500/20 text-purple-400 border-l-2 border-purple-500"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    Password
                  </button>
                  <button
                    onClick={() => setActiveTab("account")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === "account"
                        ? "bg-red-500/20 text-red-400 border-l-2 border-red-500"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Trash2 className="w-5 h-5" />
                    Account
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1">
                {activeTab === "profile" && (
                  <ProfileSettings user={user} updateUser={updateUser} />
                )}
                {activeTab === "password" && <PasswordSettings />}
                {activeTab === "account" && (
                  <AccountSettings logout={logout} router={router} />
                )}
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </ProtectedRoute>
  );
}

interface ProfileSettingsProps {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  updateUser: (user: NonNullable<ReturnType<typeof useAuth>["user"]>) => void;
}

function ProfileSettings({ user, updateUser }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || 1);
  const [pendingAvatar, setPendingAvatar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAvatarClick = (avatarNum: number) => {
    if (avatarNum === selectedAvatar) return;
    setPendingAvatar(avatarNum);
  };

  const confirmAvatarChange = async () => {
    if (!pendingAvatar) return;

    setIsAvatarLoading(true);
    setMessage(null);

    try {
      const response = await authAPI.updateAvatar(pendingAvatar);
      setSelectedAvatar(pendingAvatar);
      updateUser({ ...user, avatar: response.data.avatar });
      setMessage({ type: "success", text: "Avatar updated!" });
    } catch {
      setMessage({ type: "error", text: "Failed to update avatar." });
    } finally {
      setIsAvatarLoading(false);
      setPendingAvatar(null);
    }
  };

  const cancelAvatarChange = () => {
    setPendingAvatar(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await authAPI.updateProfile({
        display_name: displayName,
      });
      updateUser(response.data.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pixel-box p-6">
      <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>

      {/* Account Info */}
      <div className="mb-6 space-y-3 pb-6 border-b border-[#2d2d44]">
        <div className="flex items-center gap-3 text-gray-400">
          <Mail className="w-5 h-5" />
          <span>{user.email}</span>
          {user.is_email_verified && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <Shield className="w-4 h-4" />
              Verified
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <User className="w-5 h-5" />
          <span>@{user.username}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <Calendar className="w-5 h-5" />
          <span>
            Joined {user.member_since} ({user.days_since_joined} days ago)
          </span>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="mb-6 pb-6 border-b border-[#2d2d44]">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Your Avatar</h3>

        {/* Current Avatar Display */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-3 border-purple-500 shadow-lg shadow-purple-500/25">
              <img
                src={`/avatars/avatar-${selectedAvatar}.png`}
                alt="Current Avatar"
                className="w-full h-full object-cover object-top scale-150"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Current
            </div>
          </div>
          <div>
            <p className="text-white font-medium">Profile Picture</p>
            <p className="text-gray-400 text-sm">Select a new avatar below</p>
          </div>
        </div>

        {/* Avatar Options */}
        <p className="text-gray-400 text-sm mb-3">Choose a different avatar:</p>
        <div className="flex gap-3 flex-wrap">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleAvatarClick(num)}
              disabled={isAvatarLoading || num === selectedAvatar}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedAvatar === num
                  ? "border-purple-500 opacity-50 cursor-not-allowed"
                  : "border-[#2d2d44] hover:border-purple-400 hover:scale-105"
              } ${isAvatarLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <img
                src={`/avatars/avatar-${num}.png`}
                alt={`Avatar ${num}`}
                className="w-full h-full object-cover object-top scale-150"
              />
              {selectedAvatar === num && (
                <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar Change Confirmation Popup */}
      {pendingAvatar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="pixel-box p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200 shadow-2xl shadow-black/50">
            <h3 className="text-lg font-bold text-white mb-4 text-center">
              Change Avatar?
            </h3>

            {/* Preview */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-600 mx-auto mb-2">
                  <img
                    src={`/avatars/avatar-${selectedAvatar}.png`}
                    alt="Current"
                    className="w-full h-full object-cover object-top scale-150"
                  />
                </div>
                <p className="text-gray-400 text-xs">Current</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-500" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-purple-500 mx-auto mb-2">
                  <img
                    src={`/avatars/avatar-${pendingAvatar}.png`}
                    alt="New"
                    className="w-full h-full object-cover object-top scale-150"
                  />
                </div>
                <p className="text-purple-400 text-xs">New</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelAvatarChange}
                disabled={isAvatarLoading}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAvatarChange}
                disabled={isAvatarLoading}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAvatarLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mb-4 px-4 py-3 flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/50 text-green-400"
              : "bg-red-500/10 border border-red-500/50 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`input-field ${!user.can_change_display_name && displayName !== user.display_name ? "opacity-50" : ""}`}
            placeholder="How should we call you?"
            maxLength={100}
            disabled={
              !user.can_change_display_name && displayName !== user.display_name
            }
          />
          {user.can_change_display_name ? (
            <p className="text-gray-500 text-sm mt-1">
              This is the name that will be displayed publicly.
            </p>
          ) : (
            <p className="text-amber-500 text-sm mt-1 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              You can change your display name again on{" "}
              {user.next_display_name_change
                ? new Date(user.next_display_name_change).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )
                : "soon"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            (!user.can_change_display_name && displayName !== user.display_name)
          }
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const passwordRequirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Contains a number", test: (p: string) => /\d/.test(p) },
    { label: "Contains a letter", test: (p: string) => /[a-zA-Z]/.test(p) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (!passwordRequirements.every((req) => req.test(newPassword))) {
      setMessage({
        type: "error",
        text: "Password does not meet requirements.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to change password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pixel-box p-6">
      <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>

      {message && (
        <div
          className={`mb-4 px-4 py-3 flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/50 text-green-400"
              : "bg-red-500/10 border border-red-500/50 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field pl-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showCurrentPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field pl-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showNewPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
          {newPassword && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {req.test(newPassword) ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-500" />
                  )}
                  <span
                    className={
                      req.test(newPassword) ? "text-green-400" : "text-gray-500"
                    }
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field pl-12 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showConfirmPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Changing...
            </>
          ) : (
            "Change Password"
          )}
        </button>
      </form>
    </div>
  );
}

interface AccountSettingsProps {
  logout: () => Promise<void>;
  router: ReturnType<typeof useRouter>;
}

function AccountSettings({ logout, router }: AccountSettingsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm.");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.deleteAccount({ password, confirm_text: confirmText });
      await logout();
      router.push("/");
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      setError(error.response?.data?.error || "Failed to delete account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pixel-box p-6 border-red-500/30">
      <h2 className="text-xl font-bold text-white mb-2">Danger Zone</h2>
      <p className="text-gray-400 mb-6">
        Once you delete your account, there is no going back. Please be certain.
      </p>

      <button
        onClick={() => setShowDeleteModal(true)}
        className="btn-danger flex items-center gap-2"
      >
        <Trash2 className="w-5 h-5" />
        Delete Account
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="pixel-box p-6 max-w-md w-full shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Delete Account</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPassword("");
                  setConfirmText("");
                  setError("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 mb-4">
              <p className="font-medium">
                Warning: This action is irreversible!
              </p>
              <p className="text-sm mt-1">
                All your progress, achievements, and data will be permanently
                deleted.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label
                  htmlFor="deletePassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Enter your password
                </label>
                <input
                  id="deletePassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmDelete"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Type DELETE to confirm
                </label>
                <input
                  id="confirmDelete"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="input-field"
                  placeholder="DELETE"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPassword("");
                    setConfirmText("");
                    setError("");
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || confirmText !== "DELETE"}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
