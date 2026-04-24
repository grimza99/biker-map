"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@shared/lib";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
  contentId: string;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null
);

export function DropdownMenu({
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
  const contentId = useId();
  const resolvedOpen = open ?? uncontrolledOpen;

  const value = useMemo<DropdownMenuContextValue>(
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
      contentId,
    }),
    [contentId, onOpenChange, open, resolvedOpen]
  );

  return (
    <DropdownMenuContext.Provider value={value}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ label }: { label: string | ReactNode }) {
  const context = useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenuTrigger must be used within DropdownMenu");
  }

  return (
    <div
      aria-label="더보기 메뉴"
      onClick={() => context.setOpen(!context.open)}
      aria-expanded={context.open}
      aria-controls={context.contentId}
    >
      {label}
    </div>
  );
}

export function DropdownMenuItemList({
  className,
  align = "end",
  items,
}: {
  className?: string;
  align?: "start" | "end";
  items?: {
    label: string | ReactNode;
    value: string;
    tone?: "default" | "danger";
    onSelect?: () => void;
  }[];
}) {
  const context = useContext(DropdownMenuContext);
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!context) {
    throw new Error("DropdownMenuContent must be used within DropdownMenu");
  }

  const menu = context;

  useEffect(() => {
    if (!menu.open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        menu.close();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        menu.close();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menu]);

  if (!menu.open) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      id={menu.contentId}
      role="menu"
      className={cn(
        "absolute top-[calc(100%+10px)] z-30 min-w-56 overflow-hidden rounded-[20px] border border-border bg-panel shadow-[0_18px_50px_rgba(5,6,7,0.24)]",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      <div className="grid gap-1 p-1.5">
        {items &&
          items.map((item) => (
            <DropdownMenuItem key={item.value} {...item}>
              {item.label}
            </DropdownMenuItem>
          ))}
      </div>
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
  onSelect,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  onSelect?: () => void;
  tone?: "default" | "danger";
}) {
  const context = useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenuItem must be used within DropdownMenu");
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center rounded-[14px] px-3 py-2.5 text-left text-sm font-medium transition duration-150 ease-out",
        tone === "danger"
          ? "text-danger hover:bg-danger/10"
          : "text-text hover:bg-panel-soft hover:text-accent",
        className
      )}
      onClick={() => {
        onSelect?.();
        context.close();
      }}
    >
      {children}
    </button>
  );
}
