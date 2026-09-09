import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "h-10 w-full rounded-md border border-hairline bg-canvas px-3.5 text-sm text-ink placeholder:text-muted",
        "outline-none focus:border-2 focus:border-brand-accent focus:px-[13px]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
