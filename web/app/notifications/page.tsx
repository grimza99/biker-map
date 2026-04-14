"use client";

import {
  type InboxNotification,
  type NotificationsView,
  notificationsfilterTabs,
} from "@package-shared/index";
import { CheckCheck } from "lucide-react";
import { startTransition, useMemo, useState } from "react";

import {
  NotificationCard,
  useNotifications,
  useReadAllNotifications,
} from "@/features/notifications";
import { cn } from "@shared/lib";
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageWrapper,
} from "@shared/ui";

const mockNotifications: InboxNotification[] = [
  {
    id: "1",
    kind: "comment",
    title: "새 댓글이 달렸습니다",
    message: "사용자123님이 내 게시글에 댓글을 남겼습니다.",
    timeLabel: "5분 전",
    unread: true,
    area: "게시글 제목 예시",
  },
  {
    id: "2",
    kind: "reply",
    title: "새 답글이 달렸습니다",
    message: "사용자456님이 내 댓글에 답글을 남겼습니다.",
    timeLabel: "10분 전",
    unread: false,
    area: "댓글 내용 예시",
  },
  {
    id: "3",
    kind: "reply",
    title: "새 답글이 달렸습니다",
    message: "3번",
    timeLabel: "10분 전",
    unread: true,
    area: "댓글 내용 예시",
  },
];
export default function NotificationsPage() {
  const [view, setView] = useState<NotificationsView>("all");
  const filters = useMemo(() => ({ view, limit: 30 }), [view]);
  const { data, isLoading, isError, error } = useNotifications(filters);
  const { mutateAsync: readAll, isPending: isReadAllPending } =
    useReadAllNotifications(filters);

  // const notifications = data?.data.items ?? [];
  const notifications = mockNotifications;
  const unreadCount = data?.data.unreadCount ?? 0;

  return (
    <PageWrapper className="p-6" innerClassName="gap-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.04em] text-text">
            알림
          </h1>
          <p className="mt-3 max-w-[60ch] text-sm leading-7 text-muted">
            {unreadCount}개의 알림
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          disabled={unreadCount === 0 || isReadAllPending}
          onClick={() => readAll()}
        >
          <CheckCheck className="h-4 w-4" aria-hidden="true" />
          모두 읽음
        </Button>
      </div>

      <div className="flex flex-wrap gap-3" aria-label="알림 필터">
        {notificationsfilterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => startTransition(() => setView(tab.key))}
            className={cn(
              "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition duration-150 ease-out hover:-translate-y-0.5",
              view === tab.key
                ? "bg-accent text-text shadow-[0_10px_24px_var(--shadow-accent)]"
                : "border border-border bg-panel-solid text-text"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState label="알림을 불러오는 중" />}

      {isError && (
        <ErrorState
          title="알림을 불러오지 못했습니다"
          message={error instanceof Error ? error.message : undefined}
        />
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState title="새 알림이 없습니다" />
      )}

      {!isLoading && !isError && (
        <div className="mt-5 grid gap-5">
          <div className="grid gap-3">
            {groupNotifications(notifications).map((item) => {
              return <NotificationCard key={item.id} n={item} />;
            })}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

function groupNotifications(items: InboxNotification[]) {
  const unread = items.filter((item) => item.unread);
  const read = items.filter((item) => !item.unread);

  return [...unread, ...read];
}
