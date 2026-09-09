import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded bg-brand-accent-soft px-2.5 py-1 text-xs font-semibold text-brand-accent",
        className
      )}
      {...props}
    />
  );
}
