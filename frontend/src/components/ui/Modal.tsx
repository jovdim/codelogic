import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  showOverlay?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-xs",
  showOverlay = true,
}: ModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`bg-[#1a1a2e]/95 backdrop-blur-md pixel-box p-6 ${maxWidth} w-full border border-[#2d2d44] shadow-2xl shadow-black/50`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );

  if (!showOverlay) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        {modalContent}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {modalContent}
    </div>
  );
}

interface ModalButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary";
  accentColor?: string;
  className?: string;
  disabled?: boolean;
}

export function ModalButton({
  onClick,
  children,
  variant = "secondary",
  accentColor,
  className = "",
  disabled = false,
}: ModalButtonProps) {
  const baseClasses =
    "w-full min-w-[140px] py-3 px-4 pixel-box font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center";

  if (variant === "primary") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} text-white ${className}`}
        style={{ backgroundColor: accentColor }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} bg-[#2d2d44] text-white hover:bg-[#3d3d5c] ${className}`}
    >
      {children}
    </button>
  );
}

interface ModalHeaderProps {
  children: ReactNode;
  onClose?: () => void;
}

export function ModalHeader({ children, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
