"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const [isMounted, setIsMounted] = useState(false);
  const timeoutMapRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    setIsMounted(true);

    return () => {
      timeoutMapRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timeoutMapRef.current.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutMapRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMapRef.current.delete(id);
    }

    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ durationMs = 3200, ...payload }: ToastPayload) => {
      const id = createToastId();
      setToasts((previous) => [...previous, { id, ...payload }]);

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, durationMs);

      timeoutMapRef.current.set(id, timeoutId);
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
      {isMounted
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] flex justify-end p-5">
              <div className="flex max-w-[calc(100vw-2.5rem)] flex-col gap-3">
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
              </div>
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
