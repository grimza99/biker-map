"use client";
import { cn } from "@/shared/lib";
import { ChevronDown, Dot } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  FieldBaseProps,
  fieldDisabledClassName,
  fieldInteractiveClassName,
  fieldSizeClassNames,
  fieldToneClassName,
  resolveMessage,
} from "./FieldShell";
import { InputProps } from "./Input";

export type SelectInputProps = Omit<InputProps, "rightIcon" | "readOnly">;
export type SelectOption = {
  label: string;
  value: string;
};

export type SelectFieldProps = Omit<
  FieldBaseProps,
  "leftIcon" | "rightIcon"
> & {
  id?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
};

export function SelectInput({
  className,
  fieldClassName,
  helperText,
  errorText,
  label,
  size = "md",
  id,
  disabled,
  placeholder = "선택하세요",
  value,
  defaultValue,
  onValueChange,
  options,
}: SelectFieldProps) {
  const fallbackId = useId();
  const resolvedId = id ?? fallbackId;
  const [open, setOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? ""
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedValue = value ?? uncontrolledValue;
  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(nextValue: string) {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onValueChange?.(nextValue);
    setOpen(false);
  }

  const message = resolveMessage(errorText, helperText);

  return (
    <div ref={containerRef} className={cn("grid gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={resolvedId}
          className={cn(
            "text-[13px] font-semibold leading-[1.3] tracking-[0.01em]",
            errorText ? "text-danger" : "text-text"
          )}
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        <button
          id={resolvedId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (!disabled) {
              setOpen((current) => !current);
            }
          }}
          className={cn(
            "group inline-flex w-full items-center gap-2.5 overflow-hidden text-left",
            fieldToneClassName,
            disabled ? fieldDisabledClassName : fieldInteractiveClassName,
            errorText &&
              "border-danger bg-danger/5 focus-within:border-danger focus-within:ring-danger/55 hover:border-danger/80",
            fieldSizeClassNames[size],
            fieldClassName
          )}
        >
          <span
            className={cn(
              "flex-1 truncate",
              selectedOption ? "text-text" : "text-muted"
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted transition duration-150 ease-out group-focus-within:text-accent",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {open ? (
          <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-full overflow-hidden rounded-[18px] border border-border bg-panel shadow-[0_18px_50px_rgba(5,6,7,0.24)]">
            <ul role="listbox" className="grid p-1.5">
              {options.map((option) => {
                const isSelected = option.value === selectedValue;

                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-sm transition duration-150 ease-out",
                        isSelected
                          ? "bg-accent/15 text-text"
                          : "text-muted hover:bg-panel-soft hover:text-text"
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <span>{option.label}</span>
                      {isSelected ? (
                        <Dot
                          className="h-7 w-7 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      {message ? (
        <span
          className={cn("text-xs font-medium leading-5", message.className)}
        >
          {message.text}
        </span>
      ) : null}
    </div>
  );
}
