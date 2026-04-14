import Link from "next/link";

import { cn, DefaultCardContainer } from "@/shared";
import {
  InboxNotification,
  notificationskindMeta,
} from "@package-shared/index";
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
  const { id, title, message, timeLabel, unread, url, kind } = n;
  const meta = notificationskindMeta[kind];
  const { mutateAsync: readN, isPending: isReadNPending } =
    useReadNotification();

  const card = (
    <DefaultCardContainer
      className={cn(
        "grid gap-3 border-2 rounded-2xl p-3 shadow-[0_8px_24px_var(--shadow)] transition duration-150 ease-out",
        unread ? "border-active/40 ring-1 ring-active/10" : "border-border",
        url ? "cursor-pointer hover:-translate-y-0.5" : ""
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={toneClass[meta.tone]}>{meta.badge}</span>
          <span className="text-sm text-muted">{timeLabel}</span>
        </div>
        {unread && (
          <>
            <button
              type="button"
              className="rounded-full border border-border bg-panel-solid px-3 py-1.5 text-xs font-medium text-text transition hover:-translate-y-0.5"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void readN(id);
              }}
              disabled={isReadNPending}
            >
              읽음 처리
            </button>
          </>
        )}
      </div>

      <h3 className="m-0 text-lg font-semibold tracking-[-0.03em] text-text">
        {title}
      </h3>
      <p className="m-0 text-sm leading-7 text-muted">{message}</p>

      <div className="flex items-center justify-end gap-3"></div>
    </DefaultCardContainer>
  );

  if (!url) {
    return card;
  }

  return (
    <Link href={url} className="block">
      {card}
    </Link>
  );
}
