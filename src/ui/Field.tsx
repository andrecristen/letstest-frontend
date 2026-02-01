import React from "react";
import { cn } from "./utils";

interface FieldProps {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

const Field = ({ id, label, hint, error, className, children }: FieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink/60">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Field;
