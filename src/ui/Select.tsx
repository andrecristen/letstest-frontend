import React from "react";
import { cn } from "./utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm text-ink focus:border-ocean focus:ring-2 focus:ring-ocean/30",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export default Select;
