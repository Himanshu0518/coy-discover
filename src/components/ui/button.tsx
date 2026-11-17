import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-semibold transition-[transform,box-shadow,background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coy focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-cream shadow-[0_12px_24px_-16px_rgba(23,21,29,0.9)] hover:bg-ink/90",
        pink: "border-2 border-ink bg-coy text-white shadow-[3px_3px_0_0_#17151D] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_#17151D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#17151D]",
        outline:
          "border border-ink/15 bg-white/80 text-ink hover:border-ink/25 hover:bg-white",
        ghost: "text-ink/55 hover:bg-ink/[0.05] hover:text-ink",
        white:
          "border-2 border-ink bg-white text-ink shadow-[3px_3px_0_0_#17151D] hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        sm: "h-9 px-4 text-[12px]",
        md: "h-11 px-5 text-[13px]",
        lg: "h-12 px-6 text-[14px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export { buttonVariants };

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
