import React from "react";
import { cn } from "./utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[120px] w-full rounded-xl border border-ink/10 bg-paper/80 px-3 py-2 text-sm text-ink placeholder:text-ink/40 shadow-sm focus:border-ocean focus:ring-2 focus:ring-ocean/30",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
