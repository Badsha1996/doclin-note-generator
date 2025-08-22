import * as React from "react";

import { cn } from "@/lib/utils";

type InputVariant = "default" | "outline" | "filled" | "custom";

const variantClasses: Record<InputVariant, string> = {
  default:
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  outline:
    "bg-transparent border-[2px] border-[var(--primary)] focus-visible:border-[var(--accent)]",
  filled:
    "bg-[var(--input)] border-[var(--border)] text-[var(--foreground)]",
  custom:
    "w-full px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-pink-500"
};

function Input({ className, type, variant = "default", ...props }: React.ComponentProps<"input"> & { variant?: InputVariant }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        variantClasses[variant],
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
