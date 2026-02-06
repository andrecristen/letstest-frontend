import React from "react";
import { cn } from "./utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-ink/10 bg-paper/80 px-3 py-2 text-sm text-ink placeholder:text-ink/40 shadow-sm focus:border-ocean focus:ring-2 focus:ring-ocean/30",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
