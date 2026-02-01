import React from "react";
import { cn } from "./utils";

interface TagProps {
  className?: string;
  children: React.ReactNode;
}

const Tag = ({ className, children }: TagProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-ink/10 bg-sand px-3 py-1 text-xs font-medium text-ink/70",
        className
      )}
    >
      {children}
    </span>
  );
};

export default Tag;
