"use client";

import type {
  InboxNotification,
  NotificationSourceType,
  NotificationsView,
} from "@package-shared/types/notification";
import { cn } from "@shared/lib";
import { Button, PageWrapper } from "@shared/ui";

import {
  NotificationCard,
  useNotifications,
  useReadAllNotifications,
} from "@/features/notifications";
import { notificationSourceTabs, notificationsfilterTabs } from "@package-shared/model";
import { buildCursor } from "@shared/api/request";
import { Pagination } from "@shared/ui";
import { CheckCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function NotificationsPage() {
  const [view, setView] = useState<NotificationsView>("all");
  const [sourceType, setSourceType] = useState<NotificationSourceType | "all">(
    "all"
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filters = useMemo(
    () => ({
      view,
      sourceType: sourceType === "all" ? undefined : sourceType,
      limit: pageSize,
      cursor: buildCursor((page - 1) * pageSize),
    }),
    [page, sourceType, view]
  );
  const { data, isLoading, isError, error } = useNotifications(filters);
  const { mutateAsync: readAll, isPending: isReadAllPending } =
    useReadAllNotifications(filters);

  const notifications = data?.data.items ?? [];
  const unreadCount = data?.data.unreadCount ?? 0;
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [sourceType, view]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <PageWrapper className="p-6" innerClassName="gap-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text">
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
          <Button
            key={tab.key}
            variant={tab.buttonVariant}
            className={cn(
              "inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium transition duration-150 ease-out hover:-translate-y-0.5",
              view === tab.key
                ? "bg-accent text-text shadow-[0_10px_24px_var(--shadow-accent)]"
                : "border border-border bg-panel-solid text-text"
            )}
            onClick={() => setView(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3" aria-label="알림 출처 필터">
        {notificationSourceTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={sourceType === tab.key ? "primary" : "secondary"}
            onClick={() => setSourceType(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {!isLoading && !isError && (
        <div className="mt-5 grid gap-5">
          <div className="grid gap-3">
            {groupNotifications(notifications).map((item) => {
              return <NotificationCard key={item.id} n={item} />;
            })}
          </div>

          {total > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
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
