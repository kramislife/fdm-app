"use client";

import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";


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
