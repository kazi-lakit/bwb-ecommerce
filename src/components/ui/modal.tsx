"use client";

import { ReactNode, useEffect } from "react";
import clsx from "clsx";

export function Modal({
  onClose,
  children,
  className,
  labelledBy,
}: {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** id of the element (usually the dialog's heading) that names it for screen readers. */
  labelledBy?: string;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={clsx("w-full max-w-sm rounded-lg border border-hairline bg-canvas p-6 shadow-xl", className)}
      >
        {children}
      </div>
    </div>
  );
}
