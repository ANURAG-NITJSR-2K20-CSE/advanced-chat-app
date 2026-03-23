import React from "react";
import { cn } from "@/lib/utils";

/**
 * Centered empty / hint block for lists and panels.
 */
export function EmptyState({ icon: Icon, title, description, className, children }) {
  return (
    <div
      className={cn(
        "text-muted-foreground flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm",
        className
      )}
    >
      {Icon && <Icon className="text-muted-foreground/80 h-10 w-10 stroke-[1.25]" aria-hidden />}
      {title && <p className="text-foreground text-base font-medium">{title}</p>}
      {description && <p className="max-w-sm leading-relaxed">{description}</p>}
      {children}
    </div>
  );
}
