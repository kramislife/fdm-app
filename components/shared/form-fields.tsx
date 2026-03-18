"use client";

import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FieldWrapperProps {
  label: string;
  id: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}

/**
 * Base wrapper for form fields to ensure consistent label and description layout.
 */
function FieldWrapper({
  label,
  id,
  children,
  className,
  labelClassName,
  required,
  description,
}: FieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={labelClassName}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// ------------------------------- Input -----------------------------------------

interface FormInputProps
  extends Omit<React.ComponentProps<typeof Input>, "id"> {
  label: string;
  id: string;
  wrapperClassName?: string;
  labelClassName?: string;
  description?: string;
  optional?: boolean;
}

export function FormInput({
  label,
  id,
  wrapperClassName,
  labelClassName,
  required,
  description,
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
      className={wrapperClassName}
      labelClassName={labelClassName}
    >
      <Input
        id={id}
        className={className}
        required={required}
        placeholder={placeholder ?? defaultPlaceholder}
        {...props}
      />
    </FieldWrapper>
  );
}

// ------------------------------ Textarea ----------------------------------------

interface FormTextareaProps
  extends Omit<React.ComponentProps<typeof Textarea>, "id"> {
  label: string;
  id: string;
  wrapperClassName?: string;
  labelClassName?: string;
  description?: string;
}

export function FormTextarea({
  label,
  id,
  wrapperClassName,
  labelClassName,
  required,
  description,
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
      className={wrapperClassName}
      labelClassName={labelClassName}
    >
      <Textarea
        id={id}
        className={cn("min-h-[120px]", className)}
        required={required}
        placeholder={placeholder ?? defaultPlaceholder}
        {...props}
      />
    </FieldWrapper>
  );
}

// ------------------------------- Select -----------------------------------------

interface FormSelectProps {
  label: string;
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  wrapperClassName?: string;
  labelClassName?: string;
  className?: string; // Add className prop
  required?: boolean;
  description?: string;
  disabled?: boolean;
}

export function FormSelect({
  label,
  id,
  value,
  onValueChange,
  placeholder,
  options,
  wrapperClassName,
  labelClassName,
  className, // Destructure className
  required,
  description,
  disabled,
}: FormSelectProps) {
  const defaultPlaceholder = `Select ${label.toLowerCase()}`;
  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      description={description}
      className={wrapperClassName}
      labelClassName={labelClassName}
    >
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder={placeholder ?? defaultPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {options.length > 0 ? (
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
    </FieldWrapper>
  );
}

// ------------------------------- Switch -----------------------------------------

interface FormSwitchProps {
  label: string;
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
  activeDescription?: string;
  inactiveDescription?: string;
  className?: string;
  labelClassName?: string;
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
