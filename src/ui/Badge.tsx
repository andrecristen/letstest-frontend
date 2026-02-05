import React from "react";
import { cn } from "./utils";

type BadgeVariant = "neutral" | "accent" | "success" | "danger" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "border-ink/10 bg-paper text-ink/70",
  accent: "border-ember/30 bg-ember/10 text-ember",
  success: "border-pine/30 bg-pine/10 text-pine",
  danger: "border-red-500/30 bg-red-500/10 text-red-600",
  info: "border-sky-300/70 bg-sky-100/60 text-sky-700",
};

const Badge = ({ variant = "neutral", className, children }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
