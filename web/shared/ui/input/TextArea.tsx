import { cn } from "@/shared/lib";
import { forwardRef, TextareaHTMLAttributes, useId } from "react";
import { FieldBaseProps, FieldShell } from "./FieldShell";

export type TextareaProps = FieldBaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      fieldClassName,
      helperText,
      errorText,
      label,
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
        size={size}
        disabled={disabled}
        className={className}
        fieldClassName={cn("items-start py-3", fieldClassName)}
      >
        <textarea
          ref={ref}
          id={resolvedId}
          disabled={disabled}
          className="min-h-30 maxh-h-50 overflow-y-auto w-full resize-none border-0 bg-transparent p-0 text-inherit placeholder:text-muted focus:outline-none "
          {...props}
        />
      </FieldShell>
    );
  }
);
