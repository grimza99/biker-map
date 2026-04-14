import { cn } from "@/shared";
import {
  InboxNotification,
  notificationskindMeta,
} from "@package-shared/index";
import { Bell } from "lucide-react";
import { useReadNotification } from "../model/use-notifications";

const toneClass: Record<"accent" | "neutral" | "danger", string> = {
  accent:
    "inline-flex items-center rounded-full bg-active/10 px-2.5 py-1 text-[12px] font-semibold text-accent-strong",
  neutral:
    "inline-flex items-center rounded-full bg-panel-soft/60 px-2.5 py-1 text-[12px] font-semibold text-text",
  danger:
    "inline-flex items-center rounded-full bg-danger/10 px-2.5 py-1 text-[12px] font-semibold text-danger",
};
interface NotificationCardProps {
  n: InboxNotification;
}

export function NotificationCard({ n }: NotificationCardProps) {
  const { id, title, message, timeLabel, unread, area, kind } = n;
  const meta = notificationskindMeta[kind];
  const { mutateAsync: readN, isPending: isReadNPending } =
    useReadNotification();

  return (
    <article
      key={id}
      className={cn(
        "grid gap-3 rounded-[18px] border bg-panel p-4 shadow-[0_8px_24px_var(--shadow)] transition duration-150 ease-out",
        unread ? "border-active/40 ring-1 ring-active/10" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={toneClass[meta.tone]}>{meta.badge}</span>
        <span className="text-sm text-muted">{timeLabel}</span>
      </div>

      <h3 className="m-0 text-lg font-semibold tracking-[-0.03em] text-text">
        {title}
      </h3>
      <p className="m-0 text-sm leading-7 text-muted">{message}</p>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted">{area}</span>
        <div className="flex items-center gap-3">
          {unread ? (
            <>
              <button
                type="button"
                className="rounded-full border border-border bg-panel-solid px-3 py-1.5 text-xs font-medium text-text transition hover:-translate-y-0.5"
                onClick={() => readN(id)}
                disabled={isReadNPending}
              >
                읽음 처리
              </button>
              <span
                className="h-2.5 w-2.5 rounded-full bg-accent"
                aria-label="읽지 않음"
              />
            </>
          ) : (
            <span className="inline-flex items-center gap-2 text-xs text-muted">
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              읽음 완료
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
