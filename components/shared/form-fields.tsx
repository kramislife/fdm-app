"use client";

import { ReactNode, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
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

// ------------------------------- Image -----------------------------------------

interface FormImageProps extends Omit<BaseFormFieldProps, "required"> {
  value: string | null;
  onChange: (value: string | null) => void;
  aspectRatio?: string;
  maxSizeMb?: number;
  accept?: string;
}

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function FormImage({
  label,
  id,
  description,
  error,
  wrapperClassName,
  labelClassName,
  value,
  onChange,
  aspectRatio = "aspect-4/3",
  maxSizeMb = 4,
  accept = DEFAULT_ACCEPT,
}: FormImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    if (!file.type.startsWith("image/")) {
      setLocalError("Please select an image file.");
      return;
    }

    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`Image must be smaller than ${maxSizeMb}MB.`);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
    } catch {
      setLocalError("Failed to read the image. Please try again.");
    }
  }

  function handleRemove() {
    onChange(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handlePickClick() {
    inputRef.current?.click();
  }

  const displayError = error ?? localError ?? undefined;
  const hasImage = !!value;

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

      {hasImage ? (
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-md border bg-muted",
            aspectRatio,
          )}
        >
          <Image
            src={value}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            unoptimized={value.startsWith("data:")}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleRemove}
            className="absolute right-2 top-2 size-7"
            aria-label="Remove image"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePickClick}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-primary/50 border-dashed text-muted-foreground transition-colors hover:bg-muted/50 cursor-pointer",
            aspectRatio,
            displayError && ERROR_CLASSES,
          )}
        >
          <ImagePlus className="size-6" />
          <span className="text-sm font-medium">Click to upload image</span>
          <span className="text-xs">
            PNG, JPG, WEBP (Recommended ratio 4:3)
          </span>
        </button>
      )}
    </FieldWrapper>
  );
}
