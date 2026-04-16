"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { Toast } from "./Toast";

type ToastTone = "success" | "info" | "warning" | "danger";

type ToastPayload = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = ToastPayload & {
  id: string;
};

type ToastContextValue = {
  showToast: (payload: ToastPayload) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ durationMs = 3200, ...payload }: ToastPayload) => {
      const id = createToastId();
      setToasts((previous) => [...previous, { id, ...payload }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, durationMs);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined"
        ? createPortal(
            <div className="pointer-events-none fixed right-5 top-5 z-[200] flex max-w-[calc(100vw-2.5rem)] flex-col gap-3">
              {toasts.map((toast) => (
                <Toast
                  key={toast.id}
                  title={toast.title}
                  description={toast.description}
                  tone={toast.tone}
                  onClose={() => dismissToast(toast.id)}
                  className="pointer-events-auto"
                />
              ))}
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
