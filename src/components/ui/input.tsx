import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "h-10 w-full rounded-md border border-hairline bg-canvas px-3.5 text-sm text-ink placeholder:text-muted",
        "outline-none transition-shadow focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
