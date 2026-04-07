"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

import { cn } from "@shared/lib";

import { Button } from "../button";

type TabsValue = string;

type TabsContextValue = {
  value: TabsValue;
  setValue: (value: TabsValue) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

/**-------------------------------------------------------- tabs ----------------------------------------------  */
export type TabsProps = {
  value?: TabsValue;
  defaultValue?: TabsValue;
  children: ReactNode;
  className?: string;
  onValueChange?: (value: TabsValue) => void;
};

export function Tabs({
  value,
  defaultValue,
  children,
  className,
  onValueChange,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? ""
  );
  const resolvedValue = value ?? uncontrolledValue;

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value: resolvedValue,
      setValue(nextValue) {
        if (value === undefined) {
          setUncontrolledValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
    }),
    [onValueChange, resolvedValue, value]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("grid gap-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = {
  items: { value: TabsValue; label: ReactNode }[];
  tabItemClassName?: string;
  className?: string;
};

export function TabsList({
  items,
  className,
  tabItemClassName,
}: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border border-border bg-panel-solid p-1",
        className
      )}
    >
      {items.map((item) => (
        <TabsTrigger
          key={item.value}
          value={item.value}
          className={tabItemClassName}
        >
          {item.label}
        </TabsTrigger>
      ))}
    </div>
  );
}

/**-------------------------------------------------------- trigger ----------------------------------------------  */
type TabsTriggerProps = {
  value: TabsValue;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

function TabsTrigger({
  value,
  children,
  className,
  disabled,
}: TabsTriggerProps) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const selected = context.value === value;

  return (
    <Button
      type="button"
      role="tab"
      variant="secondary"
      size="sm"
      selected={selected}
      disabled={disabled}
      aria-selected={selected}
      onClick={() => context.setValue(value)}
      className={cn("px-3.5", className)}
    >
      {children}
    </Button>
  );
}
/**-------------------------------------------------------- content ----------------------------------------------  */

export type TabsContentProps = {
  value: TabsValue;
  children: ReactNode;
  className?: string;
  forceMount?: boolean;
};

export function TabsContent({
  value,
  children,
  className,
  forceMount = false,
}: TabsContentProps) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  if (!forceMount && context.value !== value) {
    return null;
  }

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}
