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

type SidePanelContextValue = {
  open: boolean;
  setOpen: (nextOpen: boolean) => void;
  close: () => void;
  id: string;
};

const SidePanelContext = createContext<SidePanelContextValue | null>(null);

export function SidePanel({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const id = useId();
  const resolvedOpen = open ?? uncontrolledOpen;

  const contextValue = useMemo<SidePanelContextValue>(
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
    [, onOpenChange, open, resolvedOpen, id]
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
    <SidePanelContext.Provider value={contextValue}>
      {children}
    </SidePanelContext.Provider>
  );
}

type SidePanelTriggerChildProps = {
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
};

export function SidePanelTrigger({
  asChild = false,
  children,
  onClick,
  type = "button",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
}) {
  const context = useContext(SidePanelContext);

  if (!context) {
    throw new Error("SidePanelTrigger must be used within SidePanel");
  }

  if (asChild && isValidElement<SidePanelTriggerChildProps>(children)) {
    return cloneElement(children, {
      className: cn(children.props.className, props.className),
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        children.props.onClick?.(event);
        onClick?.(event as never);

        if (!event.defaultPrevented) {
          context.setOpen(true);
        }
      },
    } satisfies SidePanelTriggerChildProps);
  }

  return (
    <button
      type={type}
      disabled={disabled}
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          context.setOpen(true);
        }
      }}
    >
      {children}
    </button>
  );
}

export function SidePanelContent({
  children,
  className,
  closeOnBackdropClick = true,
  widthClassName = "w-[min(32rem,100vw)]",
  title,
}: {
  children: ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
  widthClassName?: string;
  title: string | ReactNode;
}) {
  const context = useContext(SidePanelContext);

  if (!context || !context.open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="사이드 패널 닫기"
        className="absolute inset-0 bg-bg/72 backdrop-blur-sm"
        onClick={closeOnBackdropClick ? context.close : undefined}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={context.id}
        className={cn(
          "relative z-10 flex h-full flex-col border-l border-border bg-panel shadow-[-24px_0_60px_rgba(5,6,7,0.34)] animate-[side-panel-in_180ms_ease-out]",
          widthClassName,
          className
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b border-border px-5 py-4",
            className
          )}
        >
          {title}
          <SidePanelClose />
        </div>
        {children}
      </section>
    </div>,
    document.body
  );
}

export function SidePanelBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-5 py-5", className)}>
      {children}
    </div>
  );
}

export function SidePanelFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border px-5 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SidePanelCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  label?: ReactNode | string;
}
export function SidePanelClose({
  className,
  label,
  ...props
}: SidePanelCloseProps) {
  const context = useContext(SidePanelContext);

  if (!context) {
    throw new Error("SidePanelClose must be used within SidePanel");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="사이드 패널 닫기"
      className={cn("text-text hover:text-accent", className)}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        context.close();
      }}
    >
      <>{label ? label : <X className="h-4 w-4" aria-hidden="true" />}</>
    </Button>
  );
}
