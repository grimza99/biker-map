"use client";

import type { InputHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

import { FieldBaseProps, FieldShell } from "./FieldShell";

export type InputProps = FieldBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    fieldClassName,
    helperText,
    errorText,
    label,
    leftIcon,
    rightIcon,
    size = "md",
    id,
    disabled,
    ...props
  },
  ref
) {
  const fallbackId = useId();
  const resolvedId = id ?? fallbackId;

  return (
    <FieldShell
      id={resolvedId}
      label={label}
      helperText={helperText}
      errorText={errorText}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      size={size}
      disabled={disabled}
      className={className}
      fieldClassName={fieldClassName}
    >
      <input
        ref={ref}
        id={resolvedId}
        disabled={disabled}
        className="w-full border-0 bg-transparent p-0 text-inherit placeholder:text-muted focus:outline-none"
        {...props}
      />
    </FieldShell>
  );
});
