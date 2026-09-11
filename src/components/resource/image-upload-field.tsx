"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/lib/toast-store";
import { uploadProductImage } from "@/lib/blocks/storage";

/** Small neutral gray square with a generic image glyph — this control has no product/theme context to draw a real placeholder from. */
const NEUTRAL_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="#e5e7eb"/><path d="M18 36l7-8 6 6 7-9 8 11H18z" fill="#9ca3af"/><circle cx="22" cy="20" r="4" fill="#9ca3af"/></svg>`
  );

/**
 * Replaces the plain text `Url` input on a `Media` row with a real upload control — see
 * `sub-field-input.tsx`, which renders this only for `Media.Url` specifically. Still just
 * calls `onChange(url: string)`, same as every other sub-field, so nothing about the
 * containing repeater/fieldset needed to change.
 */
export function ImageUploadField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadProductImage(file);
      onChange(uploaded.url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="h-14 w-14 flex-none overflow-hidden rounded-md border border-hairline bg-surface">
        <ImageWithFallback src={value || null} fallback={NEUTRAL_FALLBACK} alt="Media preview" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col items-start gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Spinner className="h-4 w-4" /> : <UploadCloud size={14} />}
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </Button>
        {value && !uploading && (
          <button type="button" onClick={() => onChange("")} className="text-xs text-muted hover:text-brand-error">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
