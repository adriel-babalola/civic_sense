import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ImageIcon, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "../../utils/cn";
import { CONFIG } from "../../config/config";
import { stripMetadata } from "../../services/storage";
import { formatBytes } from "../../utils/formatters";
import { Alert } from "./Field";

/**
 * Evidence upload with in-browser metadata stripping.
 *
 * The order matters: the file is cleaned before it is handed to the parent, so
 * the original never leaves the browser. The user is told which method ran,
 * because claiming "metadata removed" when the re-encode fell back to
 * "unavailable" would be a lie the privacy page cannot back up.
 */
export function FileUpload({ value, onChange, error, hint, maxBytes, acceptedTypes, disabled }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [meta, setMeta] = useState(null);
  const [localError, setLocalError] = useState(null);

  const limit = maxBytes ?? CONFIG.MAX_UPLOAD_BYTES;
  const types = acceptedTypes ?? CONFIG.ACCEPTED_IMAGE_TYPES;

  // One object URL per selected file, revoked when it changes or the component
  // goes away. Creating it inline in render leaks a blob handle per re-render.
  const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setLocalError(null);

      if (!types.includes(file.type)) {
        setLocalError("Only JPEG, PNG, WebP or GIF images are supported.");
        return;
      }
      if (file.size > limit) {
        setLocalError(`Image must be under ${Math.round(limit / (1024 * 1024))} MB.`);
        return;
      }

      setProcessing(true);
      const result = await stripMetadata(file);
      setMeta(result);
      onChange?.(result.file);
      setProcessing(false);
    },
    [limit, types, onChange],
  );

  const clear = () => {
    onChange?.(null);
    setMeta(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (value) {
    return (
      <div className="space-y-2">
        <div className="cs-card flex items-center gap-3 p-3">
          <img
            src={previewUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">{value.name}</p>
            <p className="text-xs text-fg-muted">{formatBytes(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-card-active hover:text-false"
            aria-label="Remove evidence image"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {processing ? (
          <p className="cs-hint flex items-center gap-1.5">
            <Loader2 size={12} className="cs-spinner" aria-hidden="true" />
            Removing metadata…
          </p>
        ) : meta?.removed ? (
          <p className="cs-hint flex items-center gap-1.5 text-verified">
            <ShieldCheck size={12} aria-hidden="true" />
            {meta.method === "re-encoded"
              ? "Image re-encoded. Location and device metadata removed."
              : "Metadata removed before upload."}
          </p>
        ) : meta ? (
          <p className="cs-hint flex items-center gap-1.5">
            <ShieldCheck size={12} aria-hidden="true" />
            No location metadata found in this file.
          </p>
        ) : null}

        {error || localError ? (
          <p className="cs-error-text">{error || localError}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "rounded-card border border-dashed p-6 text-center transition-colors",
          isDragging ? "border-brand-bright bg-brand-bright/5" : "border-line-strong bg-surface",
          disabled && "opacity-50",
        )}
      >
        <ImageIcon size={20} className="mx-auto text-fg-faint" aria-hidden="true" />
        <p className="mt-2 text-sm text-fg-secondary">
          Drop an image here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="font-medium text-brand-bright underline underline-offset-2 hover:no-underline"
          >
            choose a file
          </button>
        </p>
        <p className="cs-hint mt-1">
          JPEG, PNG, WebP or GIF, up to {Math.round(limit / (1024 * 1024))} MB. Optional.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={types.join(",")}
          className="cs-sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
          disabled={disabled}
          tabIndex={-1}
        />
      </div>

      {processing ? (
        <p className="cs-hint flex items-center gap-1.5" role="status">
          <Loader2 size={12} className="cs-spinner" aria-hidden="true" />
          Removing metadata before upload…
        </p>
      ) : null}

      {localError ? <Alert tone="error">{localError}</Alert> : null}
      {!localError && error ? <Alert tone="error">{error}</Alert> : null}
      {hint && !localError && !error ? <p className="cs-hint">{hint}</p> : null}
    </div>
  );
}

/**
 * Copy-to-clipboard button.
 *
 * Falls back to a selection-based copy where the async Clipboard API is
 * unavailable, which is still the case on non-secure origins.
 */
export function CopyButton({ value, label = "Copy", copiedLabel = "Copied", className, size = "sm" }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement("textarea");
        el.value = value;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "cs-btn cs-btn-ghost",
        size === "sm" ? "cs-btn-sm" : "cs-btn-md",
        className,
      )}
      aria-live="polite"
    >
      {copied ? (
        <Check size={13} className="text-verified" aria-hidden="true" />
      ) : (
        <Copy size={13} aria-hidden="true" />
      )}
      {copied ? copiedLabel : label}
    </button>
  );
}

export default FileUpload;
