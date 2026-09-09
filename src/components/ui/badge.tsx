import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-hairline bg-surface px-2.5 py-0.5 text-xs font-medium text-steel",
        className
      )}
      {...props}
    />
  );
}
