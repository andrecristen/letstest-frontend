import React from "react";
import { cn } from "./utils";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  containerStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Modal = ({ open, onClose, containerStyle, className, style, children }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-12" style={containerStyle}>
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-3xl border border-ink/10 bg-paper/95 p-6 shadow-soft",
          className
        )}
        style={style}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
