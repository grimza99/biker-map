"use client";
import { cn } from "@/shared/lib";
import { ReactNode } from "react";

type FieldSize = "sm" | "md" | "lg";

export type FieldBaseProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: FieldSize;
  className?: string;
  fieldClassName?: string;
};

export const fieldSizeClassNames: Record<FieldSize, string> = {
  sm: "min-h-9 rounded-[12px] px-3 text-sm",
  md: "min-h-11 rounded-[14px] px-3.5 text-sm",
  lg: "min-h-13 rounded-[16px] px-4 text-base",
};

export const fieldToneClassName =
  "border border-border bg-panel text-text shadow-[0_10px_24px_rgba(5,6,7,0.12)] transition duration-150 ease-out";

export const fieldInteractiveClassName =
  "hover:border-accent/50 hover:bg-panel-solid focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/65 focus-within:ring-offset-2 focus-within:ring-offset-bg";

export const fieldDisabledClassName =
  "border-border/60 bg-panel-soft text-muted opacity-65";

export function FieldShell({
  id,
  label,
  helperText,
  errorText,
  disabled,
  size = "md",
  leftIcon,
  rightIcon,
  className,
  fieldClassName,
  children,
}: FieldBaseProps & {
  id: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const message = resolveMessage(errorText, helperText);

  return (
    <label htmlFor={id} className={cn("grid gap-1.5", className)}>
      {label && (
        <span
          className={cn(
            "text-[13px] font-semibold leading-[1.3] tracking-[0.01em]",
            errorText ? "text-danger" : "text-text"
          )}
        >
          {label}
        </span>
      )}

      <div
        className={cn(
          "group inline-flex w-full items-center gap-2.5 overflow-hidden",
          fieldToneClassName,
          disabled ? fieldDisabledClassName : fieldInteractiveClassName,
          errorText &&
            "border-danger bg-danger/5 focus-within:border-danger focus-within:ring-danger/55 hover:border-danger/80",
          fieldSizeClassNames[size],
          fieldClassName
        )}
      >
        {leftIcon ? (
          <span className="shrink-0 text-muted group-focus-within:text-accent">
            {leftIcon}
          </span>
        ) : null}
        {children}
        {rightIcon ? (
          <span className="shrink-0 text-muted group-focus-within:text-accent">
            {rightIcon}
          </span>
        ) : null}
      </div>

      {message ? (
        <span
          className={cn("text-xs font-medium leading-5", message.className)}
        >
          {message.text}
        </span>
      ) : null}
    </label>
  );
}
export function resolveMessage(errorText?: string, helperText?: string) {
  if (errorText) {
    return {
      text: errorText,
      className: "text-danger",
    };
  }

  if (helperText) {
    return {
      text: helperText,
      className: "text-muted",
    };
  }

  return null;
}
