import React from "react";
import { cn } from "./utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "accent" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leadingIcon?: React.ReactNode;
  iconOnly?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sand disabled:opacity-60 disabled:cursor-not-allowed";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-fixed text-sand-fixed dark:bg-paper-fixed dark:text-ink-fixed shadow-soft hover:translate-y-[-1px] hover:shadow-lift",
  outline:
    "border border-ink/20 bg-paper/70 text-ink hover:border-ink/40 hover:bg-ink/5",
  ghost: "text-ink hover:bg-ink/5",
  accent: "bg-ember text-sand shadow-soft hover:bg-ember/90 hover:shadow-lift",
  danger: "bg-red-600 text-white shadow-soft hover:bg-red-700 hover:shadow-lift",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      isLoading,
      leadingIcon,
      iconOnly = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          iconOnly ? "p-0" : null,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-sand/70 border-t-transparent" />
        ) : (
          <>
            {leadingIcon && (
              <span className={iconOnly ? "text-lg" : "mr-2 text-lg"}>{leadingIcon}</span>
            )}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
