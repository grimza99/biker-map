"use client";

import { X } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@shared/lib";

import { Button } from "../button";

type DialogContextValue = {
  open: boolean;
  setOpen: (nextOpen: boolean) => void;
  close: () => void;
  id: string;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const id = useId();

  const resolvedOpen = open ?? uncontrolledOpen;

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      open: resolvedOpen,
      setOpen(nextOpen) {
        if (open === undefined) {
          setUncontrolledOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
      },
      close() {
        if (open === undefined) {
          setUncontrolledOpen(false);
        }

        onOpenChange?.(false);
      },
      id,
    }),
    [onOpenChange, open, resolvedOpen, id]
  );

  useEffect(() => {
    if (!resolvedOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        contextValue.close();
      }
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [contextValue, resolvedOpen]);

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

type DialogTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
};

type DialogTriggerChildProps = {
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
};

export function DialogTrigger({
  asChild = false,
  children,
  onClick,
  type = "button",
  disabled,
  ...props
}: DialogTriggerProps) {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("DialogTrigger must be used within Dialog");
  }

  const dialog = context;

  function handleClick(event: ReactMouseEvent<HTMLButtonElement>) {
    onClick?.(event);

    if (!event.defaultPrevented) {
      dialog.setOpen(true);
    }
  }

  if (asChild && isValidElement<DialogTriggerChildProps>(children)) {
    return cloneElement(children, {
      className: cn(children.props.className, props.className),
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        children.props.onClick?.(event);
        onClick?.(event as never);

        if (!event.defaultPrevented) {
          dialog.setOpen(true);
        }
      },
    } satisfies DialogTriggerChildProps);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        handleClick(event);
      }}
    >
      {children}
    </button>
  );
}

type DialogContentProps = {
  children: ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
  size?: "sm" | "md" | "lg";
};

const dialogSizeClassName: Record<
  NonNullable<DialogContentProps["size"]>,
  string
> = {
  sm: "max-w-[26rem]",
  md: "max-w-[34rem]",
  lg: "max-w-[42rem]",
};

export function DialogContent({
  children,
  className,
  closeOnBackdropClick = true,
  size = "md",
}: DialogContentProps) {
  const context = useContext(DialogContext);

  if (!context || !context.open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 cursor-default bg-bg/74 backdrop-blur-sm"
        onClick={closeOnBackdropClick ? context.close : undefined}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={context.id}
        className={cn(
          "relative z-10 w-full max-h-[calc(100vh-10%)] overflow-y-scroll rounded-2xl  bg-panel-solid shadow-[(--shadow)]",
          dialogSizeClassName[size],
          className
        )}
      >
        {children}
      </section>
    </div>,
    document.body
  );
}

export function DialogHeader({
  title,
  className,
}: {
  title: string | ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex text-xl items-start justify-between gap-4 px-6 py-4",
        className
      )}
    >
      {title}
      <DialogClose className="h-fit w-fit" />
    </div>
  );
}

export function DialogBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 px-5 py-5", className)}>{children}</div>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 px-5 py-4", className)}
    >
      {children}
    </div>
  );
}

interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: ReactNode;
  className?: string;
}
export function DialogClose({ label, className, ...props }: DialogCloseProps) {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("DialogClose must be used within Dialog");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="모달 닫기"
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        context.close();
      }}
      className={className}
    >
      {label ? label : <X className="h-4 w-4" aria-hidden="true" />}
    </Button>
  );
}
