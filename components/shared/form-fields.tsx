"use client";

import { ReactNode, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import {
  detectMediaTypeFromMime,
  type AnnouncementMediaType,
} from "@/lib/constants/announcements";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/utils";

// ------------------------------- Types -----------------------------------------

interface BaseFormFieldProps {
  label: string;
  id: string;
  required?: boolean;
  description?: string;
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string;
}

const ERROR_CLASSES = "border-2 border-primary focus-visible:ring-primary";

// ------------------------------- Wrapper -----------------------------------------

interface FieldWrapperProps extends BaseFormFieldProps {
  children: ReactNode;
  className?: string; // Maps to wrapperClassName
}

function FieldWrapper({
  label,
  id,
  children,
  className,
  labelClassName,
  required,
  description,
  error,
}: FieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cn(labelClassName)}>
        {label}
        {required && <span className="text-primary">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-primary animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      ) : (
        description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )
      )}
    </div>
  );
}

// ------------------------------- Input -----------------------------------------

interface FormInputProps
  extends BaseFormFieldProps, Omit<React.ComponentProps<typeof Input>, "id"> {
  optional?: boolean;
}

export function FormInput({
  label,
  id,
  required,
  description,
  error,
  wrapperClassName,
  labelClassName,
  className,
  placeholder,
  optional,
  ...props
}: FormInputProps) {
  const defaultPlaceholder = optional
    ? `Enter ${label.toLowerCase()} (optional)`
    : `Enter ${label.toLowerCase()}`;

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      description={description}
      error={error}
      className={wrapperClassName}
      labelClassName={labelClassName}
    >
      <Input
        id={id}
        className={cn(error && ERROR_CLASSES, className)}
        placeholder={placeholder ?? defaultPlaceholder}
        {...props}
      />
    </FieldWrapper>
  );
}

// ------------------------------ Textarea ----------------------------------------

interface FormTextareaProps
  extends
    BaseFormFieldProps,
    Omit<React.ComponentProps<typeof Textarea>, "id"> {}

export function FormTextarea({
  label,
  id,
  required,
  description,
  error,
  wrapperClassName,
  labelClassName,
  className,
  placeholder,
  ...props
}: FormTextareaProps) {
  const defaultPlaceholder = `Enter ${label.toLowerCase()} (optional)`;

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      description={description}
      error={error}
      className={wrapperClassName}
      labelClassName={labelClassName}
    >
      <Textarea
        id={id}
        className={cn("min-h-30", error && ERROR_CLASSES, className)}
        placeholder={placeholder ?? defaultPlaceholder}
        {...props}
      />
    </FieldWrapper>
  );
}

// ------------------------------- Select -----------------------------------------

export interface FormSelectGroup {
  label: string;
  options: { value: string; label: string }[];
}

interface FormSelectProps extends BaseFormFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: { value: string; label: string }[];
  groups?: FormSelectGroup[];
  placeholder?: string;
  className?: string; // For the trigger
  disabled?: boolean;
}

export function FormSelect({
  label,
  id,
  required,
  description,
  error,
  wrapperClassName,
  labelClassName,
  value,
  onValueChange,
  options,
  groups,
  placeholder,
  className,
  disabled,
}: FormSelectProps) {
  const defaultPlaceholder = `Select ${label.toLowerCase()}`;

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      description={description}
      error={error}
      className={wrapperClassName}
      labelClassName={labelClassName}
    >
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            id={id}
            className={cn(error && ERROR_CLASSES, className)}
          >
            <SelectValue placeholder={placeholder ?? defaultPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {groups ? (
              groups.every((g) => g.options.length === 0) ? (
                <div className="p-5 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                groups
                  .filter((g) => g.options.length > 0)
                  .map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))
              )
            ) : options && options.length > 0 ? (
              options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))
            ) : (
              <div className="p-5 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </FieldWrapper>
  );
}

// ------------------------------- Switch -----------------------------------------

interface FormSwitchProps extends Omit<
  BaseFormFieldProps,
  "required" | "error"
> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  activeDescription?: string;
  inactiveDescription?: string;
  className?: string;
}

export function FormSwitch({
  label,
  id,
  checked,
  onCheckedChange,
  description,
  activeDescription = "Visible in selections",
  inactiveDescription = "Hidden from selections",
  className,
  labelClassName,
}: FormSwitchProps) {
  const statusDescription =
    description ||
    (checked
      ? `Active — ${activeDescription}`
      : `Inactive — ${inactiveDescription}`);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className={labelClassName}>
          {label}
        </Label>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {statusDescription && (
        <p className="text-xs text-muted-foreground">{statusDescription}</p>
      )}
    </div>
  );
}

// ------------------------------- Media (image / gif / video) -------------------

interface FormMediaProps extends Omit<BaseFormFieldProps, "required"> {
  value: string | null;
  mediaType: AnnouncementMediaType | null;
  onChange: (
    value: string | null,
    mediaType: AnnouncementMediaType | null,
  ) => void;
  aspectRatio?: string;
  maxSizeMb?: number;
  /** Hint shown in the empty dropzone. Falls back to a sensible default per mode. */
  hint?: string;
  /** Restrict to static images only (PNG / JPG / WEBP). */
  imageOnly?: boolean;
}

const IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";
const MEDIA_ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function FormMedia({
  label,
  id,
  description,
  error,
  wrapperClassName,
  labelClassName,
  value,
  mediaType,
  onChange,
  aspectRatio = "aspect-[16/9]",
  maxSizeMb = 4,
  hint,
  imageOnly = false,
}: FormMediaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const accept = imageOnly ? IMAGE_ACCEPT : MEDIA_ACCEPT;
  const defaultHint = imageOnly
    ? "PNG, JPG, WEBP (Recommended ratio 4:3)"
    : "Image, GIF, or video";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError(null);

    if (imageOnly) {
      if (!file.type.startsWith("image/") || file.type === "image/gif") {
        setLocalError("Please select a PNG, JPG, or WEBP image.");
        return;
      }
      const maxBytes = maxSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        setLocalError(`Image must be smaller than ${maxSizeMb}MB.`);
        return;
      }
      try {
        onChange(await fileToBase64(file), "image");
      } catch {
        setLocalError("Failed to read the image. Please try again.");
      }
      return;
    }

    const detected = detectMediaTypeFromMime(file.type);
    if (!detected) {
      setLocalError("Unsupported file type. Use image, GIF, or video.");
      return;
    }
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`File must be smaller than ${maxSizeMb}MB.`);
      return;
    }
    try {
      onChange(await fileToBase64(file), detected);
    } catch {
      setLocalError("Failed to read the file. Please try again.");
    }
  }

  function handleRemove() {
    onChange(null, null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const displayError = error ?? localError ?? undefined;
  const isVideo = mediaType === "video";
  const isGif = mediaType === "gif";

  const preview = value ? (
    isVideo ? (
      <video
        src={value}
        className="absolute inset-0 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    ) : isGif ? (
      // Use plain img for GIFs to preserve animation
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={value}
        alt={label}
        className="absolute inset-0 size-full object-cover"
      />
    ) : (
      <Image
        src={value}
        alt={label}
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        className="object-cover"
        unoptimized={value.startsWith("data:")}
      />
    )
  ) : null;

  return (
    <FieldWrapper
      label={label}
      id={id}
      description={description}
      error={displayError}
      className={wrapperClassName}
      labelClassName={labelClassName}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      <FilePickerShell
        hasMedia={!!value}
        aspectRatio={aspectRatio}
        displayError={displayError}
        onRemove={handleRemove}
        onPickClick={() => inputRef.current?.click()}
        dropzoneIcon={<ImagePlus className="size-6" />}
        dropzonePrimary={
          imageOnly ? "Click to upload image" : "Click to upload"
        }
        dropzoneSecondary={hint ?? defaultHint}
        preview={preview}
      />
    </FieldWrapper>
  );
}

// ------------------------------- Shared file-picker shell -----------------------
// Private — not exported. Used only by FormMedia above.

interface FilePickerShellProps {
  hasMedia: boolean;
  aspectRatio: string;
  displayError?: string;
  onRemove: () => void;
  onPickClick: () => void;
  dropzoneIcon: ReactNode;
  dropzonePrimary: string;
  dropzoneSecondary: string;
  preview: ReactNode;
}

function FilePickerShell({
  hasMedia,
  aspectRatio,
  displayError,
  onRemove,
  onPickClick,
  dropzoneIcon,
  dropzonePrimary,
  dropzoneSecondary,
  preview,
}: FilePickerShellProps) {
  if (hasMedia) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md border bg-muted",
          aspectRatio,
        )}
      >
        {preview}
        <Button
          type="button"
          size="icon"
          onClick={onRemove}
          className="absolute right-2 top-2 size-7"
          aria-label="Remove"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onPickClick}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-primary/50 border-dashed text-muted-foreground transition-colors hover:bg-muted/50 cursor-pointer",
        aspectRatio,
        displayError && ERROR_CLASSES,
      )}
    >
      {dropzoneIcon}
      <span className="text-sm font-medium">{dropzonePrimary}</span>
      <span className="text-xs">{dropzoneSecondary}</span>
    </button>
  );
}
