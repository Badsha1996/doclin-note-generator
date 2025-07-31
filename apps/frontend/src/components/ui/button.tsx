import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        // destructive:
        //   "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // outline:
        //   "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        // secondary:
        //   "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        // ghost:
        //   "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        // link: "text-primary underline-offset-4 hover:underline",
        vibe: 
          "bg-secondary text-secondary-foreground hover:bg-muted shadow-md",
        focusGlow:
          "bg-muted text-secondary-foreground hover:bg-chart-2 shadow-[0_0_10px_var(--chart-2)]",
        glass:
          "bg-card/30 backdrop-blur-md text-card-foreground border border-border hover:bg-card/50",
        neonOutline:
          "bg-transparent text-muted border border-muted hover:bg-muted/10",
        frosted:
          "bg-accent/50 text-accent-foreground backdrop-blur-md ring-1 ring-ring hover:bg-accent/70",
        ghost: 
          "bg-transparent text-popover-foreground hover:bg-white/10",
        lavender: 
          "bg-chart-2 text-foreground hover:bg-chart-1",
        destructive: 
          "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
