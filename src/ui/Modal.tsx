import React from "react";
import { cn } from "./utils";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

const Modal = ({ open, onClose, className, children }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-ink/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-3xl border border-ink/10 bg-paper p-6 shadow-soft",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
