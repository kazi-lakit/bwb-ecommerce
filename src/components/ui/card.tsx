import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-lg bg-canvas p-6 shadow-[var(--shadow-card)]", className)} {...props} />;
}
