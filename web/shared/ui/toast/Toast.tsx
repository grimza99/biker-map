"use client";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@shared/lib";
import { Chip } from "../chips";

type ToastTone = "success" | "info" | "warning" | "danger";

const toneClassNames: Record<ToastTone, string> = {
  success: "border-active/45 bg-active/10 text-text",
  info: "border-info/45 bg-info/10 text-text",
  warning: "border-warning/45 bg-warning/10 text-text",
  danger: "border-danger/45 bg-danger/10 text-text",
};

const toneIcons: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
  info: <Info className="h-4 w-4" aria-hidden="true" />,
  warning: <TriangleAlert className="h-4 w-4" aria-hidden="true" />,
  danger: <AlertCircle className="h-4 w-4" aria-hidden="true" />,
};

export function Toast({
  title,
  description,
  tone = "info",
  action,
  onClose,
  className,
}: {
  title: string;
  description?: string;
  tone?: ToastTone;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "grid min-w-[18rem] max-w-80 gap-3 rounded-2xl border p-2 shadow-[0_18px_50px_rgba(5,6,7,0.24)] backdrop-blur-xl",
        toneClassNames[tone],
        className
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="grid gap-3">
          <Chip
            label={title}
            icon={toneIcons[tone]}
            className={toneClassNames[tone]}
          />
          {description && (
            <p className="ml-2 text-sm leading-2 text-muted">{description}</p>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            aria-label="토스트 닫기"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition duration-150 ease-out hover:bg-panel-soft hover:text-text"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {action && <div className="flex items-center justify-end">{action}</div>}
    </div>
  );
}
